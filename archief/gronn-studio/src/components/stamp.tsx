import { Brandmark } from "@/components/brandmark"
import { cn } from "@/lib/utils"

// Slowly rotating circular text stamp with the brandmark at its centre —
// a brand device (kept in English like a logo), frozen under reduced-motion.
export function Stamp({ className }: { className?: string }) {
  return (
    <div className={cn("relative size-28", className)} aria-hidden>
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full motion-safe:animate-[spin-slow_28s_linear_infinite]"
      >
        <defs>
          <path
            id="stamp-circle"
            d="M50,50 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0"
          />
        </defs>
        {/* tracking tuned so the text closes the r=40 ring (~251 units) */}
        <text className="fill-current font-mono text-[8px] uppercase tracking-[0.35em]">
          <textPath href="#stamp-circle">
            GRØNN Studio · Rooted in Nature ·
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Brandmark className="h-8" />
      </div>
    </div>
  )
}
