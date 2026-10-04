// Eén grote uitspraak met een label in de marge en, verschoven eronder,
// een gewone alinea. De witruimte eromheen hoort erbij.
export function EditorialStatement({
  label,
  uitspraak,
  children,
  maat = "reus",
}: {
  label: string
  uitspraak: string
  children?: React.ReactNode
  maat?: "reus" | "spread"
}) {
  const regels = uitspraak.split("\n")
  return (
    <section aria-label={label} className="raster py-[var(--ruimte-sectie)]">
      <p className="tekst-label col-span-4 text-muted md:col-span-12">{label}</p>
      <p className={`${maat === "reus" ? "tekst-reus" : "tekst-spread"} col-span-4 mt-[32px] md:col-span-11`}>
        {regels.map((r) => (
          <span key={r} className="scroll-regel onthul-regel"><span>{r}</span></span>
        ))}
      </p>
      {children && (
        <div className="tekst-groot col-span-4 mt-[56px] max-w-[30ch] md:col-span-4 md:col-start-8 md:mt-[96px]">{children}</div>
      )}
    </section>
  )
}
