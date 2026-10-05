import type { ReactNode } from "react"

// De paginakop vanaf WF-019 (wf.css .pagina-kop): label links, titel rechts,
// inleiding eronder in de rechterkolom.
export function PaginaKop({ label, titel, inleiding }: { label: string; titel: string; inleiding?: ReactNode }) {
  return (
    <section className="grid gap-y-4 pt-[clamp(56px,9vw,140px)] md:grid-cols-[3fr_9fr] md:gap-x-8">
      <p className="lbl m-0 text-gedempt">{label}</p>
      <h1 className="syne m-0 text-[clamp(48px,7.5vw,104px)] leading-none tracking-[-.04em]">{titel}</h1>
      {inleiding ? (
        <p className="m-0 max-w-[38ch] text-[clamp(18px,1.7vw,24px)] leading-[1.5] text-gedempt md:col-start-2 md:mt-7">{inleiding}</p>
      ) : null}
    </section>
  )
}
