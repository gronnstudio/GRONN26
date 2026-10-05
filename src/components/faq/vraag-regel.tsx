import Link from "next/link"
import type { Vraag } from "@/lib/data/vragen-lijst"
import { Beide } from "@/components/taal"
import { Lopend } from "./lopend"

// Eén vraag als openklapbare regel (WF-032): nummer, vraag, plus/min;
// het antwoord in een smalle kolom eronder. Geen JavaScript: <details>.
// Twee talen: `vraag` is de Nederlandse, `en` dezelfde vraag in het Engels
// (zelfde id, uit dezelfde bron). Kop en antwoord staan er allebei; CSS toont er één.
export function VraagRegel({ vraag: nlVraag, en, nummer, open }: { vraag: Vraag; en: Vraag; nummer: number; open?: boolean }) {
  return (
    <details id={nlVraag.id} open={open} className="group scroll-mt-6 border-t border-lijn last:border-b">
      <summary className="grid cursor-pointer list-none grid-cols-[32px_minmax(0,1fr)_20px] items-baseline gap-x-3 py-[18px] after:text-right after:text-[20px] after:font-light after:leading-none after:text-gedempt after:content-['+'] group-open:after:content-['−'] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current md:grid-cols-[60px_minmax(0,1fr)_24px] md:gap-x-8 md:py-6 [&::-webkit-details-marker]:hidden">
        <span className="lbl text-gedempt">{String(nummer).padStart(2, "0")}</span>
        <h2 className="syne m-0 text-[clamp(20px,2.1vw,28px)] leading-[1.2] tracking-[-.02em]">
          <Beide nl={nlVraag.vraag} en={en.vraag} />
        </h2>
      </summary>
      <Beide nl={<Antwoord vraag={nlVraag} />} en={<Antwoord vraag={en} />} />
    </details>
  )
}

function Antwoord({ vraag }: { vraag: Vraag }) {
  // De werkwijze is een reeks stappen; de andere lijsten zijn naam + prijs.
  const stappen = vraag.id === "hoe-gaat-zo-n-traject"
  return (
    <>
      <div className="mb-8 ml-11 max-w-[62ch] leading-[1.65] md:ml-[92px]">
        {vraag.alineas.map((a, i) => (
          <p key={i} className="mt-0 mb-3.5">
            <Lopend tekst={a} />
          </p>
        ))}
        {vraag.lijst &&
          (stappen ? (
            <ol className="mt-1 mb-3.5 list-none p-0">
              {vraag.lijst.map((r, i) => (
                <li key={i} className="grid grid-cols-[32px_minmax(0,1fr)] border-b border-lijn py-2">
                  <span className="lbl pt-[3px] text-gedempt" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    {r.kop && <strong className="block font-semibold">{r.kop}</strong>}
                    <span className="text-gedempt">{r.tekst}</span>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <dl className="mt-1 mb-3.5 border-t border-lijn">
              {vraag.lijst.map((r, i) => (
                <div key={i} className="grid grid-cols-1 gap-y-0.5 border-b border-lijn py-2.5 sm:grid-cols-2 sm:gap-x-6">
                  <dt className="font-semibold">{r.kop}</dt>
                  <dd className="m-0 text-gedempt">
                    <Lopend tekst={r.tekst} />
                  </dd>
                </div>
              ))}
            </dl>
          ))}
        {vraag.verder && (
          <Link className="lnk mt-1.5 inline-block" href={vraag.verder.href}>
            {vraag.verder.label} →
          </Link>
        )}
      </div>
    </>
  )
}
