import Link from "next/link"

import type { Dossier } from "@/lib/client-dossier"
import { SERVICES } from "@/lib/data/services"
import { card, cardPad, cardTitle, emptyState, label } from "@/app/dashboard/ui"
import { StatCard, StatusPill } from "@/app/dashboard/tiles"

// The client's dashboard.
//
// Deliberately short. Three tiles where the studio's overview has six,
// and every number on it is about this household — it is not the owner's
// dashboard with things hidden.
//
// That distinction is the reason this is a separate component rather
// than a `viewer === "client"` branch inside the owner's page. A blur or
// a `hidden` class over the studio's figures would put every client's
// name, every amount and every overdue invoice into the markup of a page
// a client can open, one devtools panel away from being read. The rule
// this project already paid for once: what a viewer may not see is not
// rendered, not styled out.
//
// Everything below came back through row-level security — see
// lib/client-dossier.ts — so a mistake here cannot widen what a client
// sees; the database refuses first.

function serviceName(slug: string): string {
  return SERVICES.find((s) => s.slug === slug)?.title.nl ?? slug
}

function date(value: string | null): string {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function ClientOverview({
  dossier,
  email,
}: {
  dossier: Dossier
  email: string | null
}) {
  const active = dossier.subscriptions.filter((s) => s.status === "active")
  const running = dossier.projects.filter((p) => !p.archived_at)
  const next = active
    .map((s) => s.renews_at)
    .filter((d): d is string => !!d)
    .sort()[0]

  return (
    <main className="w-full px-6 py-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h1 className="font-heading text-[clamp(1.6rem,3vw,2.1rem)] font-semibold tracking-tight">
          {dossier.client?.name ?? "Mijn dossier"}
        </h1>
        <p className={label}>{email}</p>
      </div>

      {/* Two failures, one sentence. `unavailable` is a read that broke;
          `unconfigured` is an environment without a database. From a
          client's chair they are the same event — their dossier did not
          come back — and only one of them was handled, so an
          unconfigured deployment showed a signed-in client a heading and
          an otherwise empty page. Naming the difference would tell them
          about our server configuration, which is not theirs to carry. */}
      {dossier.status !== "ok" && (
        <div className="mt-6 rounded-lg border border-gronn-ember bg-gronn-ember/5 p-5">
          <p className="font-heading text-[15px] font-semibold text-[color:var(--ember-text)]">
            We konden je dossier nu niet ophalen
          </p>
          {/* Never "je hebt niets" over a read that failed. That sentence
              tells a paying client the studio has no record of them. */}
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
            Dat betekent niet dat er niets is — alleen dat het nu niet gelezen
            kon worden. Ververs de pagina zo nog eens.
          </p>
        </div>
      )}

      {dossier.unlinked && (
        <div className={`mt-6 ${cardPad}`}>
          <p className={cardTitle}>Nog geen dossier aan dit adres gekoppeld</p>
          <p className="mt-2 max-w-[62ch] text-[13.5px] leading-relaxed text-muted">
            Je account werkt. Een dossier maakt de studio aan — dat gebeurt niet
            automatisch bij het registreren. Heb je je met een ander adres
            aangemeld, laat het weten via{" "}
            <a
              href="mailto:hello@gronn.studio"
              className="underline underline-offset-4 transition-colors hover:text-gronn-ember"
            >
              hello@gronn.studio
            </a>
            .
          </p>
        </div>
      )}

      {dossier.status === "ok" && !dossier.unlinked && (
        <>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Tuinen in behandeling"
              value={String(running.length)}
              note={
                dossier.projects.length > running.length
                  ? `${dossier.projects.length - running.length} afgerond`
                  : "Bij de studio bekend"
              }
              filled
            />
            <StatCard
              title="Lopende abonnementen"
              value={String(active.length)}
              note={next ? `Eerstvolgende verlenging ${date(next)}` : undefined}
            />
            <StatCard
              title="Een nieuwe aanvraag"
              value="Start"
              note="Vertel ons over een tuin of vijver"
              href="/dashboard/intakes/new"
            />
          </div>

          {dossier.projects.length > 0 && (
            <section className="mt-10">
              <h2 className={label}>Tuinen</h2>
              <ul className="mt-3 space-y-3">
                {dossier.projects.map((p) => (
                  <li key={p.id} className={`${card} p-4`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <p className="font-heading text-[15px] font-semibold">
                        {p.name}
                      </p>
                      <StatusPill tone={p.archived_at ? "quiet" : "ok"}>
                        {p.archived_at ? "Afgerond" : "Loopt"}
                      </StatusPill>
                    </div>
                    {p.address && (
                      <p className="mt-1 text-[13.5px] text-muted">{p.address}</p>
                    )}
                    <p className={`mt-2 ${label}`}>sinds {date(p.created_at)}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {dossier.subscriptions.length > 0 && (
            <section className="mt-10">
              <h2 className={label}>Abonnementen</h2>
              <ul className="mt-3 space-y-3">
                {dossier.subscriptions.map((s) => (
                  <li key={s.id} className={`${card} p-4`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <p className="font-heading text-[15px] font-semibold">
                        {serviceName(s.service_slug)}
                      </p>
                      <StatusPill
                        tone={
                          s.status === "active"
                            ? "ok"
                            : s.status === "paused"
                              ? "warn"
                              : "quiet"
                        }
                      >
                        {s.status === "active"
                          ? "Loopt"
                          : s.status === "paused"
                            ? "Gepauzeerd"
                            : "Beëindigd"}
                      </StatusPill>
                    </div>
                    <p className={`mt-2 ${label}`}>
                      sinds {date(s.started_at)}
                      {s.renews_at && s.status === "active"
                        ? ` · verlengt ${date(s.renews_at)}`
                        : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {dossier.projects.length === 0 &&
            dossier.subscriptions.length === 0 && (
              <p className={`mt-7 ${emptyState}`}>
                Je dossier is er, maar er staat nog geen tuin of abonnement in.{" "}
                <Link
                  href="/dashboard/intakes/new"
                  className="underline underline-offset-4 transition-colors hover:text-gronn-ember"
                >
                  Begin met een aanvraag
                </Link>
                .
              </p>
            )}
        </>
      )}
    </main>
  )
}
