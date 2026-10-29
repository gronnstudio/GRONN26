import { expect, test } from "@playwright/test"
import { deel, leesCenten, leesMilli, plusProcent, toonDecimaal, toonEuro, verdeel } from "../src/lib/crm/geld"
import { margeUitOpslag, nieuweRegel, opslagUitMarge, reken, schoonRegel, tekort, wegzetten } from "../src/lib/crm/calculatie"
import * as h from "../src/lib/crm/rekenhulpen"
import { zetPrijs, nieuwItem, voorClaude, zoekItems } from "../src/lib/crm/catalogus"
import { importeer, leesCsv } from "../src/lib/crm/catalogus-import"
import { opdracht, schoonBevindingen } from "../src/lib/crm/ai/beeld"
import { normaliseer, zoekDubbel } from "../src/lib/crm/klant"
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

