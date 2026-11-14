import { ViewTransition, type ReactNode } from "react"

// Een template wordt bij elke navigatie opnieuw gemaakt (een layout niet),
// dus enter en exit vuren hier. Alleen links met transitionTypes={["schuif"]}
// laten de nieuwe pagina van rechts binnenschuiven (eigenaar, 13 nov 2026);
// elke andere navigatie, ook terug in de browser, wisselt gewoon.
export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={{ schuif: "schuif-in", default: "none" }} exit={{ schuif: "schuif-uit", default: "none" }} default="none">
      {/* een eigen ondergrond, zodat de oude pagina niet door de nieuwe heen schijnt tijdens het schuiven */}
      <div className="vt-pagina">{children}</div>
    </ViewTransition>
  )
}
