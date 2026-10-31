import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { join } from "node:path"

import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Locator, type Page } from "@playwright/test"

import { checklist } from "@/components/gronn/checklist-lijst"
import {
  FORMSUBMIT_ENDPOINT,
  DUBBELE_OPTIN,
  MAILERLITE,
  mailerliteUrl,
  modus,
  nieuwsbriefZichtbaar,
  ONDERWERP,
  verzoek,
  ZICHTBAAR,
} from "@/lib/nieuwsbrief"

// De maillijst met de checklist vooraf (src/lib/nieuwsbrief.ts).
//
// DE VLAG. Alle zichtbare plekken hangen aan `nieuwsbriefZichtbaar()`,
// die bij het BOUWEN wordt gelezen. CI bouwt met NIEUWSBRIEF_ZICHTBAAR=1
// (quality.yml), zodat deze spec de blokken echt ziet. Een build zonder
// die variabele (productie zolang ZICHTBAAR false is) laat de "aan"-tests
// over en bewijst in plaats daarvan dat er niets te zien is.
//
// NOOIT NETWERK. Elke verzending wordt met page.route afgevangen; FormSubmit
// en MailerLite krijgen niets.

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]

let aan = false
test.beforeAll(async ({ playwright }, info) => {
  const ctx = await playwright.request.newContext({ baseURL: info.project.use.baseURL })
  aan = (await ctx.get("/nl/checklist")).status() === 200
  await ctx.dispose()
})

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("gronn-intro", "1"))
})

/** Vangt FormSubmit en MailerLite af; allebei antwoorden ze `status`. */
async function vang(page: Page, status = 200) {
  const formsubmit: Record<string, string>[] = []
  const mailerlite: { url: string; velden: URLSearchParams }[] = []
  await page.route("https://formsubmit.co/**", async (route) => {
    formsubmit.push(JSON.parse(route.request().postData() ?? "{}"))
    await route.fulfill({
      status,
      contentType: "application/json",
      body: status === 200 ? '{"success":"true"}' : '{"success":"false"}',
    })
  })
  await page.route("https://assets.mailerlite.com/**", async (route) => {
    mailerlite.push({ url: route.request().url(), velden: new URLSearchParams(route.request().postData() ?? "") })
    await route.fulfill({
      status,
      contentType: "application/json",
      body: status === 200 ? '{"success":true}' : '{"success":false}',
    })
  })
  return { formsubmit, mailerlite }
}

// ── Zonder netwerk en zonder build: de configuratie ───────────────────

test.describe("configuratie", () => {
  test.skip(({ isMobile }) => isMobile, "geen browser nodig; één keer is genoeg")

  // Nicks embed-code van 24 sep 2026. Wijkt de URL hiervan af, dan komt
  // er niets in zijn MailerLite aan — daarom letterlijk de action uit
  // die code.
  test("met Nicks ID's is het MailerLite, precies de action uit zijn embed-code; de vlag staat aan", () => {
    expect(MAILERLITE).toEqual({ accountId: "2657100", formId: "199473671017858334" })
    expect(modus()).toBe("mailerlite")
    expect(mailerliteUrl(MAILERLITE)).toBe("https://assets.mailerlite.com/jsonp/2657100/forms/199473671017858334/subscribe")
    expect(DUBBELE_OPTIN).toBe(true)
    // Live sinds Nick het zei (checklist, privacyzin, MailerLite en de
    // automatisering met de checklistmail): overal aan, ook in productie.
    expect(ZICHTBAAR).toBe(true)
    expect(nieuwsbriefZichtbaar({})).toBe(true)
    expect(nieuwsbriefZichtbaar({ VERCEL_ENV: "production" })).toBe(true)
    expect(nieuwsbriefZichtbaar({ VERCEL_ENV: "preview" })).toBe(true)
    expect(nieuwsbriefZichtbaar({ NIEUWSBRIEF_ZICHTBAAR: "1" })).toBe(true)
  })

  test("met ID's post het formulier naar MailerLite, met fields[email]", async () => {
    const cfg = { accountId: "123456", formId: "987654321" }
    expect(modus(cfg)).toBe("mailerlite")
    expect(modus({ accountId: "123456", formId: null })).toBe("formsubmit")
    const v = verzoek("iemand@voorbeeld.nl", { cfg, locale: "nl", plek: "home" })
    expect(v.modus).toBe("mailerlite")
    expect(v.url).toBe("https://assets.mailerlite.com/jsonp/123456/forms/987654321/subscribe")
    expect(v.url).toBe(mailerliteUrl(cfg))
    expect(v.init.method).toBe("POST")
    const body = new URLSearchParams(String(v.init.body))
    expect(body.get("fields[email]")).toBe("iemand@voorbeeld.nl")
    expect(body.get("ml-submit")).toBe("1")
    expect(body.get("anticsrf")).toBe("true")
    // Niets van het FormSubmit-verzoek lekt mee.
    expect(v.url).not.toContain("formsubmit")
  })

  test("zonder ID's gaat hetzelfde adres naar FormSubmit, onderwerp 'Checklist aangevraagd'", () => {
    const v = verzoek("iemand@voorbeeld.nl", { cfg: { accountId: null, formId: null }, locale: "en", plek: "voet" })
    expect(v.modus).toBe("formsubmit")
    expect(v.url).toBe(FORMSUBMIT_ENDPOINT)
    expect(v.url).toBe("https://formsubmit.co/ajax/hello@gronn.studio")
    const body = JSON.parse(String(v.init.body))
    expect(body._subject).toBe(ONDERWERP)
    expect(ONDERWERP).toBe("Checklist aangevraagd")
    expect(body.email).toBe("iemand@voorbeeld.nl")
    expect(body.plek).toBe("voet")
    expect(body.taal).toBe("en")
  })
})

// ── Geen nieuwe feiten: elk punt staat al op de site ──────────────────

test("elk punt van de checklist komt letterlijk uit tekst die al op de site staat", async ({ page, isMobile }) => {
  test.skip(isMobile, "tekstvergelijking; één keer is genoeg")
  test.setTimeout(120_000)
  const bronpaginas = [
    "/nl",
    "/nl/studio",
    "/nl/faq",
    "/nl/contact",
    "/nl/services/garden-design",
    "/nl/services/garden-transformation",
    "/nl/services/planting-habitat",
    "/nl/services/consultancy",
    "/nl/services/pond-survey",
    "/nl/services/leaf-net",
  ]
  const norm = (s: string) => s.replace(/\s+/g, " ")
  let corpus = ""
  for (const pad of bronpaginas) {
    await page.goto(pad)
    // textContent, niet innerText: ook dichtgeklapte antwoorden tellen.
    corpus += " " + norm(await page.locator("main").evaluate((el) => el.textContent ?? ""))
  }
  const zinnen = checklist("nl").flatMap((o) => o.punten.flatMap((p) => p.bronnen.map((b) => ({ punt: p.tekst, zin: b.zin }))))
  expect(zinnen.length).toBeGreaterThan(20)
  const zoek = corpus.toLocaleLowerCase("nl")
  const zoekweg = zinnen.filter(({ zin }) => !zoek.includes(norm(zin).toLocaleLowerCase("nl")))
  expect(zoekweg, "deze bronzinnen staan nergens op de site").toEqual([])
  // Elk punt heeft minstens één bron.
  for (const o of checklist("nl")) for (const p of o.punten) expect(p.bronnen.length, p.tekst).toBeGreaterThan(0)
})

// ── De vlag uit: niets te zien ────────────────────────────────────────

test("vlag uit: geen formulier, geen /checklist", async ({ page, request }) => {
  test.skip(aan, "deze build heeft de vlag aan (NIEUWSBRIEF_ZICHTBAAR=1 of preview)")
  for (const pad of ["/nl", "/nl/faq", "/contact"]) {
    await page.goto(pad)
    await expect(page.locator("[data-aanmelden]")).toHaveCount(0)
  }
  expect((await request.get("/checklist")).status()).toBe(404)
})

// ── De vlag aan: twee plekken, één element ────────────────────────────

const PLEKKEN: { naam: string; pad: string; form: (p: Page) => Locator }[] = [
  { naam: "home", pad: "/nl", form: (p) => p.locator("#checklist form") },
  { naam: "faq", pad: "/nl/faq", form: (p) => p.locator('section[aria-labelledby="checklist-kop"] form') },
]

test.describe("vlag aan", () => {
  test.beforeEach(() => {
    test.skip(!aan, "build zonder NIEUWSBRIEF_ZICHTBAAR=1; CI bouwt met de vlag aan")
  })

  for (const { naam, pad, form: vind } of PLEKKEN) {
    test(`${naam}: een ongeldig adres gaat niet de deur uit`, async ({ page }) => {
      const { formsubmit, mailerlite } = await vang(page)
      await page.goto(pad)
      const form = vind(page)
      await form.scrollIntoViewIfNeeded()
      const veld = form.getByLabel("Je e-mailadres")
      const knop = form.getByRole("button", { name: /Stuur me de checklist/ })

      // Leeg en zonder @: de eigen controle houdt het tegen, met een
      // foutregel in de taal van de pagina (geen Engelse browserbel) die
      // zegt wat er wél verwacht wordt (eigenaar, 28 sep 2026).
      for (const [fout, regel] of [
        ["", "Vul je e-mailadres in, zoals naam@voorbeeld.nl."],
        ["geen-adres", "Er mist een @. Een e-mailadres ziet eruit als naam@voorbeeld.nl."],
      ] as const) {
        await veld.fill(fout)
        await knop.click()
        await expect(form.getByText(regel)).toBeVisible()
        await expect(veld).toBeFocused()
        await expect(veld).toHaveAttribute("aria-invalid", "true")
      }
      // "a@b" zou door type=email van de browser komen; de eigen controle
      // eist een punt in het domein.
      await veld.fill("a@b")
      await knop.click()
      await expect(form.getByText("Na de @ mist nog iets, zoals voorbeeld.nl in naam@voorbeeld.nl.")).toBeVisible()
      // De foutregel hangt aan het veld.
      await expect(veld).toHaveAccessibleDescription(/Na de @ mist nog iets/)
      expect(formsubmit).toHaveLength(0)
      expect(mailerlite).toHaveLength(0)
    })

    test(`${naam}: een geldig adres gaat naar MailerLite, met een eerlijke bevestiging`, async ({ page }) => {
      const { formsubmit, mailerlite } = await vang(page)
      await page.goto(pad)
      const form = vind(page)
      await expect(form).toHaveAttribute("data-aanmelden", "mailerlite")
      await form.scrollIntoViewIfNeeded()
      // De regel onder het formulier: wat je krijgt, en waar je adres staat.
      await expect(form).toContainText("Je krijgt de checklist en af en toe een mail van mij. Afmelden kan altijd.")
      await expect(form).toContainText("Je adres staat bij MailerLite, waarmee ik de mails verstuur.")
      await form.getByLabel("Je e-mailadres").fill("test@voorbeeld.nl")
      await form.getByRole("button", { name: /Stuur me de checklist/ }).click()

      // Double opt-in staat aan: eerst de bevestigingsknop, dan de checklist.
      const bevestiging = page.locator('[data-aanmelden="verzonden"]')
      await expect(bevestiging).toContainText("Bijna klaar: kijk in je mail.")
      await expect(bevestiging).toContainText("Je krijgt een mail op test@voorbeeld.nl met een bevestigingsknop.")
      await expect(bevestiging).not.toContainText(/Ik stuur je de checklist zelf/)

      expect(formsubmit).toHaveLength(0)
      expect(mailerlite).toHaveLength(1)
      expect(mailerlite[0].url).toBe("https://assets.mailerlite.com/jsonp/2657100/forms/199473671017858334/subscribe")
      expect(mailerlite[0].velden.get("fields[email]")).toBe("test@voorbeeld.nl")
      expect(mailerlite[0].velden.get("ml-submit")).toBe("1")
      expect(mailerlite[0].velden.get("anticsrf")).toBe("true")
    })
  }

  test("honeypot: een ingevuld verborgen veld krijgt een bedankje en verstuurt niets", async ({ page }) => {
    const { formsubmit, mailerlite } = await vang(page)
    await page.goto("/nl/faq")
    const form = PLEKKEN[1].form(page)
    await form.scrollIntoViewIfNeeded()
    // Het veld is voor mensen onzichtbaar en niet te bereiken met Tab.
    const pot = form.locator('input[name="website"]')
    await expect(pot).toHaveAttribute("tabindex", "-1")
    await pot.evaluate((el) => ((el as HTMLInputElement).value = "http://spam.example"))
    await form.getByLabel("Je e-mailadres").fill("bot@voorbeeld.nl")
    await form.getByRole("button", { name: /Stuur me de checklist/ }).click()
    await expect(page.locator('[data-aanmelden="verzonden"]')).toBeVisible()
    await page.waitForTimeout(300)
    expect(formsubmit).toHaveLength(0)
    expect(mailerlite).toHaveLength(0)
  })

  test("mislukt het versturen, dan zegt het formulier dat, met het mailadres — nooit een valse bevestiging", async ({ page }) => {
    const { mailerlite } = await vang(page, 500)
    await page.goto("/nl/faq")
    const form = PLEKKEN[1].form(page)
    await form.scrollIntoViewIfNeeded()
    await form.getByLabel("Je e-mailadres").fill("test@voorbeeld.nl")
    await form.getByRole("button", { name: /Stuur me de checklist/ }).click()
    await expect(form.getByRole("alert")).toContainText("Aanmelden lukte niet.")
    await expect(form.getByRole("alert").getByRole("link", { name: "hello@gronn.studio" })).toBeVisible()
    await expect(page.locator('[data-aanmelden="verzonden"]')).toHaveCount(0)
    expect(mailerlite).toHaveLength(1)
  })

  test("Engels: dezelfde regel en bevestiging in de ik-vorm", async ({ page }) => {
    const { mailerlite } = await vang(page)
    await page.goto("/faq")
    const form = page.locator('section[aria-labelledby="checklist-kop"] form')
    await form.scrollIntoViewIfNeeded()
    await expect(form).toContainText("You get the checklist and now and then an e-mail from me. You can unsubscribe at any time.")
    await form.getByLabel("Your e-mail address").fill("test@example.com")
    await form.getByRole("button", { name: /Send me the checklist/ }).click()
    await expect(page.locator('[data-aanmelden="verzonden"]')).toContainText("You’ll get an e-mail at test@example.com with a confirm button.")
    expect(mailerlite[0].velden.get("fields[email]")).toBe("test@example.com")
  })

  // Nick, 24 sep 2026: "de indeling ziet oneven uit" — toen kwam de kaart
  // precies onder de intro. Nick, 29 sep 2026: "zet hier een lijst van 21
  // punten ipv maar 4, kleed dat leuk aan" — daarmee werd die smalle kolom
  // 1370px hoog. Sindsdien staat de kaart over de volle breedte van het
  // raster (BREEDTE), onder kop, intro en formulier, met de vier
  // onderdelen twee aan twee. De regel blijft "even": beide randen van de
  // kaart op de lijnen van het raster.
  for (const breedte of [1024, 1280, 1440, 1920]) {
    test(`home ${breedte}px: de kaart staat op het raster, de onderdelen twee aan twee`, async ({ page, isMobile }) => {
      test.skip(isMobile, "twee kolommen alleen op desktop")
      await page.setViewportSize({ width: breedte, height: 900 })
      await page.goto("/nl", { waitUntil: "networkidle" })
      const blok = page.locator("section#checklist")
      await blok.scrollIntoViewIfNeeded()
      const maat = await blok.evaluate((sectie) => {
        const raster = sectie.firstElementChild as HTMLElement
        const r = raster.getBoundingClientRect()
        const stijl = getComputedStyle(raster)
        const kaart = sectie.querySelector("[data-checklist-inhoud]")!.getBoundingClientRect()
        const kop = sectie.querySelector("h2")!.getBoundingClientRect()
        const formulier = sectie.querySelector("form")!.getBoundingClientRect()
        const groepen = [...sectie.querySelectorAll("[data-puntengroep]")].map((g) => {
          const b = g.getBoundingClientRect()
          return { x: b.left, y: b.top }
        })
        return {
          links: r.left + parseFloat(stijl.paddingLeft),
          rechts: r.right - parseFloat(stijl.paddingRight),
          kaart: { links: kaart.left, rechts: kaart.right, boven: kaart.top },
          kop: kop.left,
          formulier: { links: formulier.left, onder: formulier.bottom },
          groepen,
        }
      })
      expect(Math.abs(maat.kaart.links - maat.links), "linkerrand kaart = raster").toBeLessThanOrEqual(1)
      expect(Math.abs(maat.kaart.rechts - maat.rechts), "rechterrand kaart = raster").toBeLessThanOrEqual(1)
      expect(Math.abs(maat.kop - maat.links), "kop op het raster").toBeLessThanOrEqual(1)
      expect(Math.abs(maat.formulier.links - maat.kop), "linkerrand formulier = kop").toBeLessThanOrEqual(1)
      expect(maat.kaart.boven, "kaart onder het formulier").toBeGreaterThan(maat.formulier.onder)
      // Vier onderdelen in twee kolommen: per paar dezelfde bovenkant, de
      // tweede rechts van de eerste; het tweede paar onder het eerste.
      expect(maat.groepen).toHaveLength(4)
      const [a, b, c, d] = maat.groepen
      expect(Math.abs(a.y - b.y), "rij 1 op één hoogte").toBeLessThanOrEqual(1)
      expect(Math.abs(c.y - d.y), "rij 2 op één hoogte").toBeLessThanOrEqual(1)
      expect(b.x).toBeGreaterThan(a.x + 100)
      expect(Math.abs(a.x - c.x)).toBeLessThanOrEqual(1)
      expect(Math.abs(b.x - d.x)).toBeLessThanOrEqual(1)
      expect(c.y).toBeGreaterThan(a.y)
    })
  }

  // Goedgekeurd door Nick (24 sep 2026): geen conceptlabel meer en geen
  // bronregels voor de bezoeker. De bronnen zelf blijven in de data en
  // worden hierboven tegen de live pagina's gelegd.
  test("/checklist: rendert, noindex, zonder conceptlabel of bronregels, en op papier alleen de checklist", async ({ page }) => {
    for (const [pad, h1] of [
      ["/nl/checklist", "Checklist vooraf"],
      ["/checklist", "Checklist before you start"],
    ] as const) {
      const res = await page.goto(pad)
      expect(res?.status()).toBe(200)
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/)
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /nofollow/)
      await expect(page.locator("[data-concept-label]")).toHaveCount(0)
      await expect(page.locator("[data-punt] [data-print='hide']")).toHaveCount(0)
      await expect(page.locator("main")).not.toContainText(/Bron:|Source:|Concept|Draft/)
      await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(h1)
      await expect(page.locator("main h2")).toHaveCount(5)
      await expect(page.locator("[data-punt]")).toHaveCount(checklist(pad.startsWith("/nl") ? "nl" : "en").reduce((n, o) => n + o.punten.length, 0))
    }
    // Niet in de sitemap.
    const sitemap = await (await page.request.get("/sitemap.xml")).text()
    expect(sitemap).not.toContain("/checklist")

    // Twee knoppen (Nick, 24 sep 2026: "op mobiel gaat dat vaak niet
    // goed"): een echt PDF-bestand om te downloaden, en printen. Op
    // papier: geen kop, geen voet, geen dock, geen knop — alleen de checklist.
    await page.goto("/nl/checklist")
    const pdf = page.getByRole("link", { name: /Download als PDF/ })
    await expect(pdf).toBeVisible()
    await expect(pdf).toHaveAttribute("href", "/pdf/checklist-vooraf.pdf")
    await expect(pdf).toHaveAttribute("download", /Checklist vooraf\.pdf$/)
    await expect(page.getByRole("button", { name: "Printen" })).toBeVisible()
    await page.emulateMedia({ media: "print" })
    await expect(page.locator("footer")).toBeHidden()
    await expect(page.locator("header").first()).toBeHidden()
    await expect(pdf).toBeHidden()
    await expect(page.getByRole("button", { name: "Printen" })).toBeHidden()
    await expect(page.locator("[data-punt]").first()).toBeVisible()
  })

  // De PDF is een vast bestand (public/pdf/, `npm run checklist:pdf`). Hij
  // moet bestaan, echt een PDF zijn, en uit de tekst komen die nu op de
  // site staat: dezelfde vingerafdruk als in scripts/checklist-pdf.mjs.
  test("de PDF bestaat, is een PDF, en is gemaakt uit de huidige checklist", async ({ page, isMobile }) => {
    test.skip(isMobile, "één keer is genoeg")
    const bron = JSON.parse(readFileSync(join(process.cwd(), "public", "pdf", "checklist-bron.json"), "utf8"))
    for (const [taal, pad, bestand] of [
      ["nl", "/nl/checklist", "/pdf/checklist-vooraf.pdf"],
      ["en", "/checklist", "/pdf/checklist-before-you-start.pdf"],
    ] as const) {
      const res = await page.request.get(bestand)
      expect(res.status(), bestand).toBe(200)
      expect(res.headers()["content-type"]).toContain("application/pdf")
      expect((await res.body()).subarray(0, 5).toString()).toBe("%PDF-")

      await page.goto(pad)
      const tekst = await page.evaluate(() =>
        [...document.querySelectorAll("main h1, main h2, [data-punt]")].map((e) => e.textContent?.replace(/\s+/g, " ").trim()).join("\n")
      )
      const nu = createHash("sha256").update(tekst).digest("hex").slice(0, 16)
      expect(nu, `${taal}: de checklist is veranderd sinds de PDF — draai npm run checklist:pdf`).toBe(bron[taal])
    }
  })

  // Nick, 24 sep 2026: de checklist in de voet was "dubbelop" naast het
  // blok op home en /faq.
  test("de voet biedt de checklist niet aan", async ({ page }) => {
    for (const pad of ["/nl", "/nl/faq", "/nl/contact"]) {
      await page.goto(pad)
      await expect(page.locator("footer")).toBeVisible()
      await expect(page.locator("footer [data-aanmelden]")).toHaveCount(0)
    }
    await expect(page.locator("[data-aanmelden]")).toHaveCount(0)
  })

  for (const uur of ["goldenhour", "bluehour"] as const) {
    test(`axe (${uur}): /nl/checklist, /checklist, de blokken op home en /faq, en de foutstand`, async ({ page }) => {
      test.setTimeout(90_000)
      await page.addInitScript((u) => {
        localStorage.setItem("theme", u)
        localStorage.setItem("gronn-theme-mode", "manual")
      }, uur)
      await vang(page)
      for (const pad of ["/nl/checklist", "/checklist", "/nl", "/nl/faq"]) {
        await page.goto(pad, { waitUntil: "networkidle" })
        await page.waitForTimeout(1500)
        const res = await new AxeBuilder({ page }).withTags(AXE_TAGS).exclude("canvas").analyze()
        expect(res.violations.map((v) => `${pad} ${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([])
      }
      // Met de foutregel en de bevestiging zichtbaar.
      const form = PLEKKEN[1].form(page)
      await form.scrollIntoViewIfNeeded()
      await form.getByLabel("Je e-mailadres").fill("geen-adres")
      await form.getByRole("button", { name: /Stuur me de checklist/ }).click()
      await expect(form.getByText("Er mist een @.", { exact: false })).toBeVisible()
      const fout = await new AxeBuilder({ page }).withTags(AXE_TAGS).exclude("canvas").analyze()
      expect(fout.violations.map((v) => `foutstand ${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([])
      await form.getByLabel("Je e-mailadres").fill("test@voorbeeld.nl")
      await form.getByRole("button", { name: /Stuur me de checklist/ }).click()
      await expect(page.locator('[data-aanmelden="verzonden"]')).toBeVisible()
      const klaar = await new AxeBuilder({ page }).withTags(AXE_TAGS).exclude("canvas").analyze()
      expect(klaar.violations.map((v) => `bevestiging ${v.id}: ${v.nodes.map((n) => n.target).join(" ")}`)).toEqual([])
    })
  }
})

// De privacyverklaring noemt de maillijst, met de zin die Nick op 24 sep
// 2026 goedkeurde, en MailerLite staat tussen de verwerkers. Zonder deze
// twee gaat `ZICHTBAAR` niet aan.
test("de privacyverklaring noemt de maillijst en MailerLite", async ({ page }) => {
  await page.goto("/nl/privacy")
  const main = page.locator("main")
  await expect(main.getByRole("heading", { name: "Maillijst en checklist vooraf" })).toBeVisible()
  await expect(main).toContainText("Als je de checklist vooraf aanvraagt, verwerk ik je e-mailadres")
  await expect(main).toContainText("Ik bewaar je adres tot je je afmeldt.")
  await expect(main).toContainText("MailerLite (MailerLite, UAB)")
})
