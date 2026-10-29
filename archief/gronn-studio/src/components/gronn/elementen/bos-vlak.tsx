import type { ReactNode } from "react"

/**
 * Het diepe merkvlak — bosgroen (standaard) of antraciet — voor wat
 * eruit moet springen: het uitgelichte project, de merkbelofte, contact.
 * Zet elementen erin met `toon="bos"`. Kaartradius 16px (brand guide).
 *
 * `overflow-clip`, niet `-hidden`: hidden maakt het vlak een scrollcontainer,
 * en dan meet elke view()-tijdlijn erin (FaseBalk, g-in) tegen dit vlak in
 * plaats van tegen het scherm — en blijft ze halverwege staan.
 */
export function BosVlak({
  as: Tag = "div",
  groot = false,
  kleur = "bos",
  className = "",
  children,
}: {
  as?: "div" | "section" | "article" | "header" | "aside"
  groot?: boolean
  kleur?: "bos" | "antraciet"
  className?: string
  children: ReactNode
}) {
  return (
    <Tag data-element="BosVlak" className={`${kleur === "bos" ? "vlak-bos" : "vlak-antraciet dark:ring-1 dark:ring-gronn-white/15"} overflow-clip rounded-[16px] ${groot ? "p-6 sm:p-12" : "p-6 sm:p-8"} ${className}`}>
      {children}
    </Tag>
  )
}
