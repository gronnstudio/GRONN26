import Image from "next/image"

import { CHANNELS } from "@/components/layout/channel-icons"
import { BUSINESS } from "@/lib/business"
import { pick, type Locale } from "@/lib/i18n"

import { Knop } from "./knop"
import { type Toon } from "./toon"

const WHATSAPP = CHANNELS.find((c) => c.key === "whatsapp")!

/**
 * Nick rechtstreeks, naast zijn gezicht (naar Langenegger Naturgärten,
 * eigenaar 2 okt 2026: "nee precies dat"): één zin en een randknop naar
 * WhatsApp uit business.ts, in een nieuw tabblad zoals de dock.
 * `portret` zet een rond portret van 56px ervoor, voor een plek waar zijn
 * foto nog niet staat (contact); op Studio staat het grote portret erboven.
 * Een randknop, geen oranje vlak: de pagina heeft haar ene accent al.
 */
export function WhatsAppNick({
  locale,
  portret,
  toon = "grond",
  className = "",
}: {
  locale: Locale
  portret?: { src: string }
  toon?: Toon
  className?: string
}) {
  const t = (v: { nl: string; en: string }) => pick(v, locale)
  return (
    <div data-element="WhatsAppNick" className={`flex items-start gap-[16px] ${className}`}>
      {portret && (
        <Image
          src={portret.src}
          alt=""
          width={112}
          height={112}
          sizes="56px"
          className="size-[56px] shrink-0 rounded-full object-cover object-[50%_30%]"
        />
      )}
      <div className="grid justify-items-start gap-[10px]">
        <p className={`text-[15px] leading-snug ${toon === "bos" ? "text-gronn-white/85" : "text-foreground/80"}`}>
          {portret && <span className="block font-semibold">Nick Peters</span>}
          {t({ nl: "Liever even appen? Dat komt rechtstreeks bij mij.", en: "Rather send a message? It comes straight to me." })}
        </p>
        <Knop href={BUSINESS.whatsapp} soort="rand" klein nieuwTabblad>
          <span className="inline-flex items-center gap-[8px]">
            <span aria-hidden className="[&_svg]:size-[18px]">{WHATSAPP.icon}</span>
            {t({ nl: "WhatsApp Nick", en: "WhatsApp Nick" })}
          </span>
        </Knop>
      </div>
    </div>
  )
}
