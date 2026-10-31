"use client"

import { useTheme } from "next-themes"

import { useT } from "@/components/language-provider"
import { useThemeMode } from "@/components/theme-mode-provider"
import { DEFAULT_SET, resolveAutoTheme } from "@/lib/themes"
import { useHydrated } from "@/lib/use-hydrated"

// The default palette control: one button, three states, cycling
//   Auto → Golden Hour → Blue Hour → Auto
//
// Folding "follow the clock" into the same control as the two palettes it
// chooses between means there is one thing to understand instead of a
// switch plus a picker (owner rule 1). On Auto it names the palette the
// clock has actually landed on — "AUTO · LIGHT" (the palettes were called Golden and Blue Hour until 24 Sep 2026) — so the state is
// never a mystery: a visitor can see both that the site is deciding and
// what it decided.
export function DefaultThemeToggle() {
  const t = useT()
  const { theme } = useTheme()
  const { mode, enableAuto, chooseTheme } = useThemeMode()
  const mounted = useHydrated()

  const options = DEFAULT_SET.options
  const auto = mode === "auto"
  // On auto the clock decides; otherwise it is whatever is applied, and
  // null when the visitor is off in the concept set.
  const activeName = auto ? resolveAutoTheme() : theme
  const active = options.find((option) => option.name === activeName) ?? null

  // Auto → first palette → second → back to Auto.
  const step = () => {
    if (auto) return chooseTheme(options[0].name)
    const index = options.findIndex((option) => option.name === theme)
    if (index === -1) return chooseTheme(options[0].name)
    if (index === options.length - 1) return enableAuto()
    chooseTheme(options[index + 1].name)
  }

  const nextLabel = (() => {
    if (auto) return t(options[0].label)
    const index = options.findIndex((option) => option.name === theme)
    if (index === -1) return t(options[0].label)
    if (index === options.length - 1) return t({ en: "Auto", nl: "Auto" })
    return t(options[index + 1].label)
  })()

  const stateLabel = (() => {
    if (!mounted) return "…"
    if (auto) {
      return `${t({ en: "Auto", nl: "Auto" })} · ${active ? t(active.label) : "—"}`
    }
    return active ? t(active.label) : "—"
  })()

  return (
    <button
      type="button"
      onClick={step}
      aria-label={
        mounted
          ? `${t(DEFAULT_SET.label)}: ${stateLabel}${
              auto
                ? ` (${t({ en: "following the time of day", nl: "volgt het tijdstip van de dag" })})`
                : ""
            } — ${t({ en: "switch to", nl: "wissel naar" })} ${nextLabel}`
          : t({ en: "Switch theme", nl: "Wissel thema" })
      }
      title={mounted ? `${t(DEFAULT_SET.label)} → ${nextLabel}` : undefined}
      // 28 px tall by design (fine line-work); tap-target lifts only the
      // press to 44. active: mirrors hover for touch, where :hover either
      // never fires or sticks after the tap.
      className="tap-target flex items-center gap-2 rounded-full border border-line/20 py-1.5 pl-2 pr-3 text-xs text-muted transition-colors hover:border-gronn-green hover:text-foreground active:border-gronn-green active:text-foreground"
    >
      <span
        aria-hidden
        className="flex size-4 items-center justify-center rounded-full border border-line/25"
        style={{ backgroundColor: mounted && active ? active.bg : undefined }}
      >
        <span
          className="size-1.5 rounded-full"
          style={{ backgroundColor: mounted && active ? active.dot : undefined }}
        />
      </span>
      <span className="font-mono uppercase tracking-wider">
        {/* Full `muted`, never a faded one: this label sits at 12px,
              where WCAG asks 4.5:1, and text-muted/70 measured 3.43:1 on
              the light grounds. It only ever lived inside the curtain,
              which no axe scan opened — the panel that replaced it is
              scanned, and caught it. */}
        <span className="text-muted">{t(DEFAULT_SET.label)}</span>{" "}
        <span className="text-left">{stateLabel}</span>
      </span>
    </button>
  )
}
