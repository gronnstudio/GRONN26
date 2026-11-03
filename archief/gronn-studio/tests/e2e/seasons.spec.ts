import { test, expect } from "@playwright/test"

import { inSeasonNow, seasonBoard, seasonStatus } from "@/lib/data/seasons"

// The season clock, at fixed dates.
//
// This is the one piece of genuinely new logic in the owner dashboard,
// and it is the kind that rots silently: a window that is off by a day
// tells the studio to sell leaf nets in a week when the leaves are
// already down, and nothing crashes to say so.
//
// Every date here is written out rather than derived from `new Date()`,
// so a test written in August still means the same thing in December.
// That is also why `seasonStatus` takes `today` as an argument at all.

const at = (day: string) => new Date(`${day}T12:00:00Z`)

test.describe("the season clock", () => {
  test("leaf nets open on 1 September and are worthless after mid-November", () => {
    // The document is emphatic about the first week of September, so the
    // days-until figure is what the dashboard leans on three days out.
    expect(seasonStatus("leaf-net", at("2026-08-29"))).toEqual({
      status: "opening",
      opensInDays: 3,
    })
    expect(seasonStatus("leaf-net", at("2026-09-01"))).toEqual({
      status: "open",
      closesInDays: 75,
    })
    // The closing day is still a selling day: 0 days left, not closed.
    expect(seasonStatus("leaf-net", at("2026-11-15"))).toEqual({
      status: "open",
      closesInDays: 0,
    })
    expect(seasonStatus("leaf-net", at("2026-11-16")).status).toBe("closed")
  })

  test("the autumn pond service stops at the end of October, not with the leaf nets", () => {
    // "Plan najaarsbeurten in september en oktober, niet in november" —
    // under 10 °C the koi are in winter rest. The two autumn windows
    // deliberately do not end on the same day.
    expect(seasonStatus("pond-autumn-service", at("2026-10-31"))).toEqual({
      status: "open",
      closesInDays: 0,
    })
    expect(seasonStatus("pond-autumn-service", at("2026-11-01")).status).toBe(
      "closed"
    )
    expect(seasonStatus("leaf-net", at("2026-11-01")).status).toBe("open")
  })

  test("a window with no entry is year-round, not closed", () => {
    // Diagnosis travels all year, and a subscription has no season. The
    // difference matters: "closed" would push them off the board.
    expect(seasonStatus("pond-survey", at("2026-08-29"))).toEqual({
      status: "year-round",
    })
    expect(seasonStatus("maintenance-subscription", at("2026-01-05"))).toEqual({
      status: "year-round",
    })
  })

  // The winter design season runs December to February, so it is the one
  // window that crosses the turn of the year — the case a naive range
  // check gets wrong in exactly one direction.
  test("the winter design season survives new year", () => {
    expect(seasonStatus("garden-design", at("2026-12-01")).status).toBe("open")
    expect(seasonStatus("garden-design", at("2027-01-10"))).toEqual({
      status: "open",
      closesInDays: 49,
    })
    expect(seasonStatus("garden-design", at("2027-02-28"))).toEqual({
      status: "open",
      closesInDays: 0,
    })
    expect(seasonStatus("garden-design", at("2027-03-01")).status).toBe("closed")
  })

  test("the board leads with whatever shuts first", () => {
    // 20 November: winterising has ten days left and design opens in
    // eleven. What is closing outranks what is opening, because only one
    // of the two cannot wait.
    const board = seasonBoard(at("2026-11-20"))
    expect(board[0].service.slug).toBe("winterising")
    expect(board[0].season).toEqual({ status: "open", closesInDays: 10 })
    expect(board[1].service.slug).toBe("garden-design")

    // Year-round work sits at the back: always available is never news.
    const tail = board.slice(-2).map((e) => e.season.status)
    expect(tail).toEqual(["year-round", "year-round"])
  })

  test("the menu's in-season card points at the season that is actually next", () => {
    // The regression this replaces: a hand-written month map returned
    // the maintenance subscription through the whole of August, while
    // the leaf-net season was three days from opening.
    expect(inSeasonNow(at("2026-08-29"))?.slug).toBe("leaf-net")
    expect(inSeasonNow(at("2026-11-20"))?.slug).toBe("winterising")
    expect(inSeasonNow(at("2027-01-10"))?.slug).toBe("garden-design")
  })
})
