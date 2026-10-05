import type { ReactNode } from "react"

// De hoofdstukregel van WF-025: lijn erboven, nummer en naam als label.
export function Hoofdstuk({ id, children, rechts, onder = true }: { id: string; children: ReactNode; rechts?: ReactNode; onder?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 border-t border-lijn pt-3.5 ${onder ? "mb-[clamp(32px,4vw,56px)]" : ""}`}>
      <h2 className="lbl m-0 font-normal" id={id}>{children}</h2>
      {rechts ? <span className="lbl text-gedempt">{rechts}</span> : null}
    </div>
  )
}
