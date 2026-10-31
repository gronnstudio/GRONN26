import type { Locale } from "@/lib/i18n"
import { isLocale } from "@/lib/locale"

/**
 * De taal van de linkpagina uit de waarde van de taalcookie
 * (`LANG_COOKIE`). Zonder (geldige) keuze Nederlands: de bio-link is voor
 * een Nederlands publiek. Eén functie voor layout en pagina, zodat ze het
 * nooit oneens zijn.
 */
export function linksTaal(cookie: string | undefined): Locale {
  return cookie && isLocale(cookie) ? cookie : "nl"
}
