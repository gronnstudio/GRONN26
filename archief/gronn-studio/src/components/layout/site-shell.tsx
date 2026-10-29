"use client"


import { BackToTop } from "@/components/back-to-top"
import { useT } from "@/components/language-provider"
import { InstallPrompt } from "@/components/install-prompt"
import { SearchProvider } from "@/components/search/command-palette"
import { Shortcuts } from "@/components/shortcuts"
import { Header } from "@/components/layout/header"
import { ContactRail } from "@/components/layout/contact-rail"
import { Footer } from "@/components/layout/footer"
import { TopBar } from "@/components/layout/hoek-paneel"
import { DockClearance, DockNav } from "@/components/layout/dock-nav"
import { Cursor } from "@/components/motion/cursor"
import { Preloader } from "@/components/preloader"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { GrainOverlay } from "@/components/motion/grain-overlay"
import { SmoothScroll } from "@/components/motion/smooth-scroll"
import { EditorProvider } from "@/editor/editor-context"
import { EditorToolbar } from "@/editor/toolbar"
import type { Article } from "@/lib/data/journal"
import type { Project } from "@/lib/data/projects"
import type { Service } from "@/lib/data/services"

// The site chrome (header, cursor, smooth scroll, grain, dock, cookie
// notice) for every public page. It is mounted by the `[locale]` layout,
// so the owner tools (/editor) sit outside it by routing rather than by
// a pathname check — their full-screen UIs never had to fight Lenis,
// the cursor or the header.
export function SiteShell({
  children,
  featuredProject,
  latestArticle,
  services,
  projects,
  articles,
}: {
  children: React.ReactNode
  featuredProject: Project
  latestArticle: Article
  services: Service[]
  /** The full lists, for the search corpus. */
  projects: Project[]
  articles: Article[]
}) {
  const t = useT()
  // Eén object, niet twee letterlijke per render.
  //
  // De balk, de tabletkaart en de telefoondock krijgen alle drie dít —
  // dat is het hele punt van deze ronde. Twee inline literals zouden bij
  // elke render een nieuwe identiteit hebben en dus elk menu opnieuw
  // laten renderen, en ze zouden bovendien uit elkaar kunnen lopen, wat
  // precies de fout is die hier wordt afgeschaft.
  const menuContent = { services, projects, articles }
  return (
    <EditorProvider>
      {/* Wraps everything so ⌘K works on any page and the header's own
          trigger can reach it through context. */}
      <SearchProvider corpus={{ services, projects, articles }}>
        {/* Keyboard navigation, and the ? sheet that says it exists.
            Inside the search provider so nothing races it for a key. */}
        <Shortcuts />
      {/* First focusable element on every public page. tabIndex={-1} on
          <main> makes the fragment target actually take focus in Safari;
          outline-none because a landmark is a destination, not a control. */}
      <a
        href="#main"
        className="sr-only z-[100] rounded-md bg-gronn-green px-4 py-2 text-sm text-gronn-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        {t({ en: "Skip to content", nl: "Direct naar inhoud" })}
      </a>
      <Preloader />
      <SmoothScroll />
      <GrainOverlay />
      <Cursor />
      <Header
        content={menuContent}
        featured={featuredProject}
        latestArticle={latestArticle}
        services={services}
      />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer />
      {/* De ruimte die de dock inneemt, zodat hij nooit over de laatste
          regel van de voettekst ligt. De rekensom staat naast die van de
          pil zelf, in `dock-nav.tsx`, opzettelijk bij elkaar. */}
      <DockClearance />
      {/* De telefoonnavigatie: de dock onderaan voor WAARHEEN, de twee
          hoekknoppen bovenin voor HOE. Dit verving het menuwiel — zie de
          toelichting bovenaan `dock-nav.tsx`. */}
      <DockNav />
      <TopBar />
      <PullToRefresh />
      <ContactRail />
      <BackToTop />
      <InstallPrompt />
      {/* Cookie notice: ON ICE, owner's call, 26 Aug 2026.
          The component stays in src/components/cookie-notice.tsx — this
          is a mount removed, not code deleted, so bringing it back is one
          import and one line.

          Defensible today: this site sets no tracking cookies. The stored
          preferences (theme, language, motion) are strictly functional,
          and Vercel Speed Insights is anonymised and cookieless.

          It MUST come back the moment any of these ship:
            - a chat widget (Chatwoot / Crisp / Tidio — see the live-chat
              plan; every one of them is a third-party processor)
            - analytics that assign a visitor identifier
            - any marketing or conversion pixel
            - embedded video or maps that set their own cookies
          See OPERATIONS.md. */}
      <EditorToolbar />
      </SearchProvider>
    </EditorProvider>
  )
}
