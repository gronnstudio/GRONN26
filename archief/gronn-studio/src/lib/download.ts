// Bestanden aanbieden vanuit het paneel, met namen die overleven.
//
// DE AANLEIDING. De builder bood een document aan als
// `gronn-${kind}-${number}.json`. Dat werkte zolang een nummer `2026-0001`
// was. Sinds de nummering de reeks van de boekhouding volgt draagt het
// een schuine streep — `GR-F // 2026-0908-0010` — en een `/` mag op geen
// enkel besturingssysteem in een bestandsnaam. De download kwam er
// verminkt uit of helemaal niet.
//
// Dus twee dingen hier, en verder niets: een naam die niet kapot kan, en
// één plek die een tekst als bestand aanbiedt.

/**
 * Eén stuk van een bestandsnaam, veilig gemaakt.
 *
 * Alles wat geen letter, cijfer of streepje is wordt een liggend
 * streepje, en herhalingen vallen samen. Diakrieten worden ontleed en
 * weggelaten in plaats van vervangen: `Ø` wordt `O`, `é` wordt `e`. Dat
 * is bewust — een bestandsnaam met accenten overleeft de reis door
 * e-mail, zip en Windows niet altijd, en een klantnaam moet herkenbaar
 * blijven.
 */
export function safePart(value: string): string {
  return value
    .normalize("NFD")
    // Combinerende accenten weg. De Ø valt daar niet onder (die is één
    // teken, geen O plus streep), dus die krijgt zijn eigen regel.
    .replace(/[̀-ͯ]/g, "")
    .replace(/[øØ]/g, "O")
    // De ampersand valt onder de veegregel hieronder en verdwijnt dus
    // samen met de spaties eromheen: "Klant & Partner" wordt
    // "Klant_Partner". Dat is de vorm die de eigenaar zelf aanhoudt, en
    // "Klant_en_Partner" zou een woord toevoegen dat de klant niet heeft
    // geschreven.
    .replace(/[^A-Za-z0-9-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
}

/**
 * De naam van een bestand, uit losse stukken.
 *
 * `fileName(["GR", "F", "Klant & Partner"], "pdf")` geeft
 * `GR_F_Klant_en_Partner.pdf`. Lege stukken vallen weg, zodat een
 * ontbrekende klantnaam geen dubbele streep achterlaat.
 */
export function fileName(parts: (string | null | undefined)[], extension: string): string {
  const stem = parts
    .map((p) => (p ? safePart(p) : ""))
    .filter(Boolean)
    .join("_")
  return `${stem || "gronn"}.${extension}`
}

/**
 * Bied een tekst aan als bestand.
 *
 * De object-URL wordt weer vrijgegeven, maar pas in een volgende tick:
 * Safari breekt de download af wanneer de URL wordt ingetrokken in
 * dezelfde slag waarin op de link wordt geklikt. Dat is geen theorie —
 * het is de reden dat hier een `setTimeout` staat waar een directe
 * `revokeObjectURL` logischer oogt.
 */
export function downloadText(name: string, text: string, type = "application/json") {
  if (typeof window === "undefined") return
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }))
  const link = document.createElement("a")
  link.href = url
  link.download = name
  link.rel = "noopener"
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
