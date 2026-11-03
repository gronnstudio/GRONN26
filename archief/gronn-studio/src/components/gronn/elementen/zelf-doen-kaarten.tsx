import { pick, type L, type Locale } from "@/lib/i18n"

/**
 * Korte how-to's als drie kaarten naast elkaar (vanaf md), onder elkaar
 * op de telefoon: wanneer (mono), een kop die de regel ís, twee of drie
 * zinnen. Geen oranje: de sectie draagt haar accent in het label.
 * Elke kaart heeft een `id`, zodat een post of story ernaar kan linken.
 */
export function ZelfDoenKaarten({
  items,
  locale,
}: {
  items: { id: string; wanneer: L; titel: L; tekst: L }[]
  locale: Locale
}) {
  const t = (v: L) => pick(v, locale)
  return (
    <ol data-element="ZelfDoenKaarten" className="grid gap-[16px] md:grid-cols-3">
      {items.map((k, i) => (
        <li key={k.id} id={k.id} className="g-in scroll-mt-[96px] rounded-[16px] border border-line/10 bg-surface p-6 sm:p-8">
          <p className="font-mono text-[12px] uppercase tracking-[0.04em] text-muted">
            {String(i + 1).padStart(2, "0")} · {t(k.wanneer)}
          </p>
          <h3 className="mt-4 tekst-h3">{t(k.titel)}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">{t(k.tekst)}</p>
        </li>
      ))}
    </ol>
  )
}
