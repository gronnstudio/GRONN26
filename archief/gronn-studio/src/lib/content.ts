import { unstable_cache } from "next/cache"

import fallback from "../../content/site-content.json"

import type { SiteContent } from "@/lib/content-types"

// Server-side content loader — the single source the site renders from.
//
// Resolution order:
//   1. published document in Vercel Blob — public URL first (CDN),
//      then an authenticated SDK read (private stores);
//   2. the committed content/site-content.json fallback (local dev,
//      first deploy, disaster recovery) — site behaves exactly as
//      before the editor existed.
// The blob read is wrapped in unstable_cache tagged "content", so a
// publish (revalidateTag) makes edits live in seconds while normal
// traffic serves from cache.
const CONTENT_PATH = "content/site-content.json"

function derivedPublicUrl(): string | null {
  if (process.env.CONTENT_BLOB_URL) return process.env.CONTENT_BLOB_URL
  const storeId = process.env.BLOB_STORE_ID
  if (!storeId) return null
  const host = storeId.replace(/^store_/, "").toLowerCase()
  return `https://${host}.public.blob.vercel-storage.com/${CONTENT_PATH}`
}

async function readPublished(): Promise<SiteContent | null> {
  const publicUrl = derivedPublicUrl()
  if (publicUrl) {
    try {
      const res = await fetch(publicUrl, { cache: "no-store" })
      if (res.ok) return (await res.json()) as SiteContent
    } catch {
      // fall through — try the authenticated read
    }
  }
  if (process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { get } = await import("@vercel/blob")
      const result = await get(CONTENT_PATH, {
        access: "private",
        useCache: false,
      })
      if (result) {
        return JSON.parse(
          await new Response(result.stream).text()
        ) as SiteContent
      }
    } catch {
      // fall through to the committed document
    }
  }
  return null
}

const cachedPublished = unstable_cache(readPublished, ["site-content"], {
  tags: ["content"],
})

// Per-entry counterpart of the top-level shallow merge below: published
// entries win field-by-field, but a field the code shipped AFTER the
// document was last published (e.g. a project's `outcomes`) is filled
// from the committed fallback instead of vanishing until the next
// Publish. Entries only the published document knows keep their place;
// fallback-only entries are appended.
function mergeBySlug<T extends { slug: string }>(
  fallbackList: T[],
  publishedList?: T[]
): T[] {
  if (!publishedList) return fallbackList
  const bySlug = new Map(fallbackList.map((entry) => [entry.slug, entry]))
  const merged = publishedList.map((entry) => {
    const base = bySlug.get(entry.slug)
    return base ? { ...base, ...entry } : entry
  })
  for (const entry of fallbackList) {
    if (!publishedList.some((p) => p.slug === entry.slug)) merged.push(entry)
  }
  return merged
}

export async function getContent(): Promise<SiteContent> {
  const published = await cachedPublished()
  const base = fallback as SiteContent
  if (!published) return base
  // Shallow-merge: when the code gains a new top-level content section
  // that an already-published document doesn't have yet, the committed
  // fallback fills the gap instead of crashing the pages. The next
  // Publish writes the merged document and closes the gap for good.
  return {
    ...base,
    ...published,
    // home is one flat object of many keys — key-level merge so a field
    // the code ships after the last Publish (e.g. testimonials) is
    // filled from the fallback instead of vanishing.
    home: { ...base.home, ...published.home },
    projects: mergeBySlug(base.projects, published.projects),
    articles: mergeBySlug(base.articles, published.articles),
    services: mergeBySlug(base.services, published.services),
  }
}

export async function getProjectContent(slug: string) {
  const { projects } = await getContent()
  return projects.find((p) => p.slug === slug)
}

export async function getArticleContent(slug: string) {
  const { articles } = await getContent()
  return articles.find((a) => a.slug === slug)
}

export async function getServiceContent(slug: string) {
  const { services } = await getContent()
  return services.find((s) => s.slug === slug)
}
