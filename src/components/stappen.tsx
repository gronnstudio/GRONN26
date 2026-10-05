import { T } from "@/components/taal"
import { WERKWIJZE } from "@/lib/data/teksten"

// Zo werk ik: zes stappen. Desktop: uitleg ernaast; telefoon: open te tikken
// (details/summary, zonder JS).
export function Stappen() {
  return (
    <div className="mt-8">
      {WERKWIJZE.map((s, i) => (
        <details key={i} className="group border-t border-lijn last:border-b md:pointer-events-none" open={false}>
          <summary className="grid cursor-pointer list-none grid-cols-[32px_minmax(0,1fr)_20px] items-baseline gap-x-3 py-[18px] md:grid-cols-[60px_4fr_7fr] md:gap-x-8 md:py-[26px] [&::-webkit-details-marker]:hidden">
            <span className="lbl">{String(i + 1).padStart(2, "0")}</span>
            <span className="syne text-[clamp(22px,2.3vw,32px)] tracking-[-.02em]"><T t={s.titel} /></span>
            <span className="hidden leading-relaxed text-gedempt md:block">
              <T t={s.tekst} />
            </span>
            <span aria-hidden className="text-gedempt md:hidden">
              <span className="group-open:hidden">+</span>
              <span className="hidden group-open:inline">−</span>
            </span>
          </summary>
          <p className="mt-0 mb-[18px] ml-11 leading-relaxed text-gedempt md:hidden">
            <T t={s.tekst} />
          </p>
        </details>
      ))}
    </div>
  )
}
