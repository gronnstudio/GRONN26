import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

import { RegisterSW } from "@/components/register-sw"
import {
  DAY_START_HOUR,
  DAY_THEME,
  NIGHT_START_HOUR,
  NIGHT_THEME,
  THEME_KEY,
  THEME_MODE_KEY,
} from "@/lib/themes";
import { Providers } from "@/components/providers";
import { JsonLd } from "@/components/json-ld";
import { organisationSchema } from "@/lib/schema";
import { MERKBASIS } from "@/components/gronn/plekken";
import { OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

// Type system shared with Equilibrium: Syne SemiBold for headings,
// Montserrat for body/interface, Geist Mono for technical annotations.
//
// Syne and Montserrat are the owner's own files, committed under
// src/fonts/. Nothing is fetched for them — not at build time, not by a
// visitor. Both were subset to the characters this site actually uses
// (Google's `latin` range plus the arrows the panels render literally)
// and converted to woff2: Montserrat went 672 KB -> 31 KB, Syne
// 68 KB -> 12 KB. `next/font/local` serves what you give it and subsets
// nothing, so shipping the source TTFs would have meant 740 KB of font.
//
// Montserrat now carries a REAL 400-600 weight axis. It used to load at
// 400 alone, which meant every `font-medium` and `font-semibold` on body
// text — buttons, menu items, links — was a browser-synthesised fake
// bold. `font-synthesis-weight: none` in globals.css now forbids that
// outright, so a missing cut fails loudly instead of looking smudged.
const montserrat = localFont({
  src: "../fonts/Montserrat-latin.woff2",
  variable: "--font-montserrat",
  weight: "400 600",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

// Headings. SemiBold is the cut the owner supplies and the one the brand
// specifies; a true Bold would need a real Syne-Bold file, because
// thickening this one in software is precisely the fake bold the line
// above exists to prevent.
const syne = localFont({
  src: "../fonts/Syne-SemiBold-latin.woff2",
  variable: "--font-syne",
  weight: "600",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

// The one family still fetched at build time: there is no local source
// file for it. Drop a GeistMono[wght].ttf into src/fonts/ and it joins
// the other two, leaving the build with no font dependency at all.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // The fallback for routes without a title of their own (/offline, the
  // tool routes). Same wording as the homepage title and the merkbasis
  // from the Brand Guide 2026, so no page falls back to the retired
  // English positioning.
  title: {
    default: "GRØNN Studio · Vijvers en tuinen in Stein en omgeving",
    template: "%s — GRØNN Studio",
  },
  description: MERKBASIS.nl,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    images: [OG_IMAGE],
    locale: "en_US",
    alternateLocale: "nl_NL",
  },
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE.url],
  },
};

// The public site lives under `src/app/[locale]`, which owns the site
// chrome and the per-URL locale. This layout is only the document shell,
// shared with the tool routes (/editor) that render bare.
//
// The root element must keep `height: auto` — no `h-full`. Lenis watches
// the ROOT element's border box to notice that the page grew
// (smooth-scroll.tsx); `height: 100%` pins that box to the viewport for
// good, the observer never fires again, and Lenis keeps clamping the wheel
// to a stale scroll limit — which reads as a page that stops scrolling
// partway down. Lenis ships the same fix as `html.lenis { height: auto }`
// in a stylesheet this site does not load. `min-h-screen` on <body> (not
// `min-h-full`, which would need a resolved height on <html>) is what keeps
// the footer at the bottom of short pages.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${montserrat.variable} ${geistMono.variable} ${syne.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        {/* Recording blur boots with the page (same pattern as the theme
            script): the toggle component only mounts inside the menus, so
            without this the persisted blur wouldn't apply — and sensitive
            text would flash unblurred — until a menu was opened. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("gronn-privacy-blur")==="1")document.documentElement.classList.add("privacy-blur")}catch(e){}`,
          }}
        />
        {/* Opening veil plays once per session; stamping the class here
            runs pre-paint, so repeat pages never flash it (the veil is
            server-rendered and CSS-driven — see gronn/openingsdoek.tsx).
            The installed app never shows it either: the phone's own
            launch screen already does that job (same check as
            src/lib/use-standalone.ts, iOS `navigator.standalone` too). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(matchMedia("(display-mode: standalone)").matches||navigator.standalone===true||sessionStorage.getItem("gronn-intro"))document.documentElement.classList.add("intro-seen");else sessionStorage.setItem("gronn-intro","1");if(localStorage.getItem("gronn-cookies-noted"))document.documentElement.classList.add("cookies-noted")}catch(e){}`,
          }}
        />
        {/* Accessibility preferences, pre-paint. Same reasoning as the
            privacy blur directly above: the controls only mount inside
            the concept panel, so without this a visitor who asked for
            reduced motion would watch the opening veil and the terrain
            animate before their choice took effect — which is the exact
            thing they asked not to happen. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var d=document.documentElement,m=localStorage.getItem("gronn-a11y-motion");if(m==="full"||m==="reduced")d.dataset.motion=m;if(localStorage.getItem("gronn-a11y-underline")==="on")d.dataset.underline="on";var t=localStorage.getItem("gronn-a11y-text");if(t==="large"||t==="larger")d.dataset.text=t;if(localStorage.getItem("gronn-a11y-contrast")==="more")d.dataset.contrast="more"}catch(e){}`,
          }}
        />
        {/* Time-of-day default. Unless the visitor has overruled it, seed
            next-themes' storage from their own clock BEFORE its script
            runs — this element precedes <Providers>, so the palette is
            decided pre-paint and an auto visitor never sees a flash of
            the wrong ground. Hours come from src/lib/themes.ts so the
            boundaries cannot drift from resolveAutoTheme(). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var k=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(localStorage.getItem(${JSON.stringify(THEME_MODE_KEY)})!=="manual"||(k!==${JSON.stringify(DAY_THEME)}&&k!==${JSON.stringify(NIGHT_THEME)})){localStorage.setItem(${JSON.stringify(THEME_MODE_KEY)},"auto");var h=new Date().getHours();localStorage.setItem(${JSON.stringify(THEME_KEY)},h>=${DAY_START_HOUR}&&h<${NIGHT_START_HOUR}?${JSON.stringify(DAY_THEME)}:${JSON.stringify(NIGHT_THEME)})}}catch(e){}`,
          }}
        />
        {/* Who the studio is. Page-specific nodes (article, case study,
            service catalogue, breadcrumbs) reference this one by @id
            instead of restating the business — see src/lib/schema.ts. */}
        <JsonLd data={organisationSchema()} />
        <RegisterSW />
        <Providers>{children}</Providers>
        {/* Field Core Web Vitals from real visitors — docs/perf/README.md
            documents that our lab numbers mislead. */}
        <SpeedInsights />
      </body>
    </html>
  );
}
