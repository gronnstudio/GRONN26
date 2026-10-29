import "server-only"
import { BlobNotFoundError, BlobPreconditionFailedError, get, head, put } from "@vercel/blob"

// Eén plek waar het CRM leest en schrijft (ADR 0001, eigenaar 29 okt 2026:
// "Blob nu, Postgres later"). Elk onderdeel is één JSON-document in de privé
// Blob-store. Wie later naar Postgres gaat, vervangt alleen dit bestand.
//
// - Met BLOB_READ_WRITE_TOKEN: Vercel Blob, schrijven met ifMatch op de ETag,
//   zodat twee gelijktijdige wijzigingen elkaar niet stil overschrijven.
// - Met CRM_LOKAAL=1 (tests en lokaal werken): een map op schijf.
// - Zonder beide: lezen geeft de startwaarde, schrijven faalt met een duidelijke fout.

const LOKAAL = () => process.env.CRM_LOKAAL === "1" && process.env.VERCEL !== "1"
export const opslagAan = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN) || LOKAAL()

async function lokaalPad(pad: string) {
  const { join } = await import("node:path")
  return join(process.cwd(), ".crm-data", pad.replace(/[^a-z0-9/._-]/gi, "_"))
}

type Gelezen<T> = { data: T; etag?: string; bestaat: boolean }

async function lees<T>(pad: string, start: () => T): Promise<Gelezen<T>> {
  if (LOKAAL()) {
    const { readFile } = await import("node:fs/promises")
    try {
      return { data: JSON.parse(await readFile(await lokaalPad(pad), "utf8")) as T, bestaat: true }
    } catch {
      return { data: start(), bestaat: false }
    }
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) return { data: start(), bestaat: false }
  // De ETag voor ifMatch komt uit head(), de API-metadata. De ETag die get()
  // teruggeeft komt van de download en past niet op put({ ifMatch }): elke
  // wijziging faalde daarop (29 okt 2026). Head eerst: schrijft iemand daarna
  // nog, dan faalt put en leest wijzigJson opnieuw.
  const meta = await head(pad).catch((fout) => {
    if (fout instanceof BlobNotFoundError) return null
    throw fout
  })
  if (!meta) return { data: start(), bestaat: false }
  const r = await get(pad, { access: "private", useCache: false })
  if (!r?.stream) return { data: start(), bestaat: false }
  return { data: (await new Response(r.stream).json()) as T, etag: meta.etag, bestaat: true }
}

export async function leesJson<T>(pad: string, start: () => T): Promise<T> {
  try {
    return (await lees(pad, start)).data
  } catch {
    return start()
  }
}

async function schrijf(pad: string, data: unknown, etag?: string) {
  if (LOKAAL()) {
    const { mkdir, writeFile } = await import("node:fs/promises")
    const { dirname } = await import("node:path")
    const p = await lokaalPad(pad)
    await mkdir(dirname(p), { recursive: true })
    await writeFile(p, JSON.stringify(data))
    return
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("Opslag staat uit: zet BLOB_READ_WRITE_TOKEN.")
  await put(pad, JSON.stringify(data), {
    access: "private",
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: "application/json",
    ...(etag ? { ifMatch: etag } : {}),
  })
}

export async function schrijfJson(pad: string, data: unknown) {
  await schrijf(pad, data)
}

/**
 * Lees, pas aan, schrijf terug: als iemand er tussendoor schreef, één keer
 * opnieuw op de nieuwe stand. `f` mag het document muteren of een nieuw teruggeven.
 */
export async function wijzigJson<T>(pad: string, start: () => T, f: (d: T) => T | void): Promise<T> {
  for (let poging = 0; poging < 2; poging++) {
    const { data, etag } = await lees(pad, start)
    const nieuw = (f(data) ?? data) as T
    try {
      await schrijf(pad, nieuw, etag)
      return nieuw
    } catch (fout) {
      if (fout instanceof BlobPreconditionFailedError && poging === 0) continue
      throw fout
    }
  }
  throw new Error("Kon niet bewaren: de gegevens veranderden tegelijk. Probeer het opnieuw.")
}

/** Binaire bestanden (foto's): privé, alleen via een route achter de inlog te zien. */
export async function bewaarBestand(pad: string, inhoud: Buffer, type: string) {
  if (LOKAAL()) {
    const { mkdir, writeFile } = await import("node:fs/promises")
    const { dirname } = await import("node:path")
    const p = await lokaalPad(pad)
    await mkdir(dirname(p), { recursive: true })
    await writeFile(p, inhoud)
    return
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("Opslag staat uit.")
  await put(pad, inhoud, { access: "private", addRandomSuffix: false, contentType: type })
}

export async function leesBestand(pad: string): Promise<ReadableStream<Uint8Array> | null> {
  if (LOKAAL()) {
    const { readFile } = await import("node:fs/promises")
    try {
      const b = await readFile(await lokaalPad(pad))
      return new Response(b).body
    } catch {
      return null
    }
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null
  const r = await get(pad, { access: "private" }).catch(() => null)
  return r?.stream ?? null
}
