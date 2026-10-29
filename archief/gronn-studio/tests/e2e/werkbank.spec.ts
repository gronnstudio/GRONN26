import { readFileSync } from "node:fs"
import { join } from "node:path"

import { expect, test } from "@playwright/test"

import {
  actions,
  daysBetween,
  euroFromCents,
  goalPct,
  pipeline,
  signals,
  trackIndex,
  urgency,
  weightedCents,
  type WerkbankProject,
  type WerkbankSubscription,
} from "@/lib/werkbank"

// The Werkbank's reasoning, tested the only way CI can test anything
// that touches this data: as pure functions.
//
// There is no Supabase project in CI and no signed-in user, so a test
// that drives the real panel can only ever check the shape of the
// signed-out page. That is why `werkbank.ts` imports nothing — every
// decision worth getting right was moved into it precisely so it could
// be driven with two dozen inputs the way `projectUrl` is.

const ROOT = process.cwd()
const read = (p: string) => readFileSync(join(ROOT, p), "utf8")
// Comments are stripped before any NEGATIVE assertion. A previous spec
// in this repo failed on a comment that described its own rule; the
// helper exists so that cannot happen again.
const code = (p: string) =>
  read(p).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")

const TODAY = "2026-09-04"

function project(over: Partial<WerkbankProject> = {}): WerkbankProject {
  return {
    id: "p1",
    name: "Tuin",
    clientName: "Fam. Verhoeven",
    phase: "uitvoering",
    chance: 100,
    valueCents: 1_450_000,
    nextAction: null,
    nextActionOn: null,
    steps: [],
    terms: [],
    asks: [],
    ...over,
  }
}

/* ─────────────────────────────────────────────────────────── dates */

test.describe("days are whole days, in one frame", () => {
  test("counts forwards and backwards", () => {
    expect(daysBetween("2026-09-04", "2026-09-04")).toBe(0)
    expect(daysBetween("2026-09-04", "2026-09-05")).toBe(1)
    expect(daysBetween("2026-09-05", "2026-09-04")).toBe(-1)
    expect(daysBetween("2026-09-04", "2026-10-04")).toBe(30)
  })

  test("crosses a month, a year and a leap day without drifting", () => {
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1)
    // 2028 is a leap year: February has 29 days.
    expect(daysBetween("2028-02-28", "2028-03-01")).toBe(2)
    expect(daysBetween("2027-02-28", "2027-03-01")).toBe(1)
  })

  test("a date that is not a date is null, not zero", () => {
    // Null and zero are different answers and the difference is the
    // whole point: zero would render as "vandaag" on a record that has
    // no date at all.
    expect(daysBetween("", "2026-09-04")).toBeNull()
    expect(daysBetween("2026-09-04", "morgen")).toBeNull()
    expect(daysBetween("04-09-2026", "2026-09-04")).toBeNull()
  })

  test("a timestamp is read by its date half", () => {
    expect(daysBetween("2026-09-04T23:30:00Z", "2026-09-05T01:00:00Z")).toBe(1)
  })
})

test.describe("urgency says what a date means today", () => {
  test("late, today, tomorrow, soon, later", () => {
    expect(urgency(TODAY, "2026-09-01")).toMatchObject({ label: "3d te laat", tone: "late" })
    expect(urgency(TODAY, "2026-09-04")).toMatchObject({ label: "vandaag", tone: "today" })
    expect(urgency(TODAY, "2026-09-05")).toMatchObject({ label: "morgen", tone: "soon" })
    expect(urgency(TODAY, "2026-09-07")).toMatchObject({ label: "over 3d", tone: "soon" })
    expect(urgency(TODAY, "2026-09-20")).toMatchObject({ label: "over 16d", tone: "later" })
  })

  test("no date is its own tone, not a quiet zero", () => {
    expect(urgency(TODAY, null)).toMatchObject({ label: "—", tone: "none", days: null })
  })
})

/* ──────────────────────────────────────────────────────────── money */

test.describe("money", () => {
  test("cents render as whole euros in Dutch", () => {
    expect(euroFromCents(1_450_000)).toBe("€ 14.500")
    expect(euroFromCents(0)).toBe("€ 0")
    expect(euroFromCents(null)).toBe("€ 0")
    // Half a cent up, so a rounding never loses a euro downward.
    expect(euroFromCents(99_950)).toBe("€ 1.000")
  })

  test("the pipeline weighs chance against value", () => {
    const list = [
      project({ phase: "offerte", valueCents: 720_000, chance: 60 }),
      project({ id: "p2", phase: "intake", valueCents: 900_000, chance: 40 }),
    ]
    // 7200 × 0.6 + 9000 × 0.4 = 4320 + 3600 = 7920 euro
    expect(weightedCents(list)).toBe(792_000)
  })

  test("work already won is not pipeline", () => {
    // The single most misleading number this could produce: one
    // delivered garden making an empty funnel look full.
    const list = [project({ phase: "uitvoering", valueCents: 1_450_000, chance: 100 })]
    expect(weightedCents(list)).toBe(0)
  })

  test("an unjudged deal is worth nothing, not skipped", () => {
    const list = [project({ phase: "intake", valueCents: 900_000, chance: null })]
    expect(weightedCents(list)).toBe(0)
  })

  test("the pipeline has four columns, in order, with sums", () => {
    const cols = pipeline([
      project({ phase: "aanvraag", valueCents: 500_000 }),
      project({ id: "p2", phase: "aanvraag", valueCents: 100_000 }),
      project({ id: "p3", phase: "akkoord", valueCents: 200_000 }),
    ])
    expect(cols.map((c) => c.phase)).toEqual(["aanvraag", "intake", "offerte", "akkoord"])
    expect(cols[0].totalCents).toBe(600_000)
    expect(cols[1].projects).toEqual([])
    expect(cols[3].totalCents).toBe(200_000)
  })

  test("no goal means no percentage — that is the designed answer", () => {
    // The owner was asked what his monthly target was and said "geen
    // idee". Inventing one would put a number he never chose on his own
    // screen every morning, failing.
    expect(goalPct(500_000, null)).toBeNull()
    expect(goalPct(500_000, 0)).toBeNull()
    expect(goalPct(450_000, 900_000)).toBe(50)
  })
})

/* ────────────────────────────────────────────────────────── actions */

test.describe("one list of what to do", () => {
  test("merges next actions, running steps, late invoices and visits", () => {
    const list = actions({
      today: TODAY,
      projects: [
        project({
          nextAction: "Vijverfolie leggen",
          nextActionOn: "2026-09-06",
          steps: [
            { label: "Grondwerk", dueOn: "2026-08-26", status: "klaar" },
            { label: "Folie en beschoeiing", dueOn: "2026-09-06", status: "bezig" },
            { label: "Beplanting", dueOn: "2026-09-20", status: "open" },
          ],
          terms: [
            { label: "Start 40%", amountCents: 580_000, status: "gefactureerd", dueOn: "2026-08-01" },
            { label: "Slot 30%", amountCents: 435_000, status: "open", dueOn: "2026-10-02" },
          ],
        }),
      ],
      subscriptions: [
        {
          id: "s1",
          label: "Fam. Coenen",
          projectId: "p9",
          status: "active",
          lastVisitOn: "2026-04-07",
          nextVisitOn: "2026-09-01",
        },
      ],
    })

    // A finished step and a not-yet-invoiced instalment are not actions.
    expect(list.map((a) => a.source).sort()).toEqual(["next", "step", "term", "visit"])
    // Sorted by date: the invoice from 1 August comes before the visit
    // due 1 September, which comes before the two on the 6th.
    expect(list[0].on).toBe("2026-08-01")
    expect(list[1].on).toBe("2026-09-01")
  })

  test("an undated action sorts last, because unplanned is not urgent", () => {
    const list = actions({
      today: TODAY,
      projects: [
        project({ id: "a", nextAction: "Ooit bellen", nextActionOn: null }),
        project({ id: "b", nextAction: "Morgen bellen", nextActionOn: "2026-09-05" }),
      ],
      subscriptions: [],
    })
    expect(list.map((a) => a.projectId)).toEqual(["b", "a"])
  })

  test("a paused subscription raises nothing", () => {
    const subs: WerkbankSubscription[] = [
      {
        id: "s1",
        label: "Op pauze",
        projectId: null,
        status: "paused",
        lastVisitOn: null,
        nextVisitOn: "2026-01-01",
      },
    ]
    expect(actions({ today: TODAY, projects: [], subscriptions: subs })).toEqual([])
  })
})

/* ────────────────────────────────────────────────────────── signals */

test.describe("signals carry a reason, not just a count", () => {
  test("money that is thirty days late outranks everything", () => {
    const list = signals({
      today: TODAY,
      projects: [
        project({
          id: "late",
          nextAction: "iets",
          terms: [
            { label: "Start 40%", amountCents: 580_000, status: "gefactureerd", dueOn: "2026-07-01" },
          ],
        }),
        project({ id: "quiet", phase: "intake", nextAction: null }),
      ],
      subscriptions: [],
    })
    expect(list[0].level).toBe("bad")
    expect(list[0].what).toContain("€ 5.800")
    expect(list[0].why).toContain("over de vervaldatum")
  })

  test("an invoice inside thirty days is not yet a signal", () => {
    const list = signals({
      today: TODAY,
      projects: [
        project({
          nextAction: "iets",
          terms: [
            { label: "Start", amountCents: 100_000, status: "gefactureerd", dueOn: "2026-08-20" },
          ],
        }),
      ],
      subscriptions: [],
    })
    expect(list.filter((s) => s.level === "bad")).toEqual([])
  })

  test("every signal says what to do about it", () => {
    const list = signals({
      today: TODAY,
      projects: [
        project({ id: "a", phase: "offerte", nextAction: "wacht", nextActionOn: "2026-08-10" }),
        project({ id: "b", phase: "intake", nextAction: null }),
        project({ id: "c", phase: "opgeleverd", nextAction: "iets" }),
      ],
      subscriptions: [],
    })
    expect(list.length).toBeGreaterThan(0)
    for (const s of list) expect(s.why.trim().length).toBeGreaterThan(0)
    expect(list.find((s) => s.projectId === "a")?.why).toContain("Bellen")
    expect(list.find((s) => s.projectId === "c")?.why).toContain("onderhoud")
  })

  test("a delivered or maintained project is not nagged for a next step", () => {
    const list = signals({
      today: TODAY,
      projects: [project({ phase: "onderhoud", nextAction: null })],
      subscriptions: [],
    })
    expect(list.filter((s) => s.what.includes("geen volgende stap"))).toEqual([])
  })

  test("an overdue maintenance visit says when the last one was", () => {
    const list = signals({
      today: TODAY,
      projects: [],
      subscriptions: [
        {
          id: "s1",
          label: "Fam. Coenen",
          projectId: "p9",
          status: "active",
          lastVisitOn: "2026-04-07",
          nextVisitOn: "2026-09-01",
        },
      ],
    })
    expect(list[0].what).toContain("3 dagen over tijd")
    expect(list[0].why).toContain("2026-04-07")
  })
})

/* ────────────────────────────────────────────── the client's track */

test.describe("the client's track", () => {
  test("seven phases collapse to six steps, deliberately", () => {
    expect(trackIndex("aanvraag")).toBe(trackIndex("intake"))
    expect(trackIndex("offerte")).toBe(trackIndex("akkoord"))
    expect(trackIndex("uitvoering")).toBe(3)
    expect(trackIndex("onderhoud")).toBe(5)
  })

  test("it never runs off the end of the track", () => {
    const phases = [
      "aanvraag", "intake", "offerte", "akkoord", "uitvoering", "opgeleverd", "onderhoud",
    ] as const
    for (const p of phases) {
      expect(trackIndex(p)).toBeGreaterThanOrEqual(0)
      expect(trackIndex(p)).toBeLessThan(6)
    }
  })
})

/* ─────────────────────────────────────────── the invariants that bite */

test.describe("which connection each half holds", () => {
  test("the reasoning imports nothing that can fetch", () => {
    // The whole reason the tests above can exist. An import of the
    // database here would make every one of them untestable in CI.
    const source = code("src/lib/werkbank.ts")
    for (const forbidden of ["supabase", "server-only", "next/", "react", "client-auth"]) {
      expect(source.includes(forbidden), forbidden).toBe(false)
    }
  })

  test("the owner's writer is server-only and holds the service role", () => {
    expect(read("src/lib/project-admin.ts")).toContain('import "server-only"')
    const source = code("src/lib/project-admin.ts")
    expect(source).toContain("serviceClient")
    // The visitor's connection must never appear here: it would silently
    // return zero rows under RLS and read as an empty project.
    expect(source.includes("clientAuthServer")).toBe(false)
  })

  test("every new route asks whether it is Nick, not whether somebody is signed in", () => {
    for (const path of [
      "src/app/api/admin/projects/route.ts",
      "src/app/api/admin/projects/[id]/route.ts",
    ]) {
      const source = code(path)
      expect(source, path).toContain("getOwnerSession")
      expect(source.includes("getClientUser"), path).toBe(false)
    }
  })

  test('"no database" answers 503 and never an empty success', () => {
    // The failure this guards is the one `readArchive` was split apart
    // to end: an outage that renders as "you have no projects". A
    // containment check alone would pass on an early return that still
    // said ok, so this asserts what the guard RETURNS.
    const source = read("src/app/api/admin/projects/route.ts")
    const guard = source.indexOf("projects === null")
    expect(guard).toBeGreaterThan(-1)
    // To the END OF THE IF-BLOCK, not a fixed number of characters. The
    // first version of this test took 260 chars and ran straight past
    // the closing brace into the success return below, so it failed on
    // code that was correct — which is its own small lesson about
    // asserting against a slice you did not actually bound.
    const block = source.slice(guard, source.indexOf("\n  }", guard))
    expect(block).toContain("503")
    expect(block.includes("ok: true")).toBe(false)
  })
})

test.describe("the migration can be run twice", () => {
  const sql = read("supabase/migrations/0002_werkbank.sql")
  // SQL comments stripped, for the same reason `code()` exists for
  // TypeScript: the first run of the float check below failed on the
  // migration's own comment explaining why money is NOT a float.
  const ddl = sql.replace(/^\s*--.*$/gm, "")

  test("every type and policy is guarded", () => {
    // Postgres has no `create type ... if not exists`, and a migration
    // runs as one transaction — so one unguarded statement rolls back
    // everything after it and leaves half a schema behind an error about
    // something that already existed.
    const types = ddl.match(/^\s*create type /gm) ?? []
    const policies = ddl.match(/^\s*create policy /gm) ?? []
    const guards = ddl.match(/when duplicate_object then null/g) ?? []
    expect(types.length + policies.length).toBeGreaterThan(0)
    expect(guards.length).toBeGreaterThanOrEqual(types.length + policies.length)
  })

  test("every table and column addition is conditional", () => {
    for (const line of ddl.split("\n")) {
      if (/^\s*create table /.test(line)) expect(line).toContain("if not exists")
      if (/^\s*create index /.test(line)) expect(line).toContain("if not exists")
      if (/add column /.test(line)) expect(line).toContain("if not exists")
    }
  })

  test("it grants no write to anyone but the service role", () => {
    // The anon key must never be able to set a phase or a price. There
    // is no insert, update or delete policy in `0001` either; this keeps
    // that true as the schema grows.
    expect(ddl).toContain("for select")
    expect(/for\s+(insert|update|delete|all)\b/.test(ddl)).toBe(false)
  })

  test("money is integer cents, never a float", () => {
    // A quote of € 14.500 coming back out of a sum as 14499.999999 is a
    // bug the studio would find by reading it to a client down the phone.
    expect(ddl).toContain("amount_cents bigint")
    expect(ddl).toContain("value_cents bigint")
    expect(/\b(real|double precision|float)\b/.test(ddl)).toBe(false)
  })
})
