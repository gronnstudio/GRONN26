/** Lopende tekst: alinea's op leesbare breedte (65 tekens). */
export function Alineas({ teksten, groot = false, className = "" }: { teksten: string[]; groot?: boolean; className?: string }) {
  return (
    <div data-element="Alineas" className={`grid max-w-[65ch] gap-5 leading-relaxed ${groot ? "text-lg sm:text-xl" : "text-base sm:text-[1.0625rem]"} ${className}`}>
      {teksten.map((p) => (
        <p key={p.slice(0, 40)}>{p}</p>
      ))}
    </div>
  )
}
