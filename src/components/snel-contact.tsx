import Link from "next/link"
import { T } from "@/components/taal"
import { BUSINESS } from "@/lib/business"

// Alleen op de telefoon (eigenaar, 16 okt 2026: "desktop en mobiel kunnen
// onafhankelijk worden gebouwd naar hun doel"). Wie op de telefoon kijkt,
// wil meestal snel iets vragen: een foto sturen, bellen of een afspraak.
// Desktop houdt de rustige route via Kennismaken.

// Het bericht staat al klaar; de bezoeker hoeft alleen de foto te kiezen.
const FOTO = `${BUSINESS.whatsapp}?text=${encodeURIComponent("Hoi Nick, hier een foto van mijn vijver of tuin.")}`

function WhatsApp() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.1A8.8 8.8 0 1 0 12 3.2Z" />
      <path d="M9.1 8.2c-.5.3-.8.9-.7 1.5.4 2.6 2.4 4.6 5 5 .6.1 1.2-.2 1.5-.7l.5-.9-2-1-.9.9a5.6 5.6 0 0 1-2.4-2.4l.9-.9-1-2-.9.5Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function SnelContact({ className = "" }: { className?: string }) {
  return (
    <section aria-labelledby="snel-contact" className={`md:hidden ${className}`}>
      <h2 id="snel-contact" className="lbl m-0 text-gedempt">
        <T t={{ nl: "Snel geregeld", en: "Quick contact" }} />
      </h2>
      <a href={FOTO} className="knop mt-[16px] w-full bg-oranje text-antraciet">
        <WhatsApp />
        <T t={{ nl: "Stuur een foto", en: "Send a photo" }} />
      </a>
      <div className="mt-[12px] grid grid-cols-2 gap-[12px]">
        <a href={BUSINESS.phoneHref} className="knop w-full border border-inkt text-inkt">
          <T t={{ nl: "Bellen", en: "Call" }} />
        </a>
        <Link href="/kennismaken" className="knop w-full border border-inkt text-inkt">
          <T t={{ nl: "Kennismaken", en: "Get in touch" }} />
        </Link>
      </div>
    </section>
  )
}
