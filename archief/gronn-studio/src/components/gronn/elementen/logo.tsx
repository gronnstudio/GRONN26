import Image from "next/image"

/**
 * Het woordmerk: antraciet in één vlakke kleur op Gouden Uur (brand guide
 * p. 3); op Blauwe Uur en op een donker merkvlak (`op="bos"`) het primaire
 * logo, wit met de oranje P van Peters in de R (eigenaar, 28 sep 2026:
 * "Sowieso op darkmode past deze goed").
 * De vectoren komen uit de merkmap van de eigenaar; niet opnieuw
 * tekenen. Van de twee varianten draagt alleen de zichtbare de alt-tekst.
 */
export function Logo({
  hoogte = 30,
  op = "grond",
  alt = "",
  priority = false,
}: {
  /** px, of een px-clamp voor een woordmerk dat met het scherm meegroeit. */
  hoogte?: number | string
  op?: "grond" | "bos"
  alt?: string
  priority?: boolean
}) {
  const maat = { width: 784, height: 167, priority, style: { height: hoogte, width: "auto" } }
  if (op === "bos") return <Image src="/brand/woordmerk-primair.svg" alt={alt} {...maat} />
  return (
    <>
      <Image src="/brand/woordmerk-antraciet.svg" alt={alt} {...maat} className="dark:hidden" />
      <Image src="/brand/woordmerk-primair.svg" alt={alt} {...maat} className="hidden dark:block" />
    </>
  )
}
