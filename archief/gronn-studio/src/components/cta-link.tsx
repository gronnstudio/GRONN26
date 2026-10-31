import { LocaleLink as Link } from "@/components/locale-link"
import { ArrowRightIcon } from "lucide-react"

import { Magnetic } from "@/components/motion/magnetic"
import { cn } from "@/lib/utils"

// Green carries the brand; ember answers the hand — every hover warms to
// the brandmark orange.
const VARIANTS = {
  primary:
    "bg-gronn-green text-gronn-white hover:bg-gronn-ember-strong hover:text-gronn-white",
  outline:
    "border border-line/30 text-foreground hover:border-gronn-ember hover:bg-gronn-ember/10",
  ghost: "text-accent hover:text-gronn-ember",
} as const

export function CtaLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string
  children: React.ReactNode
  variant?: keyof typeof VARIANTS
  className?: string
}) {
  return (
    <Magnetic>
      <Link
        href={href}
        className={cn(
          "group/cta inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-wide transition-colors duration-300",
          VARIANTS[variant],
          className
        )}
      >
        {children}
        {/* Arrow swap: exits right, re-enters from the left */}
        <span
          aria-hidden
          className="relative size-4 overflow-hidden"
        >
          <ArrowRightIcon className="absolute size-4 transition-transform duration-300 ease-out group-hover/cta:translate-x-5 motion-reduce:transition-none motion-reduce:group-hover/cta:translate-x-0" />
          <ArrowRightIcon className="absolute size-4 -translate-x-5 transition-transform duration-300 ease-out group-hover/cta:translate-x-0 motion-reduce:hidden" />
        </span>
      </Link>
    </Magnetic>
  )
}
