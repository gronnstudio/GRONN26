"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Instellingen } from "@/components/weergave"
import { OPEN_ZOEK } from "@/components/zoek"
import { T, type Tekst } from "@/components/taal"
import { useTaal } from "@/components/taal-klant"

// De kop zoals bij architectenbureaus (24 okt 2026, eigenaar: "maak een
// website zoals veel architecten pagina's en gebruik een van de bekendere UI
// systemen"): de naam links, een paar woorden rechts, verder niets. Op de
// telefoon één knop Menu die een paneel opent (shadcn/ui Sheet).
const PAGINAS: { href: string; label: Tekst; bij: string[] }[] = [
  { href: "/werk", label: { nl: "Werk", en: "Work" }, bij: ["/werk"] },
  { href: "/vijvers", label: { nl: "Vijvers", en: "Ponds" }, bij: ["/vijvers"] },
  { href: "/tuinen", label: { nl: "Tuinen", en: "Gardens" }, bij: ["/tuinen"] },
  { href: "/shop", label: "Shop", bij: ["/shop"] },
  { href: "/over", label: "Studio", bij: ["/over", "/techniek"] },
  { href: "/journaal", label: "Journaal", bij: ["/journaal"] },
]

const isHier = (pad: string, bij: string[]) => bij.some((b) => pad === b || pad.startsWith(b + "/"))

export function Kop() {
  const pad = usePathname()
  const taal = useTaal()
  const [open, setOpen] = useState(false)

  // een andere pagina: het paneel gaat dicht
  const [vorigPad, setVorigPad] = useState(pad)
  if (pad !== vorigPad) {
    setVorigPad(pad)
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="wrap flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex min-h-[var(--raak)] items-center gap-3 no-underline" aria-label={taal === "en" ? "GRØNN Studio, to the home page" : "GRØNN Studio, naar de voorpagina"}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/woordmerk-primair-antraciet.svg" alt="" className="h-[15px] w-auto dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/woordmerk-primair.svg" alt="" className="hidden h-[15px] w-auto dark:block" />
        </Link>

        <nav aria-label={taal === "en" ? "Main menu" : "Hoofdmenu"} className="hidden lg:block">
          <ul className="m-0 flex list-none items-center gap-8 p-0 text-[14px]">
            {PAGINAS.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  aria-current={isHier(pad, p.bij) ? "page" : undefined}
                  className="flex min-h-[var(--raak)] items-center text-muted-foreground no-underline transition-colors hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:underline aria-[current=page]:underline-offset-[6px]"
                >
                  <T t={p.label} />
                </Link>
              </li>
            ))}
            <li>
              <Link href="/kennismaken" className="flex min-h-[var(--raak)] items-center text-oranje-tekst no-underline hover:underline hover:underline-offset-[6px]">
                <T t={{ nl: "Kennismaken", en: "Get in touch" }} />
              </Link>
            </li>
          </ul>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" className="h-[var(--raak)] px-0 text-[14px] font-normal hover:bg-transparent lg:px-3">
              Menu
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full gap-0 overflow-y-auto px-[var(--goot)] pt-20 pb-10 sm:max-w-md">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SheetDescription className="sr-only">
              <T t={{ nl: "Pagina’s, zoeken en weergave", en: "Pages, search and display" }} />
            </SheetDescription>
            <ul className="m-0 list-none p-0">
              {[...PAGINAS, { href: "/kennismaken", label: { nl: "Kennismaken", en: "Get in touch" }, bij: ["/kennismaken"] }].map((p) => (
                <li key={p.href} className="border-b border-border">
                  <Link
                    href={p.href}
                    aria-current={isHier(pad, p.bij) ? "page" : undefined}
                    className="flex min-h-[56px] items-center justify-between text-[24px] font-light tracking-[-.01em] no-underline aria-[current=page]:text-oranje-tekst"
                  >
                    <T t={p.label} />
                    <span aria-hidden className="text-muted-foreground">→</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Button
              variant="outline"
              className="mt-8 h-[var(--knop)] justify-start text-[14px] font-normal"
              onClick={() => {
                setOpen(false)
                setTimeout(() => dispatchEvent(new Event(OPEN_ZOEK)), 300)
              }}
            >
              <T t={{ nl: "Zoek op de site", en: "Search the site" }} />
            </Button>
            <Separator className="my-8" />
            <p className="lbl m-0 mb-4 text-muted-foreground"><T t={{ nl: "Weergave", en: "Display" }} /></p>
            <Instellingen />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
