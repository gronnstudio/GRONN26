import Link from "next/link"
import { BUSINESS } from "@/lib/business"

// Voet A uit de wireframes (WF-027, colofon in vier kolommen).
export function Voet() {
  const a = BUSINESS.address
  return (
    <footer className="wrap mt-[clamp(96px,12vw,180px)] border-t border-lijn py-12">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        <div>
          <p className="lbl m-0 text-gedempt">Studio</p>
          <p className="mt-3 leading-relaxed">
            {BUSINESS.name}
            <br />
            {a.street}
            <br />
            {a.postalCode} {a.city}
          </p>
        </div>
        <div>
          <p className="lbl m-0 text-gedempt">Contact</p>
          <p className="mt-3 leading-relaxed">
            <a href={BUSINESS.emailHref}>{BUSINESS.email}</a>
            <br />
            <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>
            <br />
            <a href={BUSINESS.instagram}>Instagram</a> · <a href={BUSINESS.whatsapp}>WhatsApp</a>
          </p>
        </div>
        <div>
          <p className="lbl m-0 text-gedempt">Pagina&apos;s</p>
          <ul className="mt-3 list-none space-y-1 p-0">
            {[
              ["/vijvers", "Vijvers"],
              ["/tuinen", "Tuinen"],
              ["/werk", "Werk"],
              ["/over", "Over"],
              ["/kennismaken", "Kennismaken"],
              ["/faq", "Veelgestelde vragen"],
            ].map(([h, t]) => (
              <li key={h}>
                <Link href={h}>{t}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="lbl m-0 text-gedempt">Klein</p>
          <p className="mt-3 leading-relaxed text-gedempt">
            KVK {BUSINESS.kvk}
            <br />
            BTW {BUSINESS.btw}
            <br />
            <Link href="/privacy">Privacy</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
