import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { CheckIcon } from "lucide-react"

import { PanelGate } from "@/app/dashboard/owner-gate"
import { WaterrouteSchema } from "@/components/gronn/elementen/waterroute-schema"
import { CITAAT, fotosVoor } from "@/lib/data/vijverrenovatie"
import {
  POND,
  POND_FINANCE,
  POND_MATERIALS,
  POND_NOTES,
  POND_TASKS,
  euroFull,
  pondPhotos,
} from "@/lib/os/data"
import { cn } from "@/lib/utils"
import { ProgressLine, Reading, Zone } from "../../ui"
import { osLocale } from "../../locale"
import { canOpenOs } from "../../access"
import { AiActions, PhotoWall, ZoneIndex } from "./project-control"

// /os/projects/[slug] — the project control view.
//
// A control room, not a CRM record: photography leads, the numbers that
// matter sit in one telemetry strip under it, and the rest of the project
// is a column of zones with an index that follows you down the page.
//
// Only the pond has a control view in phase 1, because only the pond has
// real data behind it. Everything here comes from vijverrenovatie.ts (the
// text and photos the public project page already uses, with the client's
// consent) or from Nick's own figures in the Command Center brief.

// A generic title on purpose: metadata is sent even when the layout
// answers with the sign-in gate, so it must never carry a client's name.
export const metadata: Metadata = { title: "Project" }

const ZONES = [
  { id: "overview", en: "Overview", nl: "Overzicht" },
  { id: "system", en: "System", nl: "Systeem" },
  { id: "timeline", en: "Timeline", nl: "Tijdlijn" },
  { id: "tasks", en: "Tasks", nl: "Taken" },
  { id: "photos", en: "Photos", nl: "Foto's" },
  { id: "materials", en: "Materials", nl: "Materialen" },
  { id: "finance", en: "Finance", nl: "Financiën" },
  { id: "client", en: "Client", nl: "Klant" },
  { id: "notes", en: "Notes", nl: "Notities" },
  { id: "ai", en: "Actions", nl: "Acties" },
]

export default async function ProjectControlPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!(await canOpenOs())) return <PanelGate />
  const { slug } = await params
  const { locale, t, s: say } = await osLocale()
  const zone = (id: string) => {
    const z = ZONES.find((x) => x.id === id)!
    return locale === "nl" ? z.nl : z.en
  }
  if (slug !== POND.slug) notFound()

  const photos = pondPhotos()
  const photoCount = photos.reduce((n, g) => n + g.photos.length, 0)
  const open = POND_TASKS.filter((t) => !t.done)
  const done = POND_TASKS.filter((t) => t.done)
  const hero = POND.hero!
  const perHour = POND_FINANCE.revenue / POND_FINANCE.hours

  return (
    <article className="pt-[24px]">
      {/* ── Hero: the photograph first ─────────────────────────────── */}
      <header className="relative overflow-hidden rounded-[16px] bg-os-raised">
        <div className="relative h-[min(62vh,640px)] min-h-[380px]">
          <Image src={hero.src} alt={hero.alt} fill priority sizes="100vw" className="object-cover" />
          <span aria-hidden className="photo-glass absolute inset-0" />
        </div>
        {/* A solid plate, not a gradient: the title needs a ground it can
            rely on whatever the photo does underneath. */}
        <div className="absolute bottom-[20px] left-[20px] max-w-[calc(100%-40px)] rounded-[14px] bg-os-ground/90 px-[24px] py-[20px]">
          <p className="os-label">{t("Project · Pond renovation", "Project · Vijverrenovatie")}</p>
          <h1 className="mt-[10px] font-heading text-[44px] leading-[44px] tracking-[0.01em] text-os-text xl:text-[64px] xl:leading-[64px]">
            {POND.name.toUpperCase()}
          </h1>
          <p className="mt-[8px] font-mono text-[13px] uppercase tracking-[0.18em] text-os-text-2">{say(POND.title)}</p>
        </div>
        <p className="absolute bottom-[20px] right-[20px] hidden rounded-full bg-os-ground/90 px-[12px] py-[5px] font-mono text-[11px] tracking-[0.08em] text-os-text-2 md:block">
          {t(`${photoCount} photos · 2 clips`, `${photoCount} foto's · 2 clips`)}
        </p>
      </header>

      {/* ── Telemetry ─────────────────────────────────────────────── */}
      <dl className="mt-[24px] grid grid-cols-2 gap-x-[32px] gap-y-[24px] rounded-[16px] border border-os-line px-[24px] py-[22px] md:grid-cols-5">
        <Reading label={t("Status", "Status")} value={say(POND.status)}>
          <span className="mt-[6px] flex items-center gap-[6px] text-[12px] text-os-green">
            <span aria-hidden className="size-[6px] rounded-full bg-os-green" /> {t("Healthy", "Gezond")}
          </span>
        </Reading>
        <Reading label={t("Progress", "Voortgang")} value={POND.progress} unit="%">
          <ProgressLine value={POND.progress} className="mt-[10px]" />
        </Reading>
        <Reading label={t("Project value", "Projectwaarde")} value={euroFull(POND.value)} />
        <Reading label={t("Hours", "Uren")} value={POND.hours} unit={t("h", "u")}>
          <span className="mt-[4px] block text-[12px] text-os-text-3">{t("about 15 working days", "ongeveer 15 werkdagen")}</span>
        </Reading>
        <div>
          <dt className="os-label">{t("System", "Systeem")}</dt>
          <dd className="mt-[8px] space-y-[2px]">
            {POND.system.map((s) => (
              <p key={s.what} className="text-[15px] leading-[20px] text-os-text">
                <span className="font-heading">{s.n}</span> <span className="text-os-text-2">{say(s.what)}</span>
              </p>
            ))}
          </dd>
        </div>
      </dl>

      {/* ── Zones ─────────────────────────────────────────────────── */}
      <div className="mt-[48px] grid gap-[40px] lg:grid-cols-[180px_minmax(0,1fr)] xl:gap-[64px]">
        <ZoneIndex zones={ZONES.map((z) => ({ id: z.id, label: locale === "nl" ? z.nl : z.en }))} />

        <div className="min-w-0 space-y-[72px]">
          <Zone id="overview" title={zone("overview")}>
            <ol className="grid grid-cols-4 gap-[6px]" aria-label={t("Phases", "Fasen")}>
              {POND.phases.map((f, i) => (
                <li key={f.label.en} aria-current={i === POND.phaseNow ? "step" : undefined}>
                  <span
                    className={cn(
                      "block h-[4px] rounded-full",
                      i < POND.phaseNow ? "bg-os-green-2" : i === POND.phaseNow ? "bg-os-green" : "bg-os-raised"
                    )}
                  />
                  <span className={cn("mt-[8px] block text-[13px]", i === POND.phaseNow ? "text-os-text" : "text-os-text-3")}>
                    {f.label[locale]}
                  </span>
                  {f.noot && <span className="block font-mono text-[11px] text-os-text-3">{f.noot[locale]}</span>}
                </li>
              ))}
            </ol>
            <div className="mt-[32px] grid gap-[40px] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div lang="nl" className="space-y-[14px] text-[15px] leading-[25px] text-os-text-2">
                {POND.intro.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
              <dl className="divide-y divide-os-line border-y border-os-line" lang="nl">
                {POND.facts.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-[16px] py-[8px]">
                    <dt className="text-[13px] text-os-text-3">{k}</dt>
                    <dd className="text-[13px] text-os-text">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Zone>

          <Zone id="system" title={t("Water system", "Watersysteem")} aside={<span className="font-mono text-[11px] text-os-text-3">{t("B → pump → filter → A + waterfall", "B → pomp → filter → A + waterval")}</span>}>
            <div className="os-system rounded-[16px] border border-os-line bg-os-surface p-[20px] xl:p-[32px]">
              <WaterrouteSchema id="os-waterroute" />
            </div>
          </Zone>

          <Zone id="timeline" title={zone("timeline")} aside={<span className="font-mono text-[11px] text-os-text-3">{t("by chapter · dates in phase 2", "per hoofdstuk · data in fase 2")}</span>}>
            <ol className="relative">
              <span aria-hidden className="absolute bottom-[8px] left-[5px] top-[8px] w-px bg-os-line" />
              {POND.chapters.map((c, i) => {
                const photo = c.foto ? fotosVoor(c.foto)[0] : undefined
                const last = i === POND.chapters.length - 1
                return (
                  <li key={c.id} className="relative grid gap-[16px] pb-[22px] pl-[32px] md:grid-cols-[minmax(0,1fr)_120px]">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-0 top-[5px] size-[11px] rounded-full border",
                        c.id === "afronding" ? "border-os-green bg-os-forest" : last ? "border-os-text-3 bg-os-ground" : "border-os-green-2 bg-os-ground"
                      )}
                    />
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-os-text-3">
                        {String(i + 1).padStart(2, "0")} · {c.kort}
                      </p>
                      <p lang="nl" className="mt-[4px] text-[15px] leading-[22px] text-os-text">
                        {c.kop}
                      </p>
                    </div>
                    {photo && (
                      <div className="relative hidden aspect-[4/3] overflow-hidden rounded-[10px] md:block">
                        <Image src={photo.src} alt="" fill sizes="120px" className="object-cover" />
                        {photo.label && (
                          <span className="absolute bottom-[4px] left-[4px] rounded-full bg-os-ground/90 px-[6px] font-mono text-[9px] uppercase tracking-[0.1em] text-os-text-2">
                            AI
                          </span>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
          </Zone>

          <Zone id="tasks" title={zone("tasks")} aside={<span className="font-mono text-[11px] text-os-text-3">{t(`${open.length} open · ${done.length} done`, `${open.length} open · ${done.length} klaar`)}</span>}>
            <div className="grid gap-[32px] xl:grid-cols-2">
              <div>
                <p className="os-label mb-[10px]">{t("Open", "Open")}</p>
                <ul className="divide-y divide-os-line border-y border-os-line">
                  {open.map((task) => (
                    <li key={task.what} className="flex items-start gap-[12px] py-[11px]">
                      <span aria-hidden className="mt-[2px] size-[16px] shrink-0 rounded-full border border-os-green-2" />
                      <span className="flex-1 text-[14px] leading-[20px] text-os-text">{say(task.what)}</span>
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-os-text-3">{task.source === "spring 2027" ? t("spring 2027", "voorjaar 2027") : task.source}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="os-label mb-[10px]">{t("Done", "Klaar")}</p>
                <ul className="divide-y divide-os-line border-y border-os-line">
                  {done.map((task) => (
                    <li key={task.what} className="flex items-start gap-[12px] py-[11px]">
                      <span aria-hidden className="mt-[2px] grid size-[16px] shrink-0 place-items-center rounded-full bg-os-forest text-os-green">
                        <CheckIcon size={11} />
                      </span>
                      <span className="flex-1 text-[14px] leading-[20px] text-os-text-2">{say(task.what)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="mt-[12px] text-[12px] text-os-text-3">
              {t(
                "Every task is a sentence from the project text. Ticking them off, owners and due dates arrive with phase 2.",
                "Elke taak is een zin uit de projecttekst. Afvinken, eigenaren en deadlines komen in fase 2."
              )}
            </p>
          </Zone>

          <Zone id="photos" title={zone("photos")} aside={<span className="font-mono text-[11px] text-os-text-3">{t(`${photoCount} photos · client consent for publication`, `${photoCount} foto's · met toestemming van de klant`)}</span>}>
            <PhotoWall groups={photos.map((g) => ({ ...g, title: say(g.title) }))} videos={Object.values(POND.videos)} />
          </Zone>

          <Zone id="materials" title={zone("materials")}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="border-b border-os-line">
                    <th scope="col" className="os-label pb-[10px] font-normal">{t("Item", "Onderdeel")}</th>
                    <th scope="col" className="os-label pb-[10px] font-normal">{t("Specification", "Specificatie")}</th>
                    <th scope="col" className="os-label pb-[10px] text-right font-normal">{t("Status", "Status")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-os-line">
                  {POND_MATERIALS.map((m) => (
                    <tr key={m.what}>
                      <th scope="row" className="py-[10px] pr-[16px] text-[14px] font-normal text-os-text">{say(m.what)}</th>
                      <td className="py-[10px] pr-[16px] text-[13px] text-os-text-2">{say(m.spec)}</td>
                      <td className="py-[10px] text-right">
                        <span
                          className={cn(
                            "rounded-full px-[9px] py-[2px] font-mono text-[10px] uppercase tracking-[0.1em]",
                            m.status === "Installed" && "bg-os-forest text-os-green",
                            m.status === "To order" && "border border-os-attention text-os-attention",
                            m.status === "Planned" && "border border-os-line text-os-text-3"
                          )}
                        >
                          {say(m.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-[24px]">
              <p className="os-label mb-[10px]">{t("Original planting plan", "Oorspronkelijk beplantingsplan")}</p>
              <ul className="grid gap-[12px] md:grid-cols-2" lang="nl">
                {POND.plants.rijen.map((r) => (
                  <li key={r.zone} className="rounded-[14px] border border-os-line p-[16px]">
                    <p className="flex items-baseline justify-between">
                      <span className="font-heading text-[15px] text-os-text">{r.zone}</span>
                      <span className="font-mono text-[11px] text-os-text-3">
                        {r.manden} manden · {r.planten} planten
                      </span>
                    </p>
                    <p className="mt-[6px] text-[13px] text-os-text-2">{r.soorten.join(", ")}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Zone>

          <Zone id="finance" title={zone("finance")}>
            <dl className="grid gap-[24px] rounded-[16px] border border-os-line bg-os-surface p-[20px] sm:grid-cols-3">
              <div>
                <dt className="os-label">{t("Project value", "Projectwaarde")}</dt>
                <dd className="mt-[8px] font-heading text-[24px] text-os-text">{euroFull(POND_FINANCE.revenue)}</dd>
              </div>
              <div>
                <dt className="os-label">{t("Hours", "Uren")}</dt>
                <dd className="mt-[8px] font-heading text-[24px] text-os-text">
                  {POND_FINANCE.hours}
                  <span className="ml-[4px] font-mono text-[12px] text-os-text-3">{t("h", "u")}</span>
                </dd>
              </div>
              <div>
                <dt className="os-label">{t("Revenue per hour", "Omzet per uur")}</dt>
                <dd className="mt-[8px] font-heading text-[24px] text-os-text">
                  {euroFull(perHour)}
                  <span className="ml-[4px] font-mono text-[12px] text-os-text-3">{t("/h", "/u")}</span>
                </dd>
              </div>
            </dl>
            <p className="mt-[12px] text-[13px] leading-[20px] text-os-text-3">
              {t(
                "Preparation and thinking included, before materials. Materials and margin appear here once the purchases are recorded; nothing is estimated.",
                "Voorbereiding en denkwerk inbegrepen, vóór materialen. Materialen en marge verschijnen hier zodra de inkopen zijn vastgelegd; er wordt niets geschat."
              )}
            </p>
          </Zone>

          <Zone id="client" title={zone("client")}>
            <div className="grid gap-[16px] md:grid-cols-2">
              <div className="rounded-[16px] border border-os-line p-[18px]">
                <p className="font-heading text-[18px] text-os-text">{POND.name}</p>
                <p className="mt-[4px] text-[13px] text-os-text-2">{t("Private client · consent to publish the project photos", "Particuliere klant · toestemming om de projectfoto's te publiceren")}</p>
                <p className="mt-[14px] text-[13px] leading-[20px] text-os-text-3">
                  {t(
                    "Address, contact and agreements come from the client dossier in phase 2. The public project page names no client and no amounts, and never will.",
                    "Adres, contact en afspraken komen in fase 2 uit het klantdossier. De publieke projectpagina noemt geen klant en geen bedragen, en zal dat nooit doen."
                  )}
                </p>
              </div>
              <div className="rounded-[16px] border border-os-line p-[18px]">
                <p className="os-label">{t("Shared in the client portal", "Gedeeld in het klantportaal")}</p>
                <p className="mt-[10px] text-[14px] text-os-text">{t("Nothing yet", "Nog niets")}</p>
                <p className="mt-[6px] text-[13px] leading-[20px] text-os-text-3">
                  {t(
                    "Clients see only what is explicitly shared with them at /clients, enforced by the database, never by hiding it here.",
                    "Klanten zien alleen wat op /clients uitdrukkelijk met hen gedeeld is, afgedwongen door de database, nooit door het hier te verbergen."
                  )}
                </p>
              </div>
            </div>
          </Zone>

          <Zone id="notes" title={zone("notes")}>
            <ul className="space-y-[12px]">
              {POND_NOTES.map((n) => (
                <li key={n} className="flex gap-[12px] text-[14px] leading-[22px] text-os-text-2">
                  <span aria-hidden className="mt-[9px] h-px w-[12px] shrink-0 bg-os-text-3" />
                  {say(n)}
                </li>
              ))}
            </ul>
            <blockquote lang="nl" className="mt-[24px] border-l-2 border-os-green-2 pl-[18px]">
              <p className="text-[15px] italic leading-[24px] text-os-text">“{CITAAT.tekst}”</p>
              <footer className="mt-[8px] font-mono text-[11px] text-os-text-3">{CITAAT.bron}</footer>
            </blockquote>
          </Zone>

          <Zone id="ai" title={zone("ai")}>
            <AiActions />
          </Zone>
        </div>
      </div>
    </article>
  )
}
