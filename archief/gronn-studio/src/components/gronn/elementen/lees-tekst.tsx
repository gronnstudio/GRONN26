import type { CSSProperties, HTMLAttributes } from "react"

/**
 * Een alinea die oplicht terwijl je leest (eigenaar, 28 sep 2026: "licht
 * tekst op na scrollen zodat het lijkt alsof je leest"). Woord voor woord
 * van gedimd naar vol, op het moment dat het woord de leeslijn passeert.
 * Pure CSS (`g-lees` in globals.css), dus een server-element zonder JS.
 *
 * Twee lagen in één `<p>`:
 *
 * - `g-lees-bron`: de echte tekst, precies zoals aangeleverd. Die draagt
 *   de opmaak, wordt voorgelezen, gekopieerd en gevonden met Zoeken.
 *   `textContent` van de alinea is dus de oorspronkelijke zin.
 * - `g-lees-woorden`: `aria-hidden`, over de bron heen, één lege span per
 *   woord met het woord in `data-w`. De letters komen uit `::before`
 *   (`content: attr(data-w)`): gegenereerde inhoud staat niet in
 *   `textContent` en gaat niet mee bij kopiëren. Zelfde tekst, zelfde
 *   breedte, zelfde lettertype: dezelfde regelval.
 *
 * Alleen onder de poort van g-in (geen minder beweging — systeem of
 * `data-motion="reduced"` — en ondersteuning voor view()) wordt de bron
 * doorzichtig en verschijnt de woordlaag. In elk ander geval (Firefox
 * zonder vlag, minder beweging, afdrukken) staat er één gewone alinea in
 * de volle kleur: de woordlaag is dan `display: none`.
 *
 * Gedimd is de eigen tekstkleur op 24 % (`color-mix` met transparent),
 * zodat het op de grond én op een donker merkvlak werkt; vol is de eigen
 * tekstkleur. De dimming is een overgang, nooit een eindstand: elk woord
 * is vol zodra de alinea ruim boven het midden van het scherm staat.
 *
 * Alleen voor lopende tekst van één tot drie zinnen. Niet in knoppen,
 * formulieren, prijzen, juridische tekst of een `Kop`.
 */
export function LeesTekst({
  children,
  className = "",
  style,
  ...rest
}: { children: string; className?: string } & Omit<HTMLAttributes<HTMLParagraphElement>, "children">) {
  // Alleen gewone spaties: een harde spatie blijft binnen zijn woord.
  const woorden = children.split(/ +/).filter(Boolean)
  const laatste = woorden.length - 1
  return (
    <p
      data-element="LeesTekst"
      {...rest}
      className={`g-lees ${className}`}
      style={{ ...style, "--n": woorden.length } as CSSProperties}
    >
      <span className="g-lees-bron">{children}</span>
      <span className="g-lees-woorden" aria-hidden="true">
        {woorden.map((w, i) => (
          <span key={i} className="g-lees-w" data-w={i < laatste ? `${w} ` : w} style={{ "--i": i } as CSSProperties} />
        ))}
      </span>
    </p>
  )
}
