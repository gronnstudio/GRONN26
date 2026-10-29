import { cn } from "@/lib/utils"

// The real GRØNN brandmark, cropped at full resolution from the brand's
// primary logo asset (J:\...\_brandmark\logo\color.png). Rendered as an
// image, not a traced approximation.
export function Brandmark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brandmark.png"
      alt=""
      aria-hidden
      className={cn("h-6 w-auto select-none", className)}
      draggable={false}
    />
  )
}
