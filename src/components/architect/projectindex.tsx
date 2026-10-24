import Link from "next/link"
import { Foto } from "@/components/foto"
import { T } from "@/components/taal"
import { WERK } from "@/components/werk/projecten"

// De projectindex zoals bij architectenbureaus (24 okt 2026): eerst de
// beelden in een rustig raster met een klein onderschrift, daarna dezelfde
// projecten als tabel (nummer, project, plaats, type, jaar).
export function Projectbeelden() {
  return (
    <ul className="m-0 grid list-none gap-x-[clamp(16px,2vw,32px)] gap-y-12 p-0 md:grid-cols-2">
      {WERK.map((p) => (
        <li key={p.href}>
          <Link href={p.href} className="group block text-inherit no-underline">
            <Foto foto={p.foto} sizes="(min-width: 768px) 50vw, 100vw" className="aspect-[4/3] transition-opacity group-hover:opacity-90" />
            <p className="mt-3 mb-0 flex justify-between gap-4 text-[14px]">
              <span><T t={p.naam} /></span>
              <span className="shrink-0 whitespace-nowrap text-muted-foreground tabular-nums">{p.code}</span>
            </p>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function Projecttabel() {
  return (
    <table className="w-full border-collapse text-left text-[14px]">
      <thead>
        <tr className="border-b border-border text-muted-foreground">
          <th scope="col" className="py-3 pr-4 font-normal">Nr.</th>
          <th scope="col" className="py-3 pr-4 font-normal"><T t={{ nl: "Project", en: "Project" }} /></th>
          <th scope="col" className="hidden py-3 pr-4 font-normal md:table-cell"><T t={{ nl: "Plaats", en: "Place" }} /></th>
          <th scope="col" className="hidden py-3 pr-4 font-normal md:table-cell">Type</th>
          <th scope="col" className="py-3 text-right font-normal"><T t={{ nl: "Jaar", en: "Year" }} /></th>
        </tr>
      </thead>
      <tbody>
        {WERK.map((p) => (
          <tr key={p.href} className="border-b border-border transition-colors hover:bg-muted">
            <td className="py-4 pr-4 text-muted-foreground tabular-nums">{p.code.replace("GR / ", "")}</td>
            <td className="py-4 pr-4">
              <Link href={p.href} className="flex min-h-[var(--raak)] items-center no-underline hover:underline hover:underline-offset-4">
                <T t={p.titel} />
              </Link>
            </td>
            <td className="hidden py-4 pr-4 text-muted-foreground md:table-cell">{p.plaats}</td>
            <td className="hidden py-4 pr-4 text-muted-foreground md:table-cell"><T t={p.type} /></td>
            <td className="py-4 text-right text-muted-foreground tabular-nums">{p.jaar}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
