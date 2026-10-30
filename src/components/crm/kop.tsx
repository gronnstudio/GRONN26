import Link from "next/link"
import { TerugVooruit } from "./terug-vooruit"

// De kop van elke pagina in het systeem: kruimelpad, titel, één zin uitleg
// en rechts de acties van die pagina. Daaronder eventueel tabbladen.
export type Stap = { naam: string; href?: string }

export function Kop({ pad = [], titel, sub, children }: { pad?: Stap[]; titel: React.ReactNode; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="border-b border-lijn px-4 pt-5 pb-5 sm:px-8 print:hidden">
      <div className="flex items-center justify-between gap-4">
      <nav aria-label="Kruimelpad" className="min-h-[18px] text-[12px] text-gedempt">
        <ol className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {pad.map((p, i) => (
            <li key={i} className="flex gap-1.5">
              {i > 0 && <span aria-hidden>/</span>}
              {p.href ? <Link href={p.href} className="hover:text-inkt">{p.naam}</Link> : <span aria-current="page">{p.naam}</span>}
            </li>
          ))}
        </ol>
      </nav>
      <TerugVooruit />
      </div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div className="min-w-0">
          <h1 className="syne m-0 text-[30px] leading-[1.1] tracking-[-0.01em]">{titel}</h1>
          {sub && <div className="m-0 mt-1.5 max-w-[80ch] text-[14px] text-gedempt">{sub}</div>}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </header>
  )
}

/** Tabbladen als gewone links met ?tab=, zodat je een tab kunt delen of bewaren. */
export function Tabs({ tabs, actief, href, label }: { tabs: { id: string; naam: string; aantal?: number }[]; actief: string; href: (id: string) => string; label: string }) {
  return (
    <nav aria-label={label} className="flex gap-1 border-b border-lijn px-8 print:hidden">
      {tabs.map((t) => (
        <Link
          key={t.id}
          href={href(t.id)}
          aria-current={t.id === actief ? "page" : undefined}
          className={`-mb-px border-b-2 px-3 py-2.5 text-[14px] font-semibold ${t.id === actief ? "border-accent text-inkt" : "border-transparent text-gedempt hover:text-inkt"}`}
        >
          {t.naam}
          {t.aantal ? <span className="crm-cijfer ml-1.5 text-[12px] text-gedempt">{t.aantal}</span> : null}
        </Link>
      ))}
    </nav>
  )
}

/** Een getal met wat het is; met href is het een link naar de lijst erachter. */
export function Cijfer({ waarde, label, href, let: aandacht, uitleg }: { waarde: string; label: string; href?: string; let?: boolean; uitleg?: string }) {
  const binnen = (
    <>
      <span className="crm-label block">{label}</span>
      <span className={`crm-cijfer mt-1.5 block text-[22px] font-medium whitespace-nowrap @max-[900px]:text-[16px] ${aandacht ? "text-let" : ""}`}>{waarde}</span>
      {uitleg && <span className="mt-0.5 block text-[12px] text-gedempt">{uitleg}</span>}
    </>
  )
  return href ? (
    <Link href={href} className="block px-5 py-4 transition-colors hover:bg-grond @max-[900px]:px-3">
      {binnen}
    </Link>
  ) : (
    <div className="px-5 py-4 @max-[900px]:px-3">{binnen}</div>
  )
}

/** Een rij cijfers in één paneel, met lijnen ertussen. */
export function Cijfers({ children }: { children: React.ReactNode }) {
  return <div className="@container crm-paneel grid auto-cols-fr grid-flow-col divide-x divide-lijn overflow-hidden">{children}</div>
}

export function Leeg({ children }: { children: React.ReactNode }) {
  return <p className="m-0 rounded-[12px] border border-dashed border-lijn-sterk px-6 py-8 text-center text-[14px] text-gedempt">{children}</p>
}

/** Een blok op een pagina met een kop en rechts een link of actie. */
export function Blok({ titel, rechts, children, className = "" }: { titel: string; rechts?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section aria-label={titel} className={`min-w-0 ${className}`}>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="m-0 text-[15px] font-semibold">{titel}</h2>
        {rechts && <div className="text-[13px]">{rechts}</div>}
      </div>
      {children}
    </section>
  )
}
