import { expect, test } from "@playwright/test"
import { faseInvoer, faseTekst, opmaakTekst, werkomschrijving } from "../src/lib/crm/werkomschrijving"
import { deel, leesCenten, leesMilli, plusProcent, zonderProcent, toonDecimaal, toonEuro, verdeel } from "../src/lib/crm/geld"
import { calculatieTitel, dubbelen, ontdubbeld, margeUitOpslag, nieuweRegel, opslagUitMarge, reken, schoonRegel, tekort, wegzetten } from "../src/lib/crm/calculatie"
import * as h from "../src/lib/crm/rekenhulpen"
import { zetPrijs, nieuwItem, voorClaude, zoekItems } from "../src/lib/crm/catalogus"
import { importeer, leesCsv } from "../src/lib/crm/catalogus-import"
import { opdracht, schoonBevindingen, zonderContact } from "../src/lib/crm/ai/beeld"
import { meetstaat, naarRegel as naarMeetRegel } from "../src/lib/crm/meetstaat"
import { nacalculatie, nieuwProject, normaliseerProject, splitsProject } from "../src/lib/crm/project"
import { metWerkvolgorde, schoonPlan, startDagen, totaalDagen, werkplan } from "../src/lib/crm/planning"
import { mailVoor, mailtoLink, voornaamVan } from "../src/lib/crm/mail"
import { btwPerTarief, epcCode, factuurTotaal, termijnRegels, volgendFactuurNummer } from "../src/lib/crm/factuur-reken"
import { MAX_HANDTEKENING, schoneHandtekening, volgendWerkbonNummer } from "../src/lib/crm/werkbon"
import { metBtw, naInkoop, schoonInkoop, teBetalen } from "../src/lib/crm/inkoop"
import { betaalstand, geplandeUren, normaliseer, zoekDubbel } from "../src/lib/crm/klant"
import { documentRijen, filterRijen, naarCsv, somEuro } from "../src/lib/crm/documenten"
import { planbord } from "../src/lib/crm/planbord"
import { STANDAARD, alleVragen, openPunten, oppervlakUit, schoonAntwoord, schoonLijst, telling, vragenVoor, zoneOppervlak } from "../src/lib/crm/vragenlijst"

// De rekenkern van het CRM zonder browser: geld in centen, afronden, btw per
// tarief, marge tegenover opslag en de rekenhulpen. Draait in dezelfde
// Playwright-run als de rest (geen extra testpakket).

test.describe("geld", () => {
  test("afronden is half weg van nul", () => {
    expect(deel(5, 2)).toBe(3)
    expect(deel(-5, 2)).toBe(-3)
    expect(deel(4, 3)).toBe(1)
    expect(deel(1005 * 2100, 10000)).toBe(211) // 21 % van € 10,05 = 2,1105 → 2,11
  })
  test("invoer lezen zonder kommagetallen", () => {
    expect(leesCenten("1.234,56")).toBe(123456)
    expect(leesCenten("1234.56")).toBe(123456)
    expect(leesCenten("€ 7")).toBe(700)
    expect(leesCenten("1.234")).toBe(123400)
    expect(leesCenten("0,105")).toBe(11)
    expect(leesCenten("abc")).toBeNull()
    expect(leesCenten("")).toBeNull()
    expect(leesMilli("58,85")).toBe(58850)
    expect(zonderProcent(4840, 2100)).toBe(4000)
    expect(zonderProcent(plusProcent(1999, 900), 900)).toBe(1999)
  })
  test("tonen", () => {
    expect(toonEuro(123456)).toBe("€ 1.234,56")
    expect(toonEuro(-50)).toBe("€ -0,50")
    expect(toonDecimaal(58850, 3)).toBe("58,85")
  })
  test("verdelen telt exact op", () => {
    const delen = verdeel(100, [1, 1, 1])
    expect(delen.reduce((a, b) => a + b, 0)).toBe(100)
    expect(verdeel(0, [0, 0])).toEqual([0, 0])
  })
})

test.describe("rekenhulpen", () => {
  test("55 m² bestrating met 7 % snijverlies is 58,85 m²", () => {
    expect(h.bestrating(55000, 700).hoeveelheid).toBe(58850)
    expect(plusProcent(55000, 700)).toBe(58850)
  })
  test("afgraven, grond, grind, mulch", () => {
    expect(h.afgraven(62000, 300).hoeveelheid).toBe(18600) // 18,6 m³
    expect(h.grond(10000, 200, 1500).hoeveelheid).toBe(2300) // 2 m³ + 15 %
    expect(h.grind(62000, 150, 1600).ton).toBe(14880) // 9,3 m³ × 1,6
    expect(h.mulch(20000, 50).hoeveelheid).toBe(1000)
  })
  test("planten altijd naar boven op hele stuks", () => {
    expect(h.planten(20500, 7000).hoeveelheid).toBe(144000) // 143,5 → 144
  })
  test("machinehuur en arbeid", () => {
    expect(h.machinehuur(3000, 15000, 7500).bedrag).toBe(52500)
    expect(h.arbeid(62000, 22000).hoeveelheid).toBe(23000) // 22,55 uur → 23
    expect(h.arbeid(1000, 0).hoeveelheid).toBe(0)
  })
})

test.describe("calculatie", () => {
  const klinkers = nieuweRegel("materiaal", { omschrijving: "Klinkers", hoeveelheid: 55000, eenheid: "m²", inkoop: 2500, afval: 700 })
  const planten = nieuweRegel("planten", { omschrijving: "Grassen P9", hoeveelheid: 140000, eenheid: "st", inkoop: 250 })

  test("opslag, marge en btw per tarief", () => {
    const u = reken({ uren: 48000, uurtarief: 5000, regels: [klinkers, planten], onvoorzien: 0, korting: 0 })
    // klinkers: 58,85 m² × € 25 = € 1.471,25 inkoop; +15 % = € 28,75 × 58,85 = € 1.691,94
    expect(u.regels[0].kostprijs).toBe(147125)
    expect(u.regels[0].verkoop).toBe(169194)
    // planten: 140 × € 2,50 = € 350 inkoop; verkoopprijs per stuk € 3,125 → € 3,13 (per eenheid op de cent), × 140 = € 438,20, 9 % btw
    expect(u.regels[1].verkoop).toBe(43820)
    expect(u.arbeid).toBe(240000)
    expect(u.verkoop).toBe(240000 + 169194 + 43820)
    expect(u.btw).toEqual([
      { tarief: 2100, grondslag: 409194, btw: 85931 },
      { tarief: 900, grondslag: 43820, btw: 3944 },
    ])
    expect(u.totaal).toBe(u.verkoop + 85931 + 3944)
    expect(u.winst).toBe(u.verkoop - 147125 - 35000)
    // marge is winst / verkoop, opslag is winst / kostprijs: nooit hetzelfde
    expect(u.marge).toBe(deel(u.winst * 10000, u.verkoop))
    expect(u.opslag).toBe(deel(u.winst * 10000, u.kostprijs))
    expect(u.marge).not.toBe(u.opslag)
    expect(u.perUur).toBe(deel(u.winst * 1000, 48000))
  })

  test("korting en onvoorzien gaan naar rato over de tarieven", () => {
    const u = reken({ uren: 10000, uurtarief: 5000, regels: [planten], onvoorzien: 500, korting: 1000 })
    const bruto = 50000 + 43820
    expect(u.onvoorzien).toBe(deel(bruto * 500, 10000))
    expect(u.korting).toBe(deel((bruto + u.onvoorzien) * 1000, 10000))
    expect(u.btw.reduce((t, b) => t + b.grondslag, 0)).toBe(u.verkoop)
  })

  test("optioneel werk staat niet in het totaal", () => {
    const optie = { ...planten, id: "o", optioneel: true }
    const met = reken({ uren: 0, uurtarief: 5000, regels: [klinkers, optie], onvoorzien: 0, korting: 0 })
    const zonder = reken({ uren: 0, uurtarief: 5000, regels: [klinkers], onvoorzien: 0, korting: 0 })
    expect(met.totaal).toBe(zonder.totaal)
    expect(met.optioneel).toHaveLength(1)
  })

  test("na betaling wegzetten en tekort", () => {
    const u = reken({ uren: 8000, uurtarief: 5000, regels: [klinkers], onvoorzien: 0, korting: 0 })
    const w = wegzetten(u)
    expect(w.btwInkoop).toBe(deel(147125 * 2100, 10000))
    expect(w.btwAfdragen).toBe(u.btwTotaal - w.btwInkoop)
    expect(w.vrij + w.reserve).toBe(u.winst)
    expect(tekort(u, 8000)).toBe(Math.max(0, 3700 * 8 - u.winst))
    expect(tekort(u, 0)).toBe(0)
  })

  test("marge en opslag omrekenen", () => {
    expect(margeUitOpslag(2500)).toBe(2000) // 25 % opslag = 20 % marge
    expect(opslagUitMarge(2000)).toBe(2500)
  })

  test("onzin uit opslag of van Claude wordt een veilige regel", () => {
    const r = schoonRegel({ soort: "raket", hoeveelheid: 1.5, inkoop: -4, btw: 1900, opslag: 9e15 } as never)
    expect(r.soort).toBe("overig")
    expect(r.hoeveelheid).toBe(1000)
    expect(r.inkoop).toBe(0)
    expect(r.btw).toBe(2100)
    expect(r.opslag).toBe(100000)
  })
})

test.describe("catalogus en klanten", () => {
  test("een nieuwe prijs bewaart de oude in de historie", () => {
    const i = nieuwItem({ naam: "Waaltjes", inkoop: 2000, bijgewerkt: "2026-10-01" })
    const zelfde = zetPrijs(i, 2000)
    expect(zelfde.historie).toHaveLength(0)
    const nieuw = zetPrijs(i, 2200, "Steenrijk")
    expect(nieuw.inkoop).toBe(2200)
    expect(nieuw.historie[0]).toEqual({ datum: "2026-10-01", inkoop: 2000, leverancier: "" })
  })
  test("prijslijst inlezen: nieuw, bijwerken op leverancier + artikelnummer, dubbele regel telt één keer", () => {
    const kop = '\uFEFF"Naam";"Soort";"Eenheid";"Inkoop excl. btw";"Opslag %";"Btw %";"Afval %";"Leverancier";"Artikelnummer";"Link";"Bijgewerkt";"Groep"'
    const rij = (naam: string, prijs: string, sku: string, groep = "BANDEN") => `"${naam}";"Steen, grond, hout, techniek";"st";"${prijs}";"15";"21";"0";"Tuinvariant (Maastricht)";"${sku}";"https://www.tuinvariant.nl";"2026-10-29";"${groep}"`
    const rijen = leesCsv([kop, rij("Band; grijs", "2,28", "2136"), rij('Band "zwart"', "2,54", "2137"), rij("Band zwart", "2,54", "2137", "OPMERKING"), '"";"";"";"abc"', ""].join("\r\n"))
    expect(rijen[1][0]).toBe("Band; grijs")
    const eigen = nieuwItem({ naam: "Eigen band", leverancier: "Tuinvariant (maastricht)", sku: "2136", inkoop: 200, opslag: 3000, bijgewerkt: "2026-10-01" })
    const { items, uitkomst } = importeer([eigen], rijen)
    expect(uitkomst).toEqual({ nieuw: 1, bijgewerkt: 1, gelijk: 0, afgewezen: [5] })
    expect(items).toHaveLength(2)
    // Bijgewerkt: nieuwe prijs, oude in de historie, eigen opslag blijft.
    expect(items[0]).toMatchObject({ id: eigen.id, naam: "Band; grijs", inkoop: 228, opslag: 3000, groep: "BANDEN" })
    expect(items[0].historie[0]).toMatchObject({ inkoop: 200, datum: "2026-10-01" })
    // Nieuw: de laatste van twee dezelfde regels.
    expect(items[1]).toMatchObject({ naam: "Band zwart", inkoop: 254, opslag: 1500, btw: 2100, soort: "materiaal", sku: "2137", groep: "OPMERKING", bijgewerkt: "2026-10-29" })
    // Nog een keer hetzelfde bestand: niets verandert.
    expect(importeer(items, rijen).uitkomst).toMatchObject({ nieuw: 0, bijgewerkt: 0, gelijk: 2 })
    expect(importeer(items, leesCsv("Iets;Anders\n1;2")).uitkomst.fout).toContain("Naam")
    // Zonder kolommen Soort en Eenheid blijven die van het bestaande item staan; zonder Groep telt het toch als prijslijst.
    const compost = nieuwItem({ naam: "Compost", soort: "planten", eenheid: "m³", leverancier: "Lev", sku: "9", inkoop: 1000 })
    const kaal = importeer([compost], leesCsv("Naam;Inkoop;Leverancier;Artikelnummer\nCompost;12,50;Lev;9\nZand;3;Lev;10"))
    expect(kaal.items[0]).toMatchObject({ eenheid: "m³", soort: "planten", inkoop: 1250, geimporteerd: true })
    expect(voorClaude(kaal.items, "minigraver huren")).toHaveLength(0)
  })
  test("zoeken in duizenden items en wat Claude ervan ziet", () => {
    const items = [
      nieuwItem({ naam: "Minigraver", leverancier: "Bosmans" }),
      nieuwItem({ naam: "Opsluitband 5x15x100 grijs", sku: "2136", groep: "OPSLUITBANDEN / MBI", leverancier: "Tuinvariant" }),
      ...Array.from({ length: 3000 }, (_, n) => nieuwItem({ naam: `Tegel ${n}`, groep: "TEGELS" })),
    ]
    expect(zoekItems(items, "opsluit grijs").map((i) => i.sku)).toEqual(["2136"])
    expect(zoekItems(items, "mbi 2136")).toHaveLength(1)
    expect(zoekItems(items, "")).toHaveLength(items.length)
    const claude = voorClaude(items, "Terras met opsluitbanden", 80)
    expect(claude.map((i) => i.naam)).toEqual(["Minigraver", "Opsluitband 5x15x100 grijs"])
    expect(voorClaude(items, "tegels leggen").length).toBe(81)
  })
  test("voorstellen van Claude: alleen wat klopt wordt bewaard, als voorstel", () => {
    const k = normaliseer({ id: "k", naam: "Geheime Klant", tuinen: [{ id: "t", naam: "Voortuin", adres: "Kerkstraat 1, Stein", zones: [{ id: "z", naam: "Terras", soort: "Terras" }] } as never] })
    const t = k.tuinen[0]
    const ruw = {
      bevindingen: [
        { zone: "Terras", tekst: "Tegels verzakt.", zeker: "zichtbaar", fotos: [1, 2, 9], vraag: "grond", antwoord: "Marmer", meting: "Hoogteverschil naar de deur" },
        { zone: "Dak", tekst: "Telefoonkabel langs de gevel.", zeker: "zeker weten", fotos: [], vraag: "bestaat-niet", antwoord: "Ja", meting: "" },
        { zone: "Terras", tekst: "", zeker: "vermoed", fotos: [], vraag: "", antwoord: "", meting: "" },
      ],
    }
    const b = schoonBevindingen(ruw, STANDAARD, t, ["f1", "f2"], "2026-10-29")
    expect(b).toHaveLength(2)
    expect(b[0]).toMatchObject({ zone: "Terras", zeker: "zichtbaar", bron: ["f1", "f2"], meting: "Hoogteverschil naar de deur", status: "voorstel" })
    expect(b[0].vraag).toBeUndefined() // "Marmer" is geen optie van Grondsoort
    expect(b[1]).toMatchObject({ zone: "Algemeen", zeker: "vermoed" })
    expect(schoonBevindingen("onzin", STANDAARD, t, [], "2026-10-29")).toEqual([])
    const tekst = opdracht(STANDAARD, t, [{ nr: 1, bijschrift: "bij de deur", zone: "z", tijd: "0:03" }])
    expect(tekst).toContain("Foto 1 (uit video, 0:03), zone Terras: bij de deur")
    expect(tekst).not.toContain("Geheime Klant")
    expect(tekst).not.toContain("Kerkstraat")
    // Contactgegevens in vrije tekst gaan er ook niet in.
    expect(zonderContact("Bel op 06 12345678 of +31 (0)46 123 45 67, mail test@example.invalid; adres Teststraat 1a, 6171 AB Stein. Terras 4,5 bij 3 m, 2026-10-29.")).toBe(
      "Bel op [telefoon] of [telefoon], mail [e-mail]; adres [adres], [postcode] Stein. Terras 4,5 bij 3 m, 2026-10-29.",
    )
    const met = normaliseer({ id: "k2", naam: "X", tuinen: [{ id: "t", naam: "Tuin", antwoorden: { bijzonderheden: "Bel 0612345678" }, zones: [{ id: "z", naam: "Pad", soort: "Pad", notitie: "sleutel bij buren, a@b.nl" }] } as never] })
    const p = opdracht({ ...STANDAARD, categorieen: [{ id: "x", naam: "X", vragen: [{ id: "bijzonderheden", tekst: "Bijzonderheden", soort: "lang" }] }] }, met.tuinen[0], [{ nr: 1, bijschrift: "voordeur Kerkweg 12", zone: "z" }])
    expect(p).not.toMatch(/0612345678|a@b\.nl|Kerkweg 12/)
  })
  test("meetstaat: van zonematen naar hoeveelheden met formule", () => {
    const zone = (x: Partial<Parameters<typeof meetstaat>[0][number]>) => ({ id: "z", naam: "Zone A", soort: "Terras" as const, lengte: "", breedte: "", oppervlak: "", diepte: "", notitie: "", ...x })
    const [terras] = meetstaat([zone({ lengte: "7", breedte: "10" })])
    const per = Object.fromEntries(terras.regels.map((r) => [r.wat, r]))
    expect(per["Afgraven"].hoeveelheid).toBe(21000)
    expect(per["Afgraven"].formule).toContain("70 m² × 300 mm = 21 m³")
    expect(per["Fundering korrelmix"].hoeveelheid).toBe(14000)
    expect(per["Straatzand (straatlaag)"].hoeveelheid).toBe(2800)
    expect(per["Bestrating"].hoeveelheid).toBe(73500)
    expect(per["Opsluitband"].hoeveelheid).toBe(34000)
    // Eigen afgraafdiepte in cm gaat voor.
    expect(meetstaat([zone({ oppervlak: "10", diepte: "40" })])[0].regels[0].hoeveelheid).toBe(4000)
    const [vijver] = meetstaat([zone({ soort: "Vijver", lengte: "3", breedte: "2", diepte: "1" })])
    expect(vijver.regels.map((r) => [r.wat, r.hoeveelheid])).toEqual([["Uitgraven", 6000], ["Vijverfolie", 30000]])
    expect(meetstaat([zone({ soort: "Vijver", oppervlak: "6" })])[0].mist).toContain("diepte")
    expect(meetstaat([zone({})])[0].mist).toContain("oppervlak")
    // Met de catalogus: prijs uit het artikel, big bags op halve BB naar boven.
    const korrel = nieuwItem({ naam: "Korrelmix", eenheid: "BB", inkoop: 3306 })
    const regel = naarMeetRegel({ ...per["Fundering korrelmix"], hoeveelheid: 13200 }, [korrel])
    expect(regel).toMatchObject({ omschrijving: "Korrelmix · Zone A (1 BB = 1 m³)", eenheid: "BB", hoeveelheid: 13500, inkoop: 3306, catalogusId: korrel.id, groep: "Zone A" })
    expect(naarMeetRegel(per["Bestrating"], [korrel])).toMatchObject({ omschrijving: "Bestrating · Zone A", eenheid: "m²", inkoop: 0 })
    // Het snijverlies zit al in de meetstaat; het afval van het artikel komt er niet nog eens bij.
    const klinker = nieuwItem({ naam: "BKK klinker", eenheid: "m²", inkoop: 1570, afval: 500 })
    const k = naarMeetRegel(per["Bestrating"], [klinker])
    expect(k).toMatchObject({ hoeveelheid: 73500, afval: 0, meetstaat: per["Bestrating"].zoneId })
  })
  test("werkplan uit de meetstaat: fasen, dagen en startdagen", () => {
    const zone = (x: Partial<Parameters<typeof meetstaat>[0][number]>) => ({ id: crypto.randomUUID(), naam: "Zone A", soort: "Terras" as const, lengte: "", breedte: "", oppervlak: "", diepte: "", notitie: "", ...x })
    const plan = werkplan([zone({ lengte: "7", breedte: "10" }), zone({ soort: "Border", oppervlak: "20" })])
    expect(plan.map((f) => [f.naam, f.dagen])).toEqual([
      ["Afgraven en grond afvoeren", 1.5],
      ["Fundering en straatlaag", 1.5],
      ["Opsluitbanden en bestraten", 6],
      ["Beplanting", 1],
      ["Opruimen en opleveren", 0.5],
    ])
    expect(startDagen(plan)).toEqual([1, 2.5, 4, 10, 11])
    expect(totaalDagen(plan)).toBe(10.5)
    expect(werkplan([zone({})])).toEqual([])
    const met = metWerkvolgorde("Oude tegels eruit.", plan)
    const nogmaals = metWerkvolgorde(`${met}\n\nSchutting blijft staan.`, plan.slice(0, 1))
    expect(nogmaals.match(/Werkvolgorde:/g)).toHaveLength(1)
    expect(nogmaals).toMatch(/^Oude tegels eruit\.\n\nWerkvolgorde:\n1\. Afgraven[\s\S]*weer\.\n\nSchutting blijft staan\.$/)
    expect(schoonPlan([{ naam: "  Graven ", dagen: 0.3 }, { naam: "" }, { naam: "Lang", dagen: 99 }]).map((f) => [f.naam, f.dagen])).toEqual([["Graven", 0.5], ["Lang", 60]])
  })
  test("project: taken uit de planning, nacalculatie en opschonen", () => {
    const p = nieuwProject({ id: "c", titel: "Terras" }, { nr: 2, uren: 16000, winst: 80000, planning: [{ id: "a", naam: "Graven", dagen: 1.5, machines: "", levering: "" }, { id: "b", naam: "Straten", dagen: 3, machines: "", levering: "" }] })
    expect(p.taken.map((t) => [t.naam, t.dagen, t.klaar])).toEqual([["Graven", 1.5, false], ["Straten", 3, false]])
    const met = normaliseerProject({ ...p, taken: [{ ...p.taken[0], klaar: true }, p.taken[1]], uren: [{ id: "u", datum: "2026-10-30", uren: 20000, wat: "" }, { id: "x", datum: "fout", uren: -5, wat: "" } as never], meerwerk: [{ id: "m", datum: "2026-10-30", omschrijving: "Afwatering", bedrag: 25000, akkoord: true }, { id: "n", datum: "2026-10-30", omschrijving: "Hek", bedrag: 10000, akkoord: false }] })
    expect(met.uren).toHaveLength(1)
    const n = nacalculatie(met)
    expect(n).toMatchObject({ urenBegroot: 16000, urenWerkelijk: 20000, dagenBegroot: 4.5, takenKlaar: 1, taken: 2, meerwerkAkkoord: 25000, meerwerkOpen: 10000, perUurBegroot: 5000, perUurWerkelijk: 4000 })
    expect(normaliseerProject({}).taken).toEqual([])
    expect(normaliseerProject({}).begroot).toEqual({ uren: 0, winst: 0 })
  })
  test("dubbele klant op mail, nummer of naam", () => {
    const lijst = [normaliseer({ id: "a", naam: "Diliana Timmermans", telefoon: "06 12 34 56 78" }), normaliseer({ id: "b", naam: "Noah", email: "noah@voorbeeld.nl" })]
    expect(zoekDubbel(lijst, { contact: "+31 6 12345678" }).map((k) => k.id)).toEqual(["a"])
    expect(zoekDubbel(lijst, { contact: "NOAH@voorbeeld.nl" }).map((k) => k.id)).toEqual(["b"])
    expect(zoekDubbel(lijst, { naam: "diliana timmermans " }).map((k) => k.id)).toEqual(["a"])
    expect(zoekDubbel(lijst, { naam: "Iemand anders", contact: "0612000000" })).toHaveLength(0)
  })
  test("een oude klant zonder nieuwe velden blijft leesbaar", () => {
    const k = normaliseer({ id: "oud", naam: "Vaessen", fase: "Opgeleverd" as never, stukken: [] })
    expect(k.tuinen).toEqual([])
    expect(k.soort).toBe("Particulier")
    expect(normaliseer({ id: "x", naam: "X", fase: "Bestaat niet" as never }).fase).toBe("Aanvraag")
  })
  test("oppervlak uit de opname", () => {
    expect(oppervlakUit({ oppervlak: "62" })).toBe(62000)
    expect(oppervlakUit({ lengte: "8,5", breedte: "6" })).toBe(51000)
    expect(oppervlakUit({})).toBeNull()
  })
})

test.describe("vragenlijst van de intake", () => {
  const leeg = { antwoorden: {} as Record<string, string>, notities: {}, aandacht: [] as string[], diensten: [] as string[] }
  test("elk id één keer, elke dienst bestaat", () => {
    const ids = alleVragen(STANDAARD).map((v) => v.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const c of STANDAARD.categorieen) for (const d of [...(c.toonBij ?? []), ...c.vragen.flatMap((v) => v.toonBij ?? [])]) expect(STANDAARD.diensten).toContain(d)
  })
  test("vervolgvragen verschijnen pas bij de gekozen werkzaamheden", () => {
    const zonder = vragenVoor(STANDAARD, leeg, "uitgebreid").map((c) => c.id)
    expect(zonder).not.toContain("bestrating")
    expect(zonder).not.toContain("vijver")
    const met = vragenVoor(STANDAARD, { ...leeg, diensten: ["Bestrating"] }, "uitgebreid")
    expect(met.find((c) => c.id === "bestrating")?.vragen.map((v) => v.id)).toEqual(expect.arrayContaining(["funderingType", "afschot", "opsluiting", "bestratingMaat"]))
    const vijver = vragenVoor(STANDAARD, { ...leeg, diensten: ["Vijver of waterelement"] }, "uitgebreid")
    expect(vijver.find((c) => c.id === "vijver")?.vragen.map((v) => v.id)).toEqual(expect.arrayContaining(["pomp", "filter", "leiding", "overloop"]))
    expect(telling(STANDAARD, { antwoorden: {}, diensten: ["Bestrating"] }).van).toBeGreaterThan(telling(STANDAARD, { antwoorden: {}, diensten: [] }).van)
  })
  test("snel, uitgebreid en vervolg", () => {
    const snel = vragenVoor(STANDAARD, leeg, "snel").flatMap((c) => c.vragen)
    expect(snel.length).toBeGreaterThan(3)
    expect(snel.every((v) => v.snel)).toBe(true)
    const s = { ...leeg, antwoorden: { woning: "Vrijstaand", grond: "Onbekend" }, aandacht: ["toegang"] }
    const vervolg = vragenVoor(STANDAARD, s, "vervolg").flatMap((c) => c.vragen.map((v) => v.id))
    expect(vervolg).not.toContain("woning")
    expect(vervolg).toContain("grond")
    expect(vervolg).toContain("parkeren")
  })
  test("open punten: gemarkeerd eerst, dan onbekend, dan leeg", () => {
    const p = openPunten(STANDAARD, { ...leeg, antwoorden: { woning: "Vrijstaand", grond: "Onbekend", toegang: "Alleen kruiwagen" }, aandacht: ["toegang"] })
    expect(p[0]).toMatchObject({ reden: "aandacht", vraag: { id: "toegang" } })
    expect(p[1]).toMatchObject({ reden: "onbekend", vraag: { id: "grond" } })
    expect(p.some((x) => x.vraag.id === "woning")).toBe(false)
  })
  test("antwoorden worden gecontroleerd tegen de vraag", () => {
    const v = (id: string) => alleVragen(STANDAARD).find((x) => x.id === id)!
    expect(schoonAntwoord(v("minigraver"), "Ja")).toBe("Ja")
    expect(schoonAntwoord(v("minigraver"), "Misschien")).toBeNull()
    expect(schoonAntwoord(v("grond"), "Klei")).toBe("Klei")
    expect(schoonAntwoord(v("grond"), "Marmer")).toBeNull()
    expect(schoonAntwoord(v("startdatum"), "morgen")).toBeNull()
    expect(schoonAntwoord(v("oppervlak"), "  ")).toBe("")
  })
  test("oude opname: vinkjes van de checklist worden Ja, ook zonder nieuwe vraag", () => {
    const k = normaliseer({ id: "k", naam: "K", tuinen: [{ id: "t", naam: "Achter", antwoorden: { oppervlak: "55" }, checklist: ["parkeren-voor-de-bus", "telefoon-met-volle-batterij-voor-foto-s"], diensten: [] } as never] })
    expect(k.tuinen[0].antwoorden).toEqual({ oppervlak: "55", "parkeren-voor-de-bus": "Ja", "telefoon-met-volle-batterij-voor-foto-s": "Ja" })
    expect(k.tuinen[0].vragen["parkeren-voor-de-bus"]).toBe("Parkeren voor de bus")
    expect(k.tuinen[0].soort).toBe("uitgebreid")
    expect(k.tuinen[0].zones).toEqual([])
  })
  test("een kapotte opgeslagen lijst valt terug op de startinhoud", () => {
    expect(schoonLijst(null)).toBe(STANDAARD)
    expect(schoonLijst({ categorieen: [] })).toBe(STANDAARD)
    const eigen = schoonLijst({ versie: 3, diensten: ["Zwemvijver"], categorieen: [{ id: "z", naam: "Zwemvijver", vragen: [{ id: "a", tekst: "Diepte", soort: "raar" }] }] })
    expect(eigen.categorieen[0].vragen[0].soort).toBe("tekst")
    expect(eigen.versie).toBe(3)
  })
  test("oppervlak van een zone", () => {
    expect(zoneOppervlak({ oppervlak: "", lengte: "7", breedte: "10" })).toBe(70000)
    expect(zoneOppervlak({ oppervlak: "50", lengte: "7", breedte: "10" })).toBe(50000)
  })
})


test("rekenblad met btw: incl. invoeren, excl. rekenen, big bags kiezen", async ({ page }) => {
  const { KOEKJE, maakKoekje } = await import("../src/lib/eigenaar")
  process.env.AUTH_SECRET = "alleen-voor-tests"
  await page.context().addCookies([{ name: KOEKJE, value: await maakKoekje("hello@gronn.studio"), url: "http://localhost:3210" }])
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/dashboard/prijs")
  // De enige regel; wisselt hij van soort, dan schuift hij naar die sectie.
  const regel = page.locator("tbody tr").filter({ has: page.getByLabel("Soort") })
  await regel.getByLabel("Eenheid", { exact: true }).fill("BB")
  await page.getByLabel("Bedragen met btw").check()
  await regel.getByLabel("Inkoop per eenheid incl. btw").fill("48,40")
  await expect(regel.getByText("40,00 excl.")).toBeVisible()
  await regel.getByRole("button", { name: "½" }).click()
  await expect(regel.getByLabel("Aantal", { exact: true })).toHaveValue("0,5")
  // ½ × € 40 × 1,15 opslag = € 23,00 excl. = € 27,83 incl.
  await expect(regel.getByText("€ 27,83")).toBeVisible()
  // Een ander tarief: de incl.-prijs volgt het excl.-bedrag, geen oude getypte tekst.
  await regel.getByLabel("Soort").selectOption("planten")
  await expect(regel.getByLabel("Inkoop per eenheid incl. btw")).toHaveValue("43,60")
  await regel.getByLabel("Soort").selectOption("materiaal")
  await page.getByLabel("Bedragen met btw").uncheck()
  await expect(regel.getByLabel("Inkoop per eenheid", { exact: true })).toHaveValue("40,00")
  await expect(regel.getByText("€ 23,00")).toBeVisible()
  await regel.getByRole("button", { name: "los" }).click()
  await expect(regel.getByLabel("Eenheid", { exact: true })).toHaveValue("m³")
})

test("dubbele regels vinden en alleen de laatste houden", () => {
  const r = [{ omschrijving: "Hekwerk", v: 1 }, { omschrijving: "Zand", v: 1 }, { omschrijving: "hekwerk ", v: 2 }, { omschrijving: "", v: 0 }, { omschrijving: "", v: 0 }]
  expect(dubbelen(r)).toEqual([["hekwerk", 2]])
  expect(ontdubbeld(r).map((x) => x.v)).toEqual([1, 2, 0, 0])
})

test("project in delen: taken en begroting naar werkdagen", () => {
  const p = nieuwProject({ id: "c", titel: "Tuin" }, { nr: 1, uren: 100_000, winst: 40_000, planning: [
    { id: "a", naam: "Grondwerk", dagen: 1, machines: "", levering: "" },
    { id: "b", naam: "Bestraten", dagen: 3, machines: "", levering: "" },
  ] })
  const b = p.taken[1].id
  const uit = splitsProject(p, [b], "maart 2027")!
  expect(uit[0].taken.map((t) => t.naam)).toEqual(["Grondwerk"])
  expect(uit[1].titel).toBe("Tuin · maart 2027")
  expect(uit[1].begroot).toEqual({ uren: 75_000, winst: 30_000 })
  expect(uit[0].begroot.uren + uit[1].begroot.uren).toBe(100_000)
  expect(splitsProject(p, [], "x")).toBeNull()
  expect(splitsProject(p, p.taken.map((t) => t.id), "x")).toBeNull()
})

test("calculatietitel uit klant en tuin of beschrijving", () => {
  expect(calculatieTitel("Clannad & Stijn", "Cottagetuin", "x")).toBe("Clannad & Stijn · Cottagetuin")
  expect(calculatieTitel("Clannad & Stijn", "Tuin", "Renovatie cottagetuin met waaltjes. Daarna gazon.")).toBe("Clannad & Stijn · Renovatie cottagetuin met waaltjes")
  expect(calculatieTitel("Jan", undefined, "")).toBe("Jan")
})

test("werkomschrijving: per fase genummerde posten met prijs uit de regels, en een deel per fase", () => {
  const steen = { ...nieuweRegel("materiaal", { omschrijving: "Waaltjes", hoeveelheid: 1000, inkoop: 10000, opslag: 0, groep: "Fase 2 — Maart 2027" }), post: "Bestrating" }
  const tekst = werkomschrijving({
    klant: "Test",
    posten: [
      { wat: "Grondwerk", toelichting: "Grond aanvoeren.", uren: 2, fase: "Fase 1 — November 2026" },
      { wat: "Bestrating", toelichting: "Waaltjes straten.", uren: 1, fase: "Fase 2 — Maart 2027" },
    ],
    regels: [steen],
    uurtarief: 5000,
    onvoorzien: 0,
    korting: 0,
  })
  expect(tekst).toContain("# Werkomschrijving & prijsopbouw")
  expect(tekst).toContain("## Fase 1 — November 2026")
  expect(tekst).toContain("| **1. Grondwerk** — Grond aanvoeren. | € 100,00 |")
  expect(tekst).toContain("| **2. Bestrating** — Waaltjes straten. | € 150,00 |")
  expect(tekst).toContain("| Subtotaal excl. btw | € 250,00 |")
  const fase2 = faseTekst(tekst, "Fase 2 — Maart 2027")
  expect(fase2).toContain("Bestrating")
  expect(fase2).not.toContain("Grondwerk")
  const v = { uren: 3000, uurtarief: 5000, onvoorzien: 0, korting: 0, regels: [steen], fasen: [{ naam: "Fase 1 — November 2026", uren: 2000 }, { naam: "Fase 2 — Maart 2027", uren: 1000 }] }
  expect(reken(faseInvoer(v, "Fase 1 — November 2026")).verkoop).toBe(10000)
  expect(reken(faseInvoer(v, "Fase 2 — Maart 2027")).verkoop).toBe(15000)
})

test("opmaakTekst zet posten in de layout en rekent totalen", () => {
  const t = opmaakTekst("Test", { fasen: [{ naam: "Fase 1 — Maart 2027", posten: [{ titel: "Gazon", toelichting: "20 m² graszoden.", bedrag: 100, nagaan: false }, { titel: "Hek", toelichting: "15 m.", bedrag: null, nagaan: true }] }], extra: [], voorbehoud: "" })
  expect(t).toContain("| **1. Gazon** — 20 m² graszoden. | € 100,00 |")
  expect(t).toContain("Nog te calculeren*")
  expect(t).toContain("**€ 121,00**")
})

test("projectAgenda zet taken achter elkaar in werkdagen, ics heeft hele dagen", async () => {
  const { projectAgenda, agendaBestand, normaliseerProject } = await import("../src/lib/crm/project")
  const p = normaliseerProject({ id: "p1", titel: "Fase 1", start: "2026-11-06", taken: [{ id: "a", naam: "Graven", dagen: 1.5, klaar: false }, { id: "b", naam: "Straten", dagen: 1, klaar: false }] })
  const a = projectAgenda(p)
  expect(a).toEqual([{ id: "a", naam: "Graven", van: "2026-11-06", tot: "2026-11-09" }, { id: "b", naam: "Straten", van: "2026-11-10", tot: "2026-11-10" }])
  const ics = agendaBestand([{ id: "x", titel: "Graven", van: "2026-11-06", tot: "2026-11-09" }])
  expect(ics).toContain("DTSTART;VALUE=DATE:20261106")
  expect(ics).toContain("DTEND;VALUE=DATE:20261110")
})

test("werkomschrijving volgt de lijst: postbedragen weg, fasetotaal en prijsoverzicht uit de som", async () => {
  const { metActueleBedragen } = await import("../src/lib/crm/werkomschrijving")
  const tekst = "# Werkomschrijving\n\n## Fase 1\n\n| Werkzaamheden | Excl. btw |\n|---|---:|\n| **1. Graven** — weg | € 999,00 |\n\n## Prijsoverzicht\n\n| Omschrijving | Bedrag |\n|---|---:|\n| **Totaal incl. btw** | **€ 1,00** |\n\n---\n\n**Prijsvoorbehoud:** test"
  const uit = metActueleBedragen(tekst, { verkoop: 10000, btw: 2100, totaal: 12100, fasen: [{ naam: "Fase 1", verkoop: 10000 }] })
  expect(uit).not.toContain("999")
  expect(uit).toContain("Totaal deze fase** | **€ 100,00**")
  expect(uit).toContain("**Totaal incl. btw** | **€ 121,00**")
  expect(uit).toContain("Prijsvoorbehoud:** test")
  expect(metActueleBedragen(uit, { verkoop: 10000, btw: 2100, totaal: 12100, fasen: [{ naam: "Fase 1", verkoop: 10000 }] })).toBe(uit)
})

test("weer: uurstappen per Nederlandse dag, zes-uurstappen niet dubbel, labels", async () => {
  const { perDag, weerLabel } = await import("../src/lib/crm/weer")
  const stap = (time: string, t: number, een?: number, zes?: number) => ({ time, data: { instant: { details: { air_temperature: t } }, ...(een !== undefined ? { next_1_hours: { details: { precipitation_amount: een } } } : {}), ...(zes !== undefined ? { next_6_hours: { details: { precipitation_amount: zes } } } : {}) } })
  const d = perDag([
    stap("2026-11-03T06:00:00Z", -1.4, 0.5, 9), // uurstap: 0,5 telt, de 9 van zes uur niet
    stap("2026-11-03T07:00:00Z", 2, 1.5, 9),
    stap("2026-11-03T23:30:00Z", 5, 0), // 00:30 in Nederland: al 4 november
    stap("2026-11-05T06:00:00Z", 8, undefined, 6), // zes-uurstap
  ])
  expect(d["2026-11-03"]).toEqual({ mm: 2, min: -1, max: 2 })
  expect(d["2026-11-04"]).toEqual({ mm: 0, min: 5, max: 5 })
  expect(d["2026-11-05"].mm).toBe(6)
  // 18 UTC = 19 uur in Nederland: vijf uur op de 5e, één uur op de 6e. Een dag zonder temperatuur valt weg.
  const nacht = perDag([stap("2026-11-05T12:00:00Z", 9), stap("2026-11-05T18:00:00Z", 7, undefined, 6), stap("2026-11-06T00:00:00Z", 6)])
  expect(nacht["2026-11-05"].mm).toBe(5)
  expect(nacht["2026-11-06"].mm).toBe(1)
  expect(weerLabel(d["2026-11-03"])).toEqual({ tekst: "Vorst −1°", let: true })
  expect(weerLabel(d["2026-11-05"])).toEqual({ tekst: "Regen 6 mm", let: true })
  expect(weerLabel({ mm: 2, min: 4, max: 9 })).toEqual({ tekst: "Regen 2 mm", let: false })
  expect(weerLabel(d["2026-11-04"])).toEqual({ tekst: "Droog 5°", let: false })
})

test("jaaroverzicht: facturen en uren per maand, per uur excl. btw", async () => {
  const { jaarOverzicht } = await import("../src/lib/crm/overzicht")
  const k = normaliseer({
    id: "a",
    naam: "Test Klant",
    stukken: [
      { id: "1", soort: "Factuur", nummer: "F1", bedrag: 1210, datum: "2026-07-14", rond: true },
      { id: "2", soort: "Factuur", nummer: "F2", bedrag: 605, datum: "2026-07-30" },
      { id: "3", soort: "Offerte", nummer: "O1", bedrag: 9999, datum: "2026-07-01" },
      { id: "4", soort: "Factuur", nummer: "F0", bedrag: 500, datum: "2025-12-30", rond: true },
    ],
  })
  const j = jaarOverzicht([k], [{ datum: "2026-07-06", uren: 30 }, { datum: "2026-07-20", uren: 0.5 }, { datum: "2026-08-03", uren: 4 }, { datum: "2025-07-01", uren: 99 }], "2026")
  expect(j).toHaveLength(12)
  expect(j[6]).toEqual({ maand: "2026-07", gefactureerd: 1815, ontvangen: 1210, uren: 30.5, perUur: 49 })
  expect(j[7]).toEqual({ maand: "2026-08", gefactureerd: 0, ontvangen: 0, uren: 4 })
  expect(j[11].gefactureerd).toBe(0)
})

test("onderhoud: tag geeft elk seizoen een beurt op de eerste maandag, verloren telt niet", async () => {
  const { onderhoudsbeurten } = await import("../src/lib/crm/agenda")
  const vast = normaliseer({ id: "v", naam: "Anna de Vries", tags: ["Onderhoud"], fase: "Opgeleverd" })
  const weg = normaliseer({ id: "w", naam: "Weg", tags: ["onderhoud"], fase: "Verloren" })
  const los = normaliseer({ id: "l", naam: "Los", tags: ["vijver"] })
  const b = onderhoudsbeurten([vast, weg, los], "2026-11-02", "2027-06-30")
  expect(b.map((x) => [x.datum, x.wat])).toEqual([
    ["2026-12-07", "Winterbeurt Anna de Vries"],
    ["2027-03-01", "Voorjaarsbeurt Anna de Vries"],
    ["2027-06-07", "Zomerbeurt Anna de Vries"],
  ])
  expect(b[0]).toMatchObject({ wie: "Anna", href: "/dashboard/klanten/v" })
})

test.describe("betaalstand (voorwaarden: 14 dagen, dan een herinnering met 14 dagen)", () => {
  test("open, te laat, herinnerd en betaald", () => {
    expect(betaalstand({ datum: "2026-11-01" }, "2026-11-15")).toEqual({ stand: "open", vervalt: "2026-11-15" })
    expect(betaalstand({ datum: "2026-11-01" }, "2026-11-18")).toEqual({ stand: "te laat", vervalt: "2026-11-15", dagen: 3 })
    expect(betaalstand({ datum: "2026-10-01", herinnerd: "2026-10-20" }, "2026-11-03")).toEqual({ stand: "herinnerd", herinnerd: "2026-10-20", uiterlijk: "2026-11-03", voorbij: false })
    expect(betaalstand({ datum: "2026-10-01", herinnerd: "2026-10-20" }, "2026-11-04")).toMatchObject({ stand: "herinnerd", voorbij: true })
    expect(betaalstand({ datum: "2026-10-01", rond: true, herinnerd: "2026-10-20" }, "2026-12-01")).toEqual({ stand: "betaald" })
  })
  test("over de zomertijd heen telt in hele dagen", () => {
    expect(betaalstand({ datum: "2026-10-20" }, "2026-11-04")).toEqual({ stand: "te laat", vervalt: "2026-11-03", dagen: 1 })
  })
})

test("geplande uren: dagen uit de nieuwste planning per calculatie × 8", () => {
  const k = normaliseer({ id: "k", naam: "Test" })
  expect(geplandeUren(k)).toBe(0)
  const plan = [{ id: "a", naam: "Grond", dagen: 1.5, machines: "", levering: "" }, { id: "b", naam: "Opruimen", dagen: 0.5, machines: "", levering: "" }]
  const met = { ...k, calculaties: [{ id: "c", titel: "C", aangemaakt: "2026-11-01", versies: [{ nr: 1, datum: "2026-11-01", planning: plan }] }] } as unknown as typeof k
  expect(geplandeUren(met)).toBe(16)
  // Twee klussen tellen samen; van een herziene calculatie telt alleen de nieuwste versie.
  const twee = { ...k, calculaties: [
    { id: "c", titel: "C", aangemaakt: "2026-11-01", versies: [{ nr: 1, datum: "2026-11-01", planning: [{ ...plan[0], dagen: 9 }] }, { nr: 2, datum: "2026-11-02", planning: plan }] },
    { id: "d", titel: "D", aangemaakt: "2026-11-03", versies: [{ nr: 1, datum: "2026-11-03", planning: [plan[0]] }] },
  ] } as unknown as typeof k
  expect(geplandeUren(twee)).toBe(28)
})

test.describe("inkoop", () => {
  test("schoonmaken: zonder datum, leverancier of geldig bedrag geen regel", () => {
    expect(schoonInkoop({ datum: "2026-11-05", leverancier: "Bomat", bedrag: 10000 })).toMatchObject({ btw: 2100, betaald: false, nummer: "" })
    expect(schoonInkoop({ datum: "5-11-2026", leverancier: "Bomat", bedrag: 1 })).toBeNull()
    expect(schoonInkoop({ datum: "2026-11-05", leverancier: " ", bedrag: 1 })).toBeNull()
    expect(schoonInkoop({ datum: "2026-11-05", leverancier: "Bomat", bedrag: 1.5 })).toBeNull()
    expect(schoonInkoop({ datum: "2026-11-05", leverancier: "Bomat", bedrag: 1, btw: 1234, bestand: { ext: "exe" } })).not.toHaveProperty("bestand")
  })
  test("gemengde btw: het btw-bedrag van de factuur gaat voor het tarief", () => {
    const i = schoonInkoop({ datum: "2026-11-05", leverancier: "Bomat", bedrag: 10000, btw: 2100, btwBedrag: 1500 })!
    expect(metBtw(i)).toBe(11500)
    expect(metBtw(schoonInkoop({ datum: "2026-11-05", leverancier: "Bomat", bedrag: 10000, btw: 2100 })!)).toBe(12100)
    expect(schoonInkoop({ datum: "2026-11-05", leverancier: "Bomat", bedrag: 100, btwBedrag: 500 })).not.toHaveProperty("btwBedrag")
  })
  test("te betalen: open eerst, oudste vervaldag voorop", () => {
    const r = (id: string, vervalt: string, betaald = false) => ({ ...schoonInkoop({ datum: "2026-11-01", leverancier: id, bedrag: 1, vervalt, betaald })!, id })
    expect(teBetalen([r("b", "2026-11-20"), r("a", "2026-11-10"), r("c", "2026-11-01", true)]).map((i) => i.id)).toEqual(["a", "b"])
  })
  test("nacalculatie: gefactureerd excl. btw min inkoop, per uur", () => {
    expect(naInkoop(1210, 40000, 10)).toEqual({ omzet: 100000, inkoop: 40000, over: 60000, perUur: 6000 })
    expect(naInkoop(0, 5000, 0).perUur).toBe(0)
  })
})

test.describe("factuur", () => {
  test("btw per tarief over de som, totaal klopt", () => {
    const r = [{ omschrijving: "a", bedrag: 10000, btw: 2100 }, { omschrijving: "b", bedrag: 5000, btw: 900 }, { omschrijving: "c", bedrag: 333, btw: 2100 }]
    expect(btwPerTarief(r)).toEqual([{ tarief: 2100, grondslag: 10333, btw: 2170 }, { tarief: 900, grondslag: 5000, btw: 450 }])
    expect(factuurTotaal(r).totaal).toBe(10333 + 2170 + 5000 + 450)
  })
  test("termijn: per tarief het deel van de offerte", () => {
    const o = { nummer: "GR-O // 1", btw: [{ tarief: 2100, grondslag: 100000, btw: 21000 }, { tarief: 900, grondslag: 20000, btw: 1800 }] }
    const r = termijnRegels(o, 4000, "Termijn 1 van 3")
    expect(r!.map((x) => [x.bedrag, x.btw])).toEqual([[40000, 2100], [8000, 900]])
    expect(r![0].omschrijving).toContain("Termijn 1 van 3 · 40 % van offerte GR-O // 1")
  })
  test("termijnen: samen niet boven 100 %, de laatste krijgt de rest", () => {
    const o = { nummer: "GR-O // 2", btw: [{ tarief: 2100, grondslag: 10001, btw: 2100 }] }
    const een = termijnRegels(o, 5000, "1")!
    expect(een[0].bedrag).toBe(5001)
    const twee = termijnRegels(o, 5000, "2", [{ deel: 5000, regels: een }])!
    expect(twee[0].bedrag).toBe(5000)
    expect(termijnRegels(o, 6000, "2", [{ deel: 5000, regels: een }])).toBeNull()
    expect(termijnRegels(o, 10000, "nog eens", [{ deel: 10000, regels: [{ omschrijving: "", bedrag: 10001, btw: 2100 }] }])).toBeNull()
  })
  test("nummer: Nicks vorm, volgnummer per dag", () => {
    const k = [{ stukken: [{ id: "1", soort: "Factuur" as const, nummer: "GR-F // 2026-1105-0002", bedrag: 1, datum: "2026-11-05" }, { id: "2", soort: "Offerte" as const, nummer: "GR-F // 2026-1105-0009", bedrag: 1, datum: "2026-11-05" }] }]
    expect(volgendFactuurNummer(k, "2026-11-05")).toBe("GR-F // 2026-1105-0003")
    expect(volgendFactuurNummer(k, "2026-11-06")).toBe("GR-F // 2026-1106-0001")
  })
  test("SEPA-betaalcode volgens EPC069-12", () => {
    expect(epcCode({ naam: "GRØNN Studio", iban: "nl91 abna 0417 1643 00", bedrag: 12100, omschrijving: "Factuur 1" }).split("\n")).toEqual(["BCD", "002", "1", "SCT", "", "GRØNN Studio", "NL91ABNA0417164300", "EUR121.00", "", "", "Factuur 1"])
  })
})

test.describe("werkbon", () => {
  test("nummer per dag, handtekening alleen als echte PNG", () => {
    expect(volgendWerkbonNummer([{ nummer: "GR-W // 2026-1105-01" }], "2026-11-05")).toBe("GR-W // 2026-1105-02")
    expect(volgendWerkbonNummer([], "2026-11-06")).toBe("GR-W // 2026-1106-01")
    const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(200)]).toString("base64")
    expect(schoneHandtekening(`data:image/png;base64,${png}`)).toBe(`data:image/png;base64,${png}`)
    expect(schoneHandtekening(`data:image/svg+xml;base64,${png}`)).toBeNull()
    expect(schoneHandtekening(`data:image/png;base64,${Buffer.from("<svg onload=alert(1)>".repeat(10)).toString("base64")}`)).toBeNull()
    expect(schoneHandtekening(`data:image/png;base64,${"A".repeat(MAX_HANDTEKENING)}`)).toBeNull()
  })
})

test("korting per regel: over de verkoop van die regel, btw over wat overblijft", () => {
  const r = nieuweRegel("materiaal", { inkoop: 10000, opslag: 0, hoeveelheid: 2000, korting: 1000, btw: 2100 })
  const u = reken({ uren: 0, uurtarief: 0, regels: [r], onvoorzien: 0, korting: 0 })
  expect(u.regels[0].verkoop).toBe(18000)
  expect(u.btw).toEqual([{ tarief: 2100, grondslag: 18000, btw: 3780 }])
  expect(schoonRegel({ ...r, korting: 20000 }).korting).toBe(10000)
  expect(schoonRegel({ ...r, korting: 0 }).korting).toBeUndefined()
})

test("mail: voornaam, onderwerp en een volledige link in een mailto", () => {
  expect(voornaamVan("Anna de Vries")).toBe("Anna")
  expect(voornaamVan("Clannad & Stijn")).toBe("Clannad & Stijn")
  const m = mailVoor("factuur", { naam: "Anna de Vries", nummer: "GR-F // 2026-1105-0001", pad: "/factuur/abc", bedrag: "€ 121,00" })
  expect(m.onderwerp).toBe("Factuur GR-F // 2026-1105-0001 van GRØNN Studio")
  expect(m.tekst).toMatch(/^Hoi Anna,/)
  expect(m.tekst).toContain("https://gronn.studio/factuur/abc")
  expect(m.tekst).toContain("€ 121,00")
  const href = mailtoLink("anna@voorbeeld.nl", m.onderwerp, m.tekst)
  expect(href.startsWith("mailto:anna@voorbeeld.nl?subject=")).toBe(true)
  expect(decodeURIComponent(href.split("body=")[1])).toBe(m.tekst)
  // Geen geldig adres: de mail opent toch, zonder ontvanger, en niets uit het veld komt in de link.
  expect(mailtoLink("geen adres?subject=x", "a", "b")).toBe("mailto:?subject=a&body=b")
})


test("documenten: offertes en facturen over alle klanten, met status, filter, som en CSV", () => {
  const k = (id: string, naam: string, stukken: object[]) => normaliseer({ id, naam, stukken } as never)
  const klanten = [
    k("a", "Anna", [
      { id: "1", soort: "Factuur", nummer: "2026-1001-01", bedrag: 100.1, datum: "2026-10-01" },
      { id: "2", soort: "Factuur", nummer: "2026-1101-01", bedrag: 0.2, datum: "2026-11-01" },
      { id: "3", soort: "Offerte", nummer: "OF-1", bedrag: 50, datum: "2026-10-02", rond: true },
    ]),
    k("c", "-1+Carla", [{ id: "5", soort: "Offerte", nummer: "OF-2", bedrag: 1, datum: "2026-01-01" }]),
    k("b", "=Bert", [{ id: "4", soort: "Factuur", nummer: "2025-1", bedrag: 10, datum: "2025-05-01", rond: true }]),
  ]
  const f = documentRijen(klanten, "Factuur", "2026-11-05")
  expect(f.map((r) => [r.stuk.nummer, r.status])).toEqual([["2026-1101-01", "Open"], ["2026-1001-01", "Te laat"], ["2025-1", "Betaald"]])
  expect(f[1].vervalt).toBe("2026-10-15")
  expect(documentRijen(klanten, "Offerte", "2026-11-05").map((r) => r.status)).toEqual(["Akkoord", "Open"])
  expect(filterRijen(f, { jaar: "2026" }).length).toBe(2)
  expect(filterRijen(f, { q: "bert" }).map((r) => r.stuk.nummer)).toEqual(["2025-1"])
  expect(filterRijen(f, { status: "Te laat" }).length).toBe(1)
  expect(somEuro(filterRijen(f, { jaar: "2026" }))).toBe(100.3)
  const csv = naarCsv(f)
  expect(csv.startsWith("\uFEFF\"Nummer\";")).toBe(true)
  expect(csv).toContain('"\'=Bert"')
  expect(csv).toContain('"100,10"')
  expect(naarCsv(documentRijen(klanten, "Offerte", "2026-11-05"))).toContain(`"'-1+Carla"`)
})

test("planbord: werkdagen per klus per week, vanaf de week van vandaag", () => {
  const d = (datum: string, href = "/k/a/calculatie/1") => ({ id: datum, datum, wie: "Anna", wat: "Anna: grondwerk", kleur: "#000", href })
  const bord = planbord([d("2026-11-04"), d("2026-11-05"), d("2026-11-10"), d("2026-10-01"), d("2026-11-12", "/k/b/calculatie/2")], "2026-11-05", 3)
  expect(bord.weken.map((w) => w.week)).toEqual([45, 46, 47])
  expect(bord.rijen.map((r) => r.dagen)).toEqual([[2, 1, 0], [0, 1, 0]])
  expect(bord.rijen[0].fasen).toEqual(["grondwerk"])
})
