"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

import blurMap from "@/lib/blur-map.json"

// Opening sequence: the brand tile brought to life — the green-washed
// forest photograph as the full field, the white lockup growing softly
// into place, then the whole veil lifts. Plays once per session; skipped
// entirely under reduced-motion. Content renders behind it from the first
// frame, so nothing blocks the page.
//
// The whole sequence is CSS-driven and the veil is in the server HTML
// (preloader-* rules in globals.css): the photograph is the page's
// largest contentful element, and when it mounted after hydration the
// measured LCP on a slow phone was whenever React finished — seconds of
// pure render delay. Now the image is discoverable in the initial
// document, loads with high priority, and the veil shows/animates/lifts
// before a single byte of JS runs. An inline script in the root layout
// stamps `intro-seen` on <html> from sessionStorage so repeat pages
// never show it (same boot pattern as the theme and recording blur).
// React's only job is removing the spent veil from the DOM.
export function Preloader() {
  const [gone, setGone] = useState(false)

  useEffect(() => {
    // The CSS lift ends at ~2.9 s; remove the dead node a beat later.
    const timer = setTimeout(() => setGone(true), 3200)
    return () => clearTimeout(timer)
  }, [])

  if (gone) return null

  return (
    <div aria-hidden className="preloader-veil fixed inset-0 z-[90] overflow-hidden bg-[#0a1510]">
      <div className="preloader-photo absolute inset-0">
        {/* The blur placeholder is an inline data URL painted as the
            img's CSS background in the server HTML — zero extra
            requests, so it cannot delay first paint. It only replaces
            the flat #0a1510 veil with a soft wash of the forest photo
            while the real bytes stream in. LCP is unaffected: the
            lockup below is the counted candidate, and this image keeps
            its priority/fetchPriority untouched. */}
        <Image
          src="/intro-bg.jpg"
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover"
          draggable={false}
          placeholder="blur"
          blurDataURL={(blurMap as Record<string, string>)["/intro-bg.jpg"]}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center px-8">
        {/* The lockup is visible from the first frame (no opacity fade):
            an image whose first paint is transparent is permanently
            excluded as an LCP candidate, and this is the boot screen's
            only counted candidate — the fullscreen photo behind it is
            ignored as a "background". The soft growth stays. */}
        <div className="preloader-lockup w-full max-w-md select-none sm:max-w-xl">
          {/* Vector lockup: same aspect ratio as the PNG it replaced
              (3.28 vs 3.27) but a fraction of the bytes, which matters
              here because this is the boot screen's LCP element. */}
          <Image
            src="/brand/logo-white.svg"
            alt=""
            width={784}
            height={239}
            priority
            sizes="(min-width: 640px) 576px, 448px"
            className="h-auto w-full"
            draggable={false}
          />
        </div>
      </div>
    </div>
  )
}
