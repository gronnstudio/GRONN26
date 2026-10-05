import Link from "next/link"
import { BUSINESS } from "@/lib/business"

// Het bosgroene Kennismaken-vlak waarmee ook de voorpagina eindigt (markup uit
// src/app/page.tsx), zodat het werk op dezelfde plek uitkomt.
export function Kennismaken() {
  return (
    <section
      aria-labelledby="werk-kennis"
      className="mt-[clamp(96px,12vw,180px)] flex flex-col items-center bg-bos px-[var(--goot)] pt-[clamp(56px,7vw,96px)] pb-[clamp(72px,9vw,140px)] text-center text-gebroken-wit"
    >
      <h2 id="werk-kennis" className="lbl m-0 font-normal">Kennismaken</h2>
      <Link href="/kennismaken" className="syne mt-5 text-[clamp(44px,6.5vw,88px)] leading-none tracking-[-.035em] no-underline">
        Kennismaken
      </Link>
      <p className="lbl mt-7 mb-0">
        <a href={BUSINESS.emailHref} className="no-underline">{BUSINESS.email}</a> ·{" "}
        <a href={BUSINESS.phoneHref} className="no-underline">{BUSINESS.phone}</a> · {BUSINESS.address.city} en omgeving
      </p>
    </section>
  )
}
