"use client"

import { Fragment, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signIn, signOut } from "next-auth/react"
import {
  BellIcon,
  CalendarDaysIcon,
  ChartNoAxesColumnIcon,
  ExternalLinkIcon,
  FileTextIcon,
  FolderOpenIcon,
  InboxIcon,
  LayoutDashboardIcon,
  LockIcon,
  LogOutIcon,
  PencilRulerIcon,
  TimerIcon,
  Trash2Icon,
  UsersIcon,
  ScaleIcon,
} from "lucide-react"

import { Logo } from "@/components/logo"
import { PanelSearch, type SearchItem } from "@/app/dashboard/panel-search"
import type { IconKey } from "@/app/dashboard/icon-keys"
import { cn } from "@/lib/utils"

// The chrome every surface under /clients wears.
//
// The navigation is a PROP, not a module constant. That was the thing
// standing between one shell and two audiences: the owner's rail and the
// client's rail differ in every item, and a hardcoded list meant either a
// second copy of this file or an `if` inside it. A prop means the two
// surfaces share the frame and share nothing else — which is the same
// reason their routes and their API handlers are separate.
//
// `doc-chrome` on every chrome element, because both the quote sheet and
// the intake sheet print from inside this frame and the print rules hide
// everything carrying that class. Miss it on a new bar and it prints on
// top of the invoice.

/**
 * Which icon a surface wears, as a STRING.
 *
 * Not a component reference, and that distinction cost a production
 * outage. The navigation is built in a Server Component and handed to
 * this Client Component as a prop, and everything crossing that boundary
 * has to be serializable — a function cannot be. It threw on every
 * render where a session existed, which is to say on the owner's screen
 * and never in CI, because without a session the page returns the
 * sign-in gate and this component is never reached.
 *
 * A string key cannot make that mistake. The type is the fix.
 */
export type { IconKey }

const ICONS: Record<IconKey, React.ComponentType<{ size?: number; className?: string }>> = {
  dashboard: LayoutDashboardIcon,
  agenda: CalendarDaysIcon,
  intakes: InboxIcon,
  documents: FileTextIcon,
  analytics: ChartNoAxesColumnIcon,
  clients: UsersIcon,
  hours: TimerIcon,
  drain: Trash2Icon,
  editor: PencilRulerIcon,
  legal: ScaleIcon,
  shelf: FolderOpenIcon,
}

export type Surface = {
  href: string
  label: string
  icon: IconKey
  /** A count worth seeing before you click — overdue invoices, say. */
  badge?: number
}

export type SurfaceGroup = {
  /** The mono heading above the group. Omitted for the first one. */
  title?: string
  items: Surface[]
}

export function DashboardShell({
  children,
  user,
  groups,
  /** Shown in the top bar, right of the search. */
  attention,
  /**
   * What the top-bar search looks through. Plain rows only — see the
   * note on IconKey above for why nothing here may be a component.
   */
  search = [],
  home = "/dashboard",
  signedIn = true,
  phoneGroups,
  signOutHref,
  phoneReady = false,
}: {
  children: React.ReactNode
  user?: string | null
  groups: SurfaceGroup[]
  attention?: { count: number; href: string; title: string }
  search?: SearchItem[]
  home?: string
  /**
   * Whether the studio is signed in.
   *
   * Signed out, this frame still draws — rail, headings, the shape of
   * the tool — and the sign-in moves into the bottom of the rail where
   * "Bekijk de site" otherwise sits. What does NOT draw is anything read
   * from storage: the caller renders the locked state as `children` and
   * fetches nothing, so an unauthenticated request receives the chrome
   * and never a client's name. The nav it passes carries no badges for
   * the same reason — a badge is a count, and a count is data.
   */
  signedIn?: boolean
  /**
   * What the PHONE strip shows, when that differs from the desktop rail.
   *
   * For the owner that is `ownerPhoneNav()`: the whole rail plus the
   * documents shelf, which on a phone earns its own pill (see nav.ts).
   * It used to be only the shelf and the small print, when the rest of
   * the panel was large-screen only — until the owner reversed that on
   * 25 Sep 2026.
   *
   * Omitted, the strip shows `groups`, which is what a client gets: their
   * rail is already short and every item on it works on a phone.
   */
  phoneGroups?: SurfaceGroup[]
  /**
   * Where signing out goes, for a viewer next-auth does not own.
   *
   * The studio's session is next-auth's, so its button calls `signOut()`.
   * A client's is Supabase's, and calling next-auth's `signOut` on it
   * would clear a cookie that was never set and leave the real session
   * standing — signed out to the eye, signed in to the server. When this
   * is given, the control becomes a form that posts to it instead.
   */
  signOutHref?: string
  /**
   * Does this surface work at phone width?
   *
   * EVERY surface of the panel says yes since 25 September 2026. The
   * owner opened /dashboard on his iPhone 13, got "Dit paneel is voor een
   * groot scherm gemaakt", and answered that he wants to use the
   * dashboard on his phone — overzicht, offertes, intakes, the lot — and
   * not that notice. That reversed the earlier instruction that the panel
   * was a large-screen tool; the layouts were made to fit 320–430px in
   * the same change (tests/e2e/paneel-op-telefoon.spec.ts measures each).
   *
   * The flag stays, and stays opt-in, as a safety net rather than a
   * rule: a NEW surface has to say out loud that it was looked at on a
   * phone, and until it does it falls on the notice below instead of on
   * a layout nobody measured. paneel-op-telefoon.spec.ts fails the build
   * when a panel page forgets it, so the net is never what the owner
   * actually meets.
   */
  phoneReady?: boolean
}) {
  const pathname = usePathname()
  const all = groups.flatMap((g) => g.items)
  /** What the phone strip lists, group by group. */
  const phone = phoneGroups ?? groups
  const onPhone = phone.flatMap((g) => g.items)

  // Longest match wins, so /dashboard/intakes marks Intakes rather
  // than Dashboard — which a plain startsWith would not.
  //
  // Over the rail AND the strip. The shelf (/dashboard/documenten) is on
  // the strip only; matched against the rail alone, the shelf lit up
  // "Dashboard" on the phone, because every panel address starts with it.
  const active = [...all, ...onPhone].reduce(
    (best, s) =>
      pathname === s.href || pathname.startsWith(`${s.href}/`)
        ? s.href.length > best.length
          ? s.href
          : best
        : best,
    ""
  )
  const current = [...all, ...onPhone].find((s) => s.href === active)

  // The strip holds the owner's whole panel — nine pills, far wider than
  // any phone — so it scrolls sideways, inside itself. What must never
  // happen is landing on a screen whose own pill is off the edge: the
  // strip is also the only "you are here" a phone has. So the current
  // pill is brought to the middle, instantly (no animation, so nothing
  // for reduced motion to switch off).
  const strip = useRef<HTMLElement>(null)
  useEffect(() => {
    const nav = strip.current
    const pill = nav?.querySelector<HTMLElement>("[aria-current='page']")
    if (!nav || !pill) return
    nav.scrollLeft = Math.max(
      0,
      pill.offsetLeft - (nav.clientWidth - pill.offsetWidth) / 2
    )
  }, [active])

  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* The safety net, and no longer the rule.

          This used to stand in front of the whole studio panel on every
          phone: the owner had asked for a large-screen tool. On 25 Sep
          2026 he met it on his iPhone and reversed that ("gewoon het
          dashboard op mijn telefoon gebruiken", overzicht, offertes,
          intakes), so every panel surface now passes `phoneReady` and
          none of them draws this. What is left is a surface nobody has
          measured on a phone yet — a new page that forgot the flag —
          and there an honest notice beats a layout that falls apart.
          paneel-op-telefoon.spec.ts fails when a panel page ships
          without the flag, so the owner should never actually see it.

          NOT RENDERED when the caller says the surface is phone-ready,
          rather than rendered and hidden with a class. This project has
          already paid once for the difference (two-audiences.spec.ts):
          `hidden` is a picture of an absence, and a screen that carries
          "this panel needs a big screen" in its markup is a screen that
          can still show it — one stylesheet failure, one reader mode,
          one copy-paste of the class list away. */}
      {!phoneReady && (
      <div
        className={cn(
          "doc-chrome grid min-h-svh place-items-center px-6 py-16 print:hidden",
          "lg:hidden"
        )}
      >
        <div className="max-w-sm text-center">
          <Logo className="mx-auto h-8 w-auto" />
          <p className="mt-6 font-heading text-lg font-semibold tracking-tight">
            Dit paneel is voor een groot scherm gemaakt.
          </p>
          {/* This line used to read "open gronn.studio/clients", and that
              address does not exist: `src/app/clients/` has no page of its
              own, only `/clients/login` and its siblings. So the one
              screen that refuses to help you also sent you to a 404.

              It says `/dashboard` now — the address you are already on,
              which is the honest instruction: the same door, a wider
              screen. */}
          <p className="mt-2.5 text-sm leading-relaxed text-muted">
            Open <span className="font-mono text-[13px]">gronn.studio/dashboard</span>{" "}
            op een laptop of desktop. Papierwerk opvragen kan hier wél.
          </p>
          {/* A door, not just a wall.
              
              The refusal is right for the tools — the builder, the
              intake tables, the figures — but it used to be a dead end,
              and the one thing worth having on a phone was behind it:
              the paperwork. Standing in somebody's garden you want the
              voorwaarden, or last week's quote, and you want it in the
              next ten seconds.
              
              So the notice now names the two reading surfaces that DO
              work here, above the way out — and, since the whole panel
              works on a phone (25 Sep 2026), the overview first. */}
          <div className="mt-7 flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="tap-target rounded-full bg-gronn-green px-5 py-2.5 text-sm font-medium text-gronn-white transition-colors hover:bg-gronn-ember-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
            >
              Naar het overzicht
            </Link>
            <Link
              href="/dashboard/documenten"
              className="tap-target rounded-full border border-line/25 px-5 py-2.5 text-sm font-medium transition-colors hover:border-gronn-ember hover:text-gronn-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
            >
              Documenten openen
            </Link>
            <Link
              href="/dashboard/kleine-letters"
              className="tap-target rounded-full border border-line/25 px-5 py-2.5 text-sm font-medium transition-colors hover:border-gronn-ember hover:text-gronn-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
            >
              Kleine letters
            </Link>
          </div>

          <Link
            href="/"
            className="mt-6 inline-block font-mono text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-gronn-ember"
          >
            Terug naar de site
          </Link>
        </div>
      </div>
      )}

      {/* `print:flex` is load-bearing, and its absence broke every print
          in the panel. A print sheet is narrower than the `lg`
          breakpoint, so this tree collapsed and the small-screen notice
          took its place: pressing print on a quote produced one page
          reading "Dit paneel is voor een groot scherm gemaakt" and
          nothing else. The chrome inside still carries `doc-chrome`, so
          what actually reaches the paper is the sheet alone. */}
      <div className={cn("print:flex", phoneReady ? "flex" : "hidden lg:flex")}>
        {/* Rail */}
        <aside
          className={cn(
            "doc-chrome sticky top-0 h-svh w-64 shrink-0 flex-col border-r border-line/12 bg-surface/50",
            // A 256px sidebar on a 390px screen leaves 134px of content.
            // On a phone the same items become the strip below the top
            // bar; here the rail simply steps out.
            phoneReady ? "hidden lg:flex" : "flex"
          )}
        >
          <div className="flex items-center gap-2.5 px-5 py-5">
            <Link href={home} aria-label="Naar het overzicht" className="shrink-0">
              <Logo className="h-7 w-auto" />
            </Link>
          </div>

          <nav aria-label="Beheer" className="flex-1 overflow-y-auto px-3 pb-3">
            {groups.map((group, gi) => (
              <div key={group.title ?? gi} className={cn(gi > 0 && "mt-7")}>
                {group.title && (
                  <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted/70">
                    {group.title}
                  </p>
                )}
                <ul className="flex flex-col gap-0.5">
                  {group.items.map(({ href, label, icon, badge }) => {
                    const isCurrent = active === href
                    const Icon = ICONS[icon]
                    return (
                      <li key={href} className="relative">
                        {isCurrent && (
                          <span
                            aria-hidden
                            className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-gronn-green"
                          />
                        )}
                        <Link
                          href={href}
                          aria-current={isCurrent ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]",
                            isCurrent
                              ? "bg-gronn-green/10 font-medium text-foreground"
                              : "text-muted hover:bg-surface hover:text-foreground"
                          )}
                        >
                          <Icon size={18} className="shrink-0" />
                          <span className="min-w-0 flex-1 truncate">{label}</span>
                          {badge !== undefined && badge > 0 && (
                            <span className="shrink-0 rounded-full bg-gronn-ember-strong px-1.5 py-px font-mono text-[9.5px] tabular-nums text-gronn-white">
                              {badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>

          {/* The foot of the rail: the way in when signed out, the way to
              the live site when signed in. One slot, because they are
              never both the thing you want. */}
          <div className="p-3">
            {signedIn ? (
              <Link
                href="/"
                className="block rounded-xl bg-gronn-green p-4 text-gronn-white transition-colors hover:bg-gronn-ember-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
              >
                <span className="flex items-center gap-2 font-heading text-sm font-semibold">
                  <ExternalLinkIcon size={15} aria-hidden />
                  Bekijk de site
                </span>
                <span className="mt-1 block text-[11.5px] leading-snug text-gronn-white">
                  gronn.studio, zoals een bezoeker hem ziet
                </span>
              </Link>
            ) : (
              <div className="rounded-xl border border-line/20 bg-surface p-4">
                <p className="flex items-center gap-2 font-heading text-sm font-semibold">
                  <LockIcon size={15} aria-hidden />
                  Alleen voor intern gebruik
                </p>
                <p className="mt-1.5 text-[11.5px] leading-snug text-muted">
                  Dit paneel is van de studio zelf. Klanten loggen in op{" "}
                  <Link
                    href="/clients/login"
                    className="underline underline-offset-2 transition-colors hover:text-gronn-ember"
                  >
                    het klantportaal
                  </Link>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: pathname })}
                  className="tap-target mt-3 w-full rounded-full bg-gronn-green px-4 py-2.5 text-[13px] font-medium text-gronn-white transition-colors hover:bg-gronn-ember-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--focus-ring)]"
                >
                  Inloggen met Google
                </button>
              </div>
            )}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top bar */}
          {/* Height is declared, not left to whatever the tallest child
              happens to be: the document toolbar below sticks to
              `--panel-topbar-h` and the editor column offsets by both, so
              this bar growing by a pixel would push two other things out
              of line. See globals.css. */}
          {/* On a phone the gaps and gutters are px, not rem (CLAUDE.md:
              "tekst groeit, chroom niet"), and the surface's name steps
              out: the strip right below already marks where you are, and
              with the owner's bell, the way to the site, the avatar and
              the sign-out beside it, "OFFERTES & FACTUREN" in spaced
              capitals left the search field no room at 390px. */}
          <header className="doc-chrome sticky top-0 z-30 flex h-[var(--panel-topbar-h)] items-center gap-[8px] border-b border-line/12 bg-background/85 px-[16px] backdrop-blur sm:gap-4 sm:px-6">
            <p className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:block">
              {current?.label ?? "Eigenaarspaneel"}
            </p>

            <div className="flex min-w-0 max-w-md flex-1 sm:mx-2">
              {/* The index searches enquiries and documents by name, so
                  it is data too — no search bar before a session. */}
              {signedIn && <PanelSearch items={search} />}
            </div>

            {signedIn && attention && attention.count > 0 && (
              <Link
                href={attention.href}
                title={attention.title}
                className="relative grid size-9 shrink-0 place-items-center rounded-full border border-line/20 text-muted transition-colors hover:border-gronn-ember hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]"
              >
                <BellIcon size={16} aria-hidden />
                <span className="sr-only">{attention.title}</span>
                <span
                  aria-hidden
                  className="absolute -right-1 -top-1 min-w-4 rounded-full bg-gronn-ember-strong px-1 text-center font-mono text-[9.5px] leading-4 tabular-nums text-gronn-white"
                >
                  {attention.count}
                </span>
              </Link>
            )}

            {/* The way back to the live site, on a phone.
                
                It used to be a green pill at the end of the navigation
                strip, and it was the ONLY reason that strip overflowed:
                measured on a 412px phone, the surfaces themselves end at
                332px and this pushed the content to 498px, so it sat
                half off the screen edge looking broken. It is also not a
                surface — the strip lists screens of the panel, and this
                leaves the panel. Above `lg` the rail's own card carries
                it, so this is phone-only. */}
            {signedIn && (
              <Link
                href="/"
                aria-label="Bekijk de site"
                title="Bekijk de site"
                className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:text-gronn-ember focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)] lg:hidden"
              >
                <ExternalLinkIcon size={16} aria-hidden />
              </Link>
            )}

            <div className={cn("flex items-center gap-2.5", !signedIn && "hidden")}>
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded-full bg-gronn-green font-mono text-[12px] font-medium text-gronn-white"
              >
                {(user ?? "?").slice(0, 1).toUpperCase()}
              </span>
              {/* The address is chrome on a phone: the avatar and the
                  sign-out button carry the same fact in a fifth of the
                  width, and this block was what squeezed the search
                  field down to nothing on a 412px panel. */}
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-[13px] font-medium leading-tight">
                  Ingelogd
                </span>
                <span className="block truncate font-mono text-[10.5px] leading-tight text-muted">
                  {user ?? "—"}
                </span>
              </span>
              {signOutHref ? (
                // A POST, not a link: a GET that destroys a session is
                // followed by every prefetcher and mail scanner.
                <form action={signOutHref} method="post" className="contents">
                  <button
                    type="submit"
                    aria-label="Uitloggen"
                    title="Uitloggen"
                    className="ml-1 grid size-9 place-items-center rounded-full text-muted transition-colors hover:text-gronn-ember focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]"
                  >
                    <LogOutIcon size={16} />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  // Back to `/dashboard`, not to the front of the site.
                  //
                  // Signing out of a tool is not leaving it. Nine times
                  // out of ten the reason is to sign in as somebody else
                  // — the studio's account, or a client's, to see what
                  // they see — and landing on the marketing homepage
                  // means finding the way back in from scratch.
                  //
                  // `/dashboard` signed out IS the gate: it offers both
                  // doors. So this lands exactly where the next step is.
                  onClick={() => signOut({ callbackUrl: "/dashboard" })}
                  aria-label="Uitloggen"
                  title="Uitloggen"
                  className="ml-1 grid size-9 place-items-center rounded-full text-muted transition-colors hover:text-gronn-ember focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[color:var(--focus-ring)]"
                >
                  <LogOutIcon size={16} />
                </button>
              )}
            </div>
          </header>

          {/* The rail, as a strip, on phones only.

              Not the sidebar shrunk: a 256px column on a 390px screen
              leaves 134px for the dossier it is supposed to frame. This
              is the same `groups` the rail renders — one source, so a
              surface added to one appears in the other — laid out as a
              scrollable row of pills within thumb reach of the top bar.

              `overflow-x-auto` on the strip and nowhere else: the page
              body must never scroll sideways, but a row of pills
              legitimately can. Since 25 Sep 2026 it carries the owner's
              whole panel — nine pills, some 1100px — so for the owner it
              always does, and the effect above keeps the current pill in
              view. A hairline between the groups stands in for the rail's
              "Algemeen" heading.

              Every size in px, none in rem (CLAUDE.md, "tekst groeit,
              chroom niet"): at 125% text a rem strip grew taller than the
              sticky offset the pages below were laid out against. */}
          {phoneReady && (
            <nav
              ref={strip}
              aria-label="Beheer"
              className="doc-chrome sticky top-[var(--panel-topbar-h)] z-20 flex gap-[8px] overflow-x-auto overscroll-x-contain border-b border-line/12 bg-background/85 px-[16px] py-[10px] backdrop-blur [scrollbar-width:none] lg:hidden"
            >
              {phone.map((group, gi) => (
                <Fragment key={group.title ?? gi}>
                  {gi > 0 && (
                    <span
                      aria-hidden
                      className="my-[10px] w-px shrink-0 bg-line/20"
                    />
                  )}
                  {group.items.map(({ href, label, icon, badge }) => {
                    const isCurrent = active === href
                    const Icon = ICONS[icon]
                    return (
                      <Link
                        key={href}
                        href={href}
                        aria-current={isCurrent ? "page" : undefined}
                        className={cn(
                          "flex min-h-[44px] shrink-0 items-center gap-[8px] rounded-full border px-[16px] text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[color:var(--focus-ring)]",
                          isCurrent
                            ? "border-gronn-green bg-gronn-green/10 font-medium text-foreground"
                            : "border-line/20 text-muted active:border-accent active:text-foreground"
                        )}
                      >
                        <Icon size={16} className="shrink-0" />
                        <span className="whitespace-nowrap">{label}</span>
                        {badge !== undefined && badge > 0 && (
                          <span className="rounded-full bg-gronn-ember-strong px-[6px] py-px font-mono text-[9.5px] tabular-nums text-gronn-white">
                            {badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </Fragment>
              ))}
            </nav>
          )}

          {children}
        </div>
      </div>
    </div>
  )
}
