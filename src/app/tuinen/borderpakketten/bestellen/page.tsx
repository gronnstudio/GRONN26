import type { Metadata } from "next"
import Link from "next/link"
import { T } from "@/components/taal"
import { Opening } from "@/components/wereld/opening"
import { BORDERPAKKETTEN } from "@/lib/data/borderpakketten"
import { opslagAan } from "@/lib/beheer/stand"
import { mollieAan } from "@/lib/mollie"
import { BestelFormulier } from "./formulier"

export const metadata: Metadata = {
  title: "Borderpakket bestellen",
  robots: { index: false, follow: true },
}

export default async function Bestellen({ searchParams }: { searchParams: Promise<{ pakket?: string }> }) {
  const slug = (await searchParams).pakket
  const start = BORDERPAKKETTEN.find((p) => p.slug === slug)?.slug ?? BORDERPAKKETTEN[0].slug
  return (
    <>
      <Opening
        label={{ nl: "Borderpakketten · bestellen", en: "Border packages · order" }}
        titel={{ nl: "Bestellen", en: "Order" }}
        zin={<T t={{ nl: "Kies de maat en of ik hem aanplant of opstuur. Daarna betaal je met iDEAL, Wero of je creditcard.", en: "Choose the size and whether I plant or ship it. Then pay with iDEAL, Wero or your credit card." }} />}
      />
      <div className="wrap mt-[clamp(48px,6vw,96px)]">
        {mollieAan() && opslagAan() ? (
          <BestelFormulier start={start} />
        ) : (
          <p className="m-0 max-w-[60ch] text-[17px] leading-[1.55]">
            <T t={{ nl: "Online bestellen staat nog niet aan. ", en: "Online ordering isn’t on yet. " }} />
            <Link href={`/kennismaken?pakket=${start}`} className="lnk"><T t={{ nl: "Vraag het pakket aan →", en: "Ask about the package →" }} /></Link>
          </p>
        )}
      </div>
    </>
  )
}
