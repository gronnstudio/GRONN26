import type { ElementType, ReactNode } from "react";
import { T, type Tekst } from "@/components/taal";

/** Een grote, lichte alinea (de intro van een pagina). Sinds 24 okt 2026
 *  gewoon tekst: de woorden lichten niet meer één voor één op. */
export function Oplichten({
  tekst,
  als: Als = "p",
  className = "",
  children,
}: {
  tekst: Tekst;
  als?: ElementType;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Als className={`w-onthul ${className}`}>
      <T t={tekst} />
      {children}
    </Als>
  );
}
