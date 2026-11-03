import { NextResponse, type NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

import {
  DEFAULT_LOCALE,
  isLocale,
  isUnlocalized,
  LANG_COOKIE,
  LANG_MODE_COOKIE,
  LINKS_HOST,
  LOCALES,
  preferredLocale,
  stripLocale,
} from "@/lib/locale"

// Renamed from `middleware.ts` on 27 Aug 2026. Next 16 deprecated the
// `middleware` file convention and renamed it to `proxy` (v16.0.0), to
// stop it reading as Express-style middleware and to say plainly that
// this is a network boundary in front of the app. This project runs
// 16.2.10, so the old name works but is on a deprecation path.
//
// One behavioural difference worth knowing: Proxy defaults to the
// Node.js runtime where Middleware ran at the edge. Nothing here needs
// the edge — it reads headers and cookies and rewrites a path — so the
// change is a rename in practice as well as in name.
//
// English keeps the URLs the site was indexed with (`/projects`) while
// Dutch gets real, indexable ones (`/nl/projects`). Underneath, both are
// the same `[locale]` routes:
//
//   /projects     → rewrite  → /en/projects   (URL unchanged)
//   /nl/projects  → served as-is
//   /en/projects  → redirect → /projects      (one canonical URL only)
// Archief achter login (eigenaar, 5 okt 2026): zodra de nieuwe site op
// gronn.studio staat, blijft deze site bestaan als archief, alleen voor de
// eigenaar. Met ARCHIEF_ACHTER_LOGIN=1 (Vercel-omgevingsvariabele) gaat elke
// openbare pagina achter dezelfde Google-login als /editor: alleen
// hello@gronn.studio (EDITOR_ALLOWED_EMAIL) komt erin, ieder ander landt op
// /editor om in te loggen. Zonder de variabele verandert er niets. De API,
// /editor, /dashboard en /os staan buiten de matcher en hebben hun eigen
// controle (getOwnerSession).
const ARCHIEF_ACHTER_LOGIN = process.env.ARCHIEF_ACHTER_LOGIN === "1"
const EIGENAAR = (process.env.EDITOR_ALLOWED_EMAIL ?? "hello@gronn.studio").toLowerCase()

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (ARCHIEF_ACHTER_LOGIN) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (token?.email?.toLowerCase() !== EIGENAAR) {
      const res = NextResponse.redirect(new URL("/editor", request.url), 307)
      res.headers.set("X-Robots-Tag", "noindex")
      return res
    }
  }

  // links.gronn.studio: de bento-linkpagina (`src/app/links`). Dit gaat
  // vóór alles hieronder, anders stuurt de taalregel een Nederlandse
  // browser van `/` naar `/nl` en wordt een Engelse naar `/en`
  // herschreven. Alleen de voordeur staat op het subdomein; elk ander
  // pagina-pad gaat terug naar het hoofddomein, zodat de site niet twee
  // keer bestaat. Assets, `/_next` en `/contact.vcf` komen hier niet
  // langs (zie de matcher) en werken op het subdomein gewoon.
  // De Host-header, niet `nextUrl.hostname`: achter `next start` is die
  // laatste de host waarop de server luistert, niet waar de bezoeker om
  // vroeg. Poort eraf (lokaal: `localhost:3210`).
  const host = (request.headers.get("host") ?? request.nextUrl.host).split(":")[0].toLowerCase()
  if (host === LINKS_HOST) {
    if (pathname === "/") {
      const url = request.nextUrl.clone()
      url.pathname = "/links"
      return NextResponse.rewrite(url)
    }
    return NextResponse.redirect(`https://gronn.studio${pathname}${request.nextUrl.search}`, 308)
  }

  // The owner tools live outside the [locale] tree, so a prefixed URL
  // has no route behind it. Links no longer generate these, but a
  // bookmark, a typed URL or a browser history entry still can — and
  // /nl/admin answering 404 is the same dead end whether a link or a
  // finger put it there. Send it to the real route instead.
  const stripped = stripLocale(pathname)
  if (stripped !== pathname && isUnlocalized(stripped)) {
    const url = request.nextUrl.clone()
    url.pathname = stripped
    return NextResponse.redirect(url, 308)
  }

  // Never let the default locale be reachable with its prefix — that
  // would be duplicate content competing with the canonical path.
  if (
    pathname === `/${DEFAULT_LOCALE}` ||
    pathname.startsWith(`/${DEFAULT_LOCALE}/`)
  ) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/"
    return NextResponse.redirect(url, 308)
  }

  // Non-default locales are already in their canonical shape.
  if (
    LOCALES.some(
      (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
    )
  ) {
    return NextResponse.next()
  }

  // An unprefixed path is English by URL. Before serving it as English,
  // ask whose language this actually is.
  //
  // Only on a genuine browser navigation, and — once the visitor has
  // chosen for themselves — only towards what they chose, never towards
  // a guess. Both guards matter:
  //
  //  · A crawler asking for /projects must GET /projects. Bouncing it to
  //    /nl/projects would make the English tree effectively uncrawlable
  //    and put the two languages into competition for the same content.
  //    Googlebot sends `en-US` and no Sec-Fetch-Mode, so the navigation
  //    check keeps it — and every asset and prefetch — on the path it
  //    asked for.
  //  · The redirect is 307, never 308. Nothing has permanently moved;
  //    the right answer depends on who is asking, and a permanent
  //    redirect would be cached by the browser and applied to the next
  //    visitor too.
  const chosen = request.cookies.get(LANG_MODE_COOKIE)?.value === "manual"
  const navigating =
    request.headers.get("sec-fetch-mode") === "navigate" ||
    (request.headers.get("accept") ?? "").includes("text/html")

  if (navigating) {
    // Having chosen, the visitor's choice is not only "stop guessing" but
    // the answer itself. Someone who picked Dutch and then opens `/` —
    // the home-screen app's start_url, a bookmark, a typed address —
    // must land on `/nl`, not on English. It used to stop the guessing
    // and then serve English regardless. Choosing English writes
    // `gronn-lang=en`, which falls through to the rewrite below, so an
    // explicit English still wins over a Dutch browser.
    //
    // Without a choice, the browser's language is the best guess.
    const cookieLocale = request.cookies.get(LANG_COOKIE)?.value
    const wanted = chosen
      ? cookieLocale && isLocale(cookieLocale)
        ? cookieLocale
        : null
      : preferredLocale(request.headers.get("accept-language"))
    if (wanted && wanted !== DEFAULT_LOCALE) {
      const url = request.nextUrl.clone()
      url.pathname = `/${wanted}${pathname === "/" ? "" : pathname}`
      const redirect = NextResponse.redirect(url, 307)
      // The answer varies by who asks, so any cache in between has to
      // know that. Without this, one visitor's language could be served
      // to the next from a shared cache.
      redirect.headers.set("Vary", "Accept-Language, Cookie")
      return redirect
    }
  }

  const url = request.nextUrl.clone()
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`
  const response = NextResponse.rewrite(url)
  response.headers.set("Vary", "Accept-Language, Cookie")
  return response
}

export const config = {
  // Public pages only: the API, the editor, the owner panel at
  // /dashboard, its two former addresses (/admin and /clients/admin,
  // which still redirect), the client portal, the locale-less /offline
  // fallback (precached by the service worker — a rewrite into the
  // locale tree would 404 it), the Dutch-only bento page at /links
  // (without this, the language redirect sends /links to /nl/links and
  // the owner-tool rule sends it back: a loop), the Dutch-only e-mail
  // signature at /handtekening (same reason), the owner's Command Center
  // at /os (written `os$|os/` so a future /osteopathy page still gets a
  // locale), Next's own assets and anything with a
  // file extension are untouched.
  //
  // THIS LIST AND `UNLOCALIZED` IN lib/locale.ts MUST AGREE. They are
  // the same fact written twice, and Next requires this one to be a
  // literal it can read at build time, so it cannot be derived from the
  // other. When the panel moved to /dashboard, `UNLOCALIZED` was updated
  // and this was not: every /dashboard URL was rewritten to
  // /en/dashboard, which has no route, and the whole panel answered 404.
  // Two lists, two separate 404s, one afternoon.
  matcher: ["/((?!api|_next|editor|admin|dashboard|os$|os/|clients|offline|links|handtekening|.*\\.).*)"],
}
