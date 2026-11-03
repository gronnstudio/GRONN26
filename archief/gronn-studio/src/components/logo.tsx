import Image from "next/image"

import { cn } from "@/lib/utils"

// The GRØNN wordmark, from the brand vectors. Brand Guide 2026: the
// wordmark stands alone ("woordmerk zonder tagline") in one flat colour.
// The woordmerk-* files are the lockup vectors with their viewBox cropped
// to the wordmark — the paths are untouched, the old "Designing Living
// Ecosystems" line simply falls outside the frame. Both variants sit in the markup and CSS picks one, so
// there is no hydration flicker:
//
//   light → logo-antraciet: the black vector with its one fill set to
//           antraciet #202020 (Brand Guide 2026: one flat colour)
//   dark  → woordmerk-primair: the primary lockup, white with the orange
//           P of Peters in the R. Owner, 28 Sep 2026: "gebruik die ook in
//           de site. Sowieso op darkmode past deze goed" — his own logo
//           outranks the guide's one-flat-colour rule on dark grounds.
//
// `primair` (the menu bar on top; owner, 29 Sep 2026: "use primary in
// the dock on top!") puts the primary logo on the light side too:
// woordmerk-primair-antraciet is woordmerk-primair with its white fills
// set to antraciet #202020, so the orange P stays and the letters read
// on light glass, and without the grey gradient shadow in the P that the
// owner wanted gone on the hero ("dit moet weg op hero"). Paths untouched.
//
// These replaced 1532 px PNGs — ~100 KB of raster for a 40 px-tall
// lockup, both variants downloading on every page. The vectors are a
// fraction of that and stay sharp at any size. Their viewBoxes are
// cropped to the artwork; the source files carry a 1024×768 canvas with
// the lockup floating in the middle, which would otherwise render the
// logo small inside a wall of padding.
const WIDTH = 784
const HEIGHT = 167

export function Logo({ className, primair = false }: { className?: string; primair?: boolean }) {
  return (
    <span className={cn("block", className)}>
      <Image
        src={primair ? "/brand/woordmerk-primair-antraciet.svg" : "/brand/woordmerk-antraciet.svg"}
        alt="GRØNN"
        width={WIDTH}
        height={HEIGHT}
        priority
        className="h-full w-auto select-none dark:hidden"
        draggable={false}
      />
      <Image
        src="/brand/woordmerk-primair.svg"
        alt=""
        aria-hidden
        width={WIDTH}
        height={HEIGHT}
        priority
        className="hidden h-full w-auto select-none dark:block"
        draggable={false}
      />
    </span>
  )
}
