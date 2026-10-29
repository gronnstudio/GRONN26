/**
 * Het label op een plaatshouderbeeld. Een plaatshouder mag een
 * compositie dragen, maar nooit doorgaan voor eigen werk — dus staat dit
 * er altijd op zolang het geen echte foto is.
 *
 * `los`: hetzelfde label in de tekststroom in plaats van over een beeld —
 * voor een hele pagina die nog concept is (/checklist).
 */
export function ConceptLabel({ tekst = "Conceptbeeld", los = false }: { tekst?: string; los?: boolean }) {
  return (
    <span
      data-concept-label=""
      className={`${los ? "inline-flex" : "absolute top-3 left-3 z-[1]"} rounded-full bg-black/60 px-3 py-1 tekst-annotatie text-white uppercase`}
    >
      {tekst}
    </span>
  )
}
