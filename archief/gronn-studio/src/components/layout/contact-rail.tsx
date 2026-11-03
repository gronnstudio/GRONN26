"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { useT } from "@/components/language-provider"
import { BUSINESS } from "@/lib/business"
import { EASE_REVEAL } from "@/lib/motion"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// Floating contact rail pinned to the viewport's mid left, desktop only —
// phones keep the mobile dock (which carries the same links in its sheet).
// It waits out the hero and steps aside while the footer is on screen,
// since the footer already lists every contact channel.

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
}

const icons = {
  whatsapp: (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.1A8.8 8.8 0 1 0 12 3.2Z"
        {...stroke}
      />
      <path
        d="M9.1 8.2c-.5.3-.8.9-.7 1.5.4 2.6 2.4 4.6 5 5 .6.1 1.2-.2 1.5-.7l.5-.9-2-1-.9.9a5.6 5.6 0 0 1-2.4-2.4l.9-.9-1-2-.9.5Z"
        {...stroke}
      />
    </svg>
  ),
  instagram: (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" {...stroke} />
      <circle cx="12" cy="12" r="3.8" {...stroke} />
      <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
}

export function ContactRail() {
  const t = useT()
  const reduced = useReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let pastHero = false
    let footerInView = false
    const update = () => setVisible(pastHero && !footerInView)

    const onScroll = () => {
      pastHero = window.scrollY > window.innerHeight * 0.9
      update()
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()

    const footer = document.querySelector("footer")
    let io: IntersectionObserver | undefined
    if (footer) {
      io = new IntersectionObserver(([entry]) => {
        footerInView = entry.isIntersecting
        update()
      })
      io.observe(footer)
    }

    return () => {
      window.removeEventListener("scroll", onScroll)
      io?.disconnect()
    }
  }, [])

  const links = [
    {
      href: BUSINESS.whatsapp,
      icon: icons.whatsapp,
      label: "WhatsApp",
      // Brand colour on the MARK only. Same values and the same reasoning
      // as the menus (see channel-icons.tsx): WhatsApp's headline #25D366
      // is 1.75:1 on the Paper ground, far under the 3:1 non-text UI
      // needs, so this is their secondary green.
      color: "#128c7e",
      cursor: "chat",
      aria: t({
        en: "Chat on WhatsApp (opens in new tab)",
        nl: "Chat via WhatsApp (opent in nieuw tabblad)",
      }),
    },
    {
      href: BUSINESS.instagram,
      icon: icons.instagram,
      label: "Instagram",
      color: "#d6336c",
      cursor: "follow",
      aria: t({
        en: "GRØNN Studio on Instagram (opens in new tab)",
        nl: "GRØNN Studio op Instagram (opent in nieuw tabblad)",
      }),
    },
  ]

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          aria-label={t({ en: "Quick contact", nl: "Snel contact" })}
          initial={reduced ? { opacity: 0 } : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: -8 }}
          transition={{ duration: reduced ? 0 : 0.5, ease: EASE_REVEAL }}
          className="glass fixed top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-5 rounded-full px-2.5 py-6 md:flex"
          // md includes touch tablets, which have a landscape notch — the
          // rail sits on the left edge, so it is the inset that matters.
          style={{ left: "max(1.25rem, calc(env(safe-area-inset-left) + 0.5rem))" }}
        >
          <span aria-hidden className="h-10 w-px bg-line/15" />
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.aria}
              data-cursor={link.cursor}
              // The 20 px icon column is only 20 px wide; tap-target widens
              // the press to 44 without widening the rail. The ember answer
              // was hover-only — unreachable on a touch tablet — so press
              // and keyboard focus now get it too.
              className="tap-target group flex flex-col items-center gap-2 text-muted transition-colors duration-300 hover:text-gronn-ember focus-visible:text-gronn-ember active:text-gronn-ember"
            >
              {/* The mark carries the service's colour; the vertical
                  label stays in the site's own muted, and both still take
                  ember on hover, focus and press. */}
              <span aria-hidden style={{ color: link.color }}>
                {link.icon}
              </span>
              <span
                className="font-mono text-[10px] uppercase tracking-[0.25em]"
                style={{ writingMode: "vertical-rl" }}
              >
                {link.label}
              </span>
            </a>
          ))}
          <span aria-hidden className="h-10 w-px bg-line/15" />
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
