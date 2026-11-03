import type { ReactNode } from "react"

/**
 * De vaste paginabreedte met zijmarge. Eén plek, zodat alles uitlijnt.
 * Brand guide p. 8: maximale inhoudsbreedte 1280px, zijmarge 24px op
 * mobiel en 64px op desktop.
 */
export const BREEDTE = "mx-auto w-full max-w-[calc(1280px+128px)] px-[24px] lg:px-[64px]"

export function Breedte({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: "div" | "section" | "article" | "header" | "aside"
  className?: string
  children: ReactNode
}) {
  return <Tag className={`${BREEDTE} ${className}`}>{children}</Tag>
}
