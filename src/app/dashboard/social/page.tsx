import type { Metadata } from "next"
import { Kop } from "@/components/crm/kop"
import { Bewaar } from "@/components/beheer/bewaar"
import { Kopieer } from "@/components/beheer/kopieer"
import { leesStand, opslagAan } from "@/lib/beheer/stand"
import { zetGepost } from "../acties"
import { POSTS, POSTTIJDEN, TEGELS, VASTGEZET, VOLGORDE, tegelVan, type Post } from "@/lib/beheer/social"

// De Instagram-feed vanuit het dashboard (eigenaar, 9 okt 2026). Bewust geen
// koppeling met Instagram zelf: posten via de API vraagt een Meta-zakelijk
// account en een app-keuring, en Nick wil elke post zelf plaatsen. Hier staan
// het raster, de beelden en de captions klaar om te downloaden en te kopiëren.
export const metadata: Metadata = { title: "Social" }

const lbl = "crm-label"
const beeld = (p: Post, i = 1) => `/social/${p.map}/${i}.jpg`

function Kaart({ p, id, kop, gepost }: { p: Post; id: string; kop: string; gepost?: string }) {
  return (
    <li id={id} className="scroll-mt-6 crm-paneel p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className={`${lbl} text-gedempt`}>{kop}</span>
        {p.map && opslagAan() ? (
          <form action={zetGepost.bind(null, p.map, !gepost)}>
            <button className={`knop-klein border ${gepost ? "border-accent text-let" : "border-inkt/30"}`}>
              {gepost ? `Gepost ${gepost} ✓` : "Gepost?"}
            </button>
          </form>
        ) : (
          (gepost ?? p.gepost) && <span className={`${lbl} text-let`}>Gepost {gepost ?? p.gepost}</span>
        )}
      </div>
      <h2 className="syne m-0 mt-2 text-[22px] leading-[1.15]">{p.titel}</h2>
      {p.map ? (
        <>
          <ul className="m-0 mt-4 flex list-none gap-2 overflow-x-auto p-0">
            {Array.from({ length: p.slides ?? 1 }, (_, i) => (
              <li key={i} className="relative shrink-0">
                <a href={beeld(p, i + 1)} target="_blank" rel="noopener" title="Openen">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={beeld(p, i + 1)} alt={`Slide ${i + 1}`} loading="lazy" className="h-[150px] w-[120px] rounded-[10px] object-cover" />
                </a>
                <Bewaar src={beeld(p, i + 1)} naam={`${p.map}-${i + 1}.jpg`} label={`Bewaar slide ${i + 1}`} />
              </li>
            ))}
          </ul>
          <p className="m-0 mt-1 text-[11px] text-gedempt">
            {p.reel ? "Dit is de cover. " : "Tik op een slide om hem te openen, of op ↓ om hem te bewaren."}
            {p.reel && (
              <a href={`/social/${p.map}/reel.mp4`} target="_blank" rel="noopener" className="font-semibold text-let opacity-100">
                Open de reel ↗
              </a>
            )}
          </p>
        </>
      ) : (
        <p className="m-0 mt-3 text-[13px] text-gedempt">Nog niet klaar. {p.nodig}</p>
      )}
      {p.muziek && <p className="m-0 mt-3 text-[13px]">🎵 Muziek: zoek in Instagram op “{p.muziek}”</p>}
      {p.caption && (
        <details className="mt-4">
          <summary className="cursor-pointer text-[13px] font-semibold">Caption</summary>
          <p className="m-0 mt-2 whitespace-pre-line text-[14px] leading-[1.55]">{p.caption}</p>
          <div className="mt-3">
            <Kopieer tekst={p.caption} />
          </div>
        </details>
      )}
    </li>
  )
}

export const dynamic = "force-dynamic"

export default async function Social() {
  const stand = await leesStand()
  // Op Instagram staat de nieuwste linksboven.
  const raster = POSTS.map((p, i) => ({ p, n: i + 1 })).reverse()
  return (
    <>
      <Kop pad={[{ naam: "Bedrijf" }, { naam: "Social" }]} titel={"Social"} />
      <main className="mx-auto grid max-w-[1440px] @min-[1000px]:grid-cols-[400px_minmax(0,1fr)] gap-10 px-8 py-6">
        <section>
          <h2 className="m-0 text-[15px] font-semibold">The KNIGHT move</h2>
          <p className="m-0 mt-3 text-[14px] leading-[1.55] text-gedempt">
            Vijf tegels, steeds in deze volgorde. Op drie kolommen staat dezelfde tegel dan een paardensprong verder, nooit
            naast of onder zichzelf. Elke vijfde post is een quote.
          </p>
          <p className="m-0 mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[13px] font-semibold">
            {VOLGORDE.map((t) => (
              <span key={t}>
                {TEGELS[t].emoji} {TEGELS[t].naam}
              </span>
            ))}
          </p>
          <div className="mt-6 grid grid-cols-3 gap-[3px]">
            {VASTGEZET.map((p, i) => (
              <a key={p.titel} href={`#vast-${i + 1}`} className="relative block aspect-[4/5] overflow-hidden bg-inkt">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={beeld(p)} alt={p.titel} className="size-full object-cover" />
                <span className="absolute left-1.5 top-1.5 text-[12px]" aria-hidden>📌</span>
              </a>
            ))}
            {raster.map(({ p, n }) => {
              const t = TEGELS[tegelVan(n)]
              return (
                <a
                  key={n}
                  href={`#post-${n}`}
                  className="relative block aspect-[4/5] overflow-hidden"
                  style={{ background: t.kleur }}
                  title={`${n} · ${t.naam} · ${p.titel}`}
                >
                  {p.map ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={beeld(p)} alt={p.titel} className="size-full object-cover" />
                  ) : (
                    <span className="flex size-full flex-col justify-end p-2 text-[11px] font-semibold leading-[1.2] text-op-accent">
                      {p.titel}
                    </span>
                  )}
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-[#202020] px-1.5 text-[11px] font-bold text-white">
                    {t.emoji} {n}
                  </span>
                </a>
              )
            })}
          </div>
          <p className="m-0 mt-2 text-[11px] text-gedempt">Nieuwste linksboven. Tik op een vak voor beelden en caption.</p>
          <p className={`${lbl} m-0 mt-8 text-gedempt`}>Wanneer posten</p>
          <ul className="m-0 mt-3 grid list-none grid-cols-3 gap-3 p-0">
            {POSTTIJDEN.map((t) => (
              <li key={t.dag} className="crm-paneel p-4">
                <span className={`${lbl}`}>{t.dag}</span>
                <b className="syne mt-1 block text-[22px] tabular-nums">{t.tijd}</b>
                <span className="mt-1 block text-[12px] leading-[1.4] text-gedempt">{t.waarom}</span>
              </li>
            ))}
          </ul>
          <p className="m-0 mt-2 text-[11px] text-gedempt">Gemiddelden. Kijk in Instagram Insights wanneer jouw volgers online zijn zodra je die data hebt.</p>
        </section>
        <section>
          <p className={`${lbl} m-0`}>Vastgezet · zet eerst 03 vast, dan 02, dan 01</p>
          <ul className="m-0 mt-3 grid list-none gap-3 p-0">
            {VASTGEZET.map((p, i) => (
              <Kaart key={p.titel} p={p} id={`vast-${i + 1}`} kop="📌 Vastgezet" gepost={p.map ? stand.gepost[p.map] : undefined} />
            ))}
          </ul>
          <p className={`${lbl} m-0 mt-10 text-gedempt`}>In volgorde van posten</p>
          <ul className="m-0 mt-3 grid list-none gap-3 p-0">
            {POSTS.map((p, i) => {
              const t = TEGELS[tegelVan(i + 1)]
              return <Kaart key={i} p={p} id={`post-${i + 1}`} kop={`${i + 1} · ${t.emoji} ${t.naam} · ${t.vorm}`} gepost={p.map ? stand.gepost[p.map] : undefined} />
            })}
          </ul>
        </section>
      </main>
    </>
  )
}
