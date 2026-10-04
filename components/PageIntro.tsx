// De opening van een gewone pagina: een mono-label, een kop, en zo nodig
// één alinea. Links uitgelijnd, met ruimte eromheen.
export function PageIntro({ label, titel, children }: { label: string; titel: string; children?: React.ReactNode }) {
  return (
    <header className="raster pb-[var(--ruimte-blok)] pt-[clamp(160px,22vh,240px)]">
      <p className="tekst-label col-span-4 text-muted md:col-span-3">{label}</p>
      <h1 className="tekst-h1 col-span-4 mt-[16px] md:col-span-8 md:col-start-4 md:mt-0">{titel}</h1>
      {children && <div className="tekst-groot col-span-4 mt-[32px] max-w-[38rem] text-muted md:col-span-6 md:col-start-4">{children}</div>}
    </header>
  )
}
