"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BUSINESS } from "@/lib/business";
import { euro } from "@/lib/format";

// De offertemaker: links invullen, rechts staat de offerte zoals hij geprint
// wordt. Printen (of "Opslaan als PDF") laat alleen de offerte zien. Het concept
// blijft in deze browser bewaard; er gaat niets naar een server.
// inkoop en uren zijn intern: ze staan nooit op de offerte, alleen op het GR-N-overzicht.
type Regel = { titel: string; tekst: string; aantal: number; prijs: number; btw: number; inkoop?: number; uren?: number };
type Offerte = {
  nummer: string;
  datum: string;
  geldig: string;
  klant: string;
  adres: string;
  titel: string;
  intro: string;
  regels: Regel[];
  termijnen: boolean;
  slot: string;
};

const KEY = "gronn-offerte-concept";
// Posten die vaak terugkomen, bewaard in deze browser; kies ze bij de titel van een post.
const BIEB = "gronn-offerte-posten";
const vandaag = () => new Date().toISOString().slice(0, 10);
const plusDagen = (d: string, n: number) => {
  const t = new Date(d);
  t.setDate(t.getDate() + n);
  return t.toISOString().slice(0, 10);
};
const nieuw = (): Offerte => {
  const d = vandaag();
  return {
    nummer: `GR-O // ${d.slice(0, 4)}-${d.slice(5, 7)}${d.slice(8, 10)}-01`,
    datum: d,
    geldig: plusDagen(d, 30),
    klant: "",
    adres: "",
    titel: "",
    intro: "",
    regels: [{ titel: "", tekst: "", aantal: 1, prijs: 0, btw: 21 }],
    termijnen: false,
    slot:
      "Akkoord? Een bevestiging per mail of app is voldoende, dan plan ik een datum in. Op al onze werkzaamheden zijn onze algemene voorwaarden van toepassing.",
  };
};
const datumNL = (d: string) =>
  d ? new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }) : "";
const rond = (n: number) => Math.round(n * 100) / 100;

export function OfferteMaker() {
  const [o, setO] = useState<Offerte>(nieuw);
  const [geladen, setGeladen] = useState(false);
  const [intern, setIntern] = useState(false);
  const [bieb, setBieb] = useState<Regel[]>([]);
  const [bewaard, setBewaard] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const bewaard = localStorage.getItem(KEY);
        if (bewaard) setO({ ...nieuw(), ...JSON.parse(bewaard) });
        setBieb(JSON.parse(localStorage.getItem(BIEB) || "[]"));
      } catch {}
      setGeladen(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!geladen) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(o));
    } catch {}
  }, [o, geladen]);

  const zet = <K extends keyof Offerte>(k: K, v: Offerte[K]) => setO((x) => ({ ...x, [k]: v }));
  const bewaarPost = (i: number) => {
    const post = o.regels[i];
    if (!post.titel.trim()) return;
    const lijst = [...bieb.filter((b) => b.titel !== post.titel), { ...post, aantal: 1 }].sort((a, b) =>
      a.titel.localeCompare(b.titel, "nl"),
    );
    setBieb(lijst);
    try {
      localStorage.setItem(BIEB, JSON.stringify(lijst));
    } catch {}
    setBewaard(i);
    setTimeout(() => setBewaard(null), 1500);
  };
  const kiesTitel = (i: number, titel: string) => {
    const uitBieb = bieb.find((b) => b.titel === titel);
    zetRegel(i, uitBieb ? { ...uitBieb, aantal: o.regels[i].aantal } : { titel });
  };
  const zetRegel = (i: number, r: Partial<Regel>) =>
    setO((x) => ({ ...x, regels: x.regels.map((y, j) => (j === i ? { ...y, ...r } : y)) }));
  const verplaats = (i: number, d: number) =>
    setO((x) => {
      const r = [...x.regels];
      const j = i + d;
      if (j < 0 || j >= r.length) return x;
      [r[i], r[j]] = [r[j], r[i]];
      return { ...x, regels: r };
    });

  const subtotaal = rond(o.regels.reduce((s, r) => s + r.aantal * r.prijs, 0));
  const tarieven = [...new Set(o.regels.map((r) => r.btw))].sort((a, b) => b - a);
  const btw = tarieven.map((t) => ({
    t,
    bedrag: rond(o.regels.filter((r) => r.btw === t).reduce((s, r) => s + r.aantal * r.prijs, 0) * (t / 100)),
  }));
  const totaal = rond(subtotaal + btw.reduce((s, b) => s + b.bedrag, 0));
  const t1 = rond(totaal * 0.5);
  const t2 = rond(totaal * 0.3);
  const t3 = rond(totaal - t1 - t2);

  const omzet = (r: Regel) => rond(r.aantal * r.prijs);
  const inkoop = rond(o.regels.reduce((s, r) => s + (r.inkoop || 0), 0));
  const uren = o.regels.reduce((s, r) => s + (r.uren || 0), 0);
  const over = rond(subtotaal - inkoop);
  const internNummer = o.nummer.replace(/^GR-O/, "GR-N");

  const veld = "w-full rounded-xl border border-lijn bg-grond px-3 py-2 text-[14px] text-inkt";

  return (
    <div className="offertes grid min-h-svh gap-8 bg-grond p-4 text-inkt lg:grid-cols-[420px_1fr] lg:p-8">
      <form data-geen-print className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        <div className="flex justify-between text-[13px]">
          <Link href="/" className="w-lijnlink text-gedempt">← Terug naar de site</Link>
          <a href="/api/uitloggen" className="w-lijnlink text-gedempt">Uitloggen</a>
        </div>
        <div>
          <p className="lbl m-0 text-oranje-tekst">GRØNN · offertes</p>
          <h1 className="syne m-0 text-[32px] tracking-[-.02em]">Offerte maken</h1>
          <p className="m-0 mt-1 text-[13px] text-gedempt">
            Bedragen per regel excl. btw. Het concept blijft in deze browser bewaard.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Label t="Offertenummer" className="col-span-2">
            <input className={veld} value={o.nummer} onChange={(e) => zet("nummer", e.target.value)} />
          </Label>
          <Label t="Datum">
            <input type="date" className={veld} value={o.datum} onChange={(e) => zet("datum", e.target.value)} />
          </Label>
          <Label t="Geldig tot">
            <input type="date" className={veld} value={o.geldig} onChange={(e) => zet("geldig", e.target.value)} />
          </Label>
          <Label t="Klant" className="col-span-2">
            <input className={veld} value={o.klant} onChange={(e) => zet("klant", e.target.value)} />
          </Label>
          <Label t="Adres" className="col-span-2">
            <input className={veld} value={o.adres} onChange={(e) => zet("adres", e.target.value)} />
          </Label>
          <Label t="Titel" className="col-span-2">
            <input
              className={veld}
              placeholder="Achtertuin, vijverrenovatie…"
              value={o.titel}
              onChange={(e) => zet("titel", e.target.value)}
            />
          </Label>
          <Label t="Omschrijving" className="col-span-2">
            <textarea rows={3} className={veld} value={o.intro} onChange={(e) => zet("intro", e.target.value)} />
          </Label>
        </div>

        <datalist id="offerte-posten">
          {bieb.map((b) => (
            <option key={b.titel} value={b.titel} />
          ))}
        </datalist>
        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
          <legend className="lbl mb-2 p-0 text-gedempt">Posten</legend>
          {o.regels.map((r, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-2xl border border-lijn p-3">
              <div className="flex gap-2">
                <input
                  className={veld}
                  list="offerte-posten"
                  placeholder={bieb.length ? `Post ${i + 1}: typ of kies een bewaarde post` : `Post ${i + 1}`}
                  aria-label={`Post ${i + 1}: titel`}
                  value={r.titel}
                  onChange={(e) => kiesTitel(i, e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => bewaarPost(i)}
                  title="Post bewaren om later te hergebruiken"
                  aria-label={`Post ${i + 1} bewaren`}
                  className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-lijn text-inkt"
                >
                  {bewaard === i ? (
                    <span aria-hidden>✓</span>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
                      <path d="M3 2.5h8l2.5 2.5v8.5H3z" />
                      <path d="M5.5 2.5v3.5h5V2.5M5.5 13.5V9.5h5v4" />
                    </svg>
                  )}
                </button>
              </div>
              <textarea
                rows={2}
                className={veld}
                placeholder="Wat erbij hoort"
                aria-label={`Post ${i + 1}: toelichting`}
                value={r.tekst}
                onChange={(e) => zetRegel(i, { tekst: e.target.value })}
              />
              <div className="grid grid-cols-[1fr_1.4fr_1fr] gap-2">
                <Label t="Aantal">
                  <input
                    type="number"
                    step="any"
                    className={veld}
                    value={r.aantal}
                    onChange={(e) => zetRegel(i, { aantal: Number(e.target.value) })}
                  />
                </Label>
                <Label t="Prijs excl. btw">
                  <input
                    type="number"
                    step="0.01"
                    className={veld}
                    value={r.prijs}
                    onChange={(e) => zetRegel(i, { prijs: Number(e.target.value) })}
                  />
                </Label>
                <Label t="Btw">
                  <select className={veld} value={r.btw} onChange={(e) => zetRegel(i, { btw: Number(e.target.value) })}>
                    <option value={21}>21%</option>
                    <option value={9}>9%</option>
                    <option value={0}>0%</option>
                  </select>
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Label t="Inkoop excl. btw (intern)">
                  <input
                    type="number"
                    step="0.01"
                    className={veld}
                    value={r.inkoop ?? 0}
                    onChange={(e) => zetRegel(i, { inkoop: Number(e.target.value) })}
                  />
                </Label>
                <Label t="Uren (intern)">
                  <input
                    type="number"
                    step="0.5"
                    className={veld}
                    value={r.uren ?? 0}
                    onChange={(e) => zetRegel(i, { uren: Number(e.target.value) })}
                  />
                </Label>
              </div>
              <div className="flex gap-2 text-[13px]">
                <Knop onClick={() => verplaats(i, -1)}>Omhoog</Knop>
                <Knop onClick={() => verplaats(i, 1)}>Omlaag</Knop>
                <Knop onClick={() => zet("regels", o.regels.filter((_, j) => j !== i))}>Weghalen</Knop>
              </div>
            </div>
          ))}
          <Knop onClick={() => zet("regels", [...o.regels, { titel: "", tekst: "", aantal: 1, prijs: 0, btw: 21 }])}>
            + Post toevoegen
          </Knop>
        </fieldset>

        <label className="flex items-center gap-2 text-[14px]">
          <input type="checkbox" checked={o.termijnen} onChange={(e) => zet("termijnen", e.target.checked)} />
          Betalen in termijnen (50 · 30 · 20 %)
        </label>
        <Label t="Afsluiting">
          <textarea rows={3} className={veld} value={o.slot} onChange={(e) => zet("slot", e.target.value)} />
        </Label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="cursor-pointer rounded-full bg-oranje px-5 py-3 text-[14px] font-semibold text-[#202020]"
          >
            {intern ? "Intern overzicht printen" : "Offerte printen of opslaan als PDF"}
          </button>
          {/* Alle vaste bijlagen voor een particulier in één zip (public/documenten). */}
          <a
            href="/documenten/GRONN-bijlagen-particulier.zip"
            download
            className="cursor-pointer rounded-full border border-lijn px-3 py-1.5 text-inkt"
          >
            Bijlagen downloaden (zip)
          </a>
          <Knop onClick={() => setIntern(!intern)}>{intern ? "Terug naar de offerte" : "Wat houd ik over? (GR-N)"}</Knop>
          <Knop
            onClick={() => {
              if (confirm("Een lege offerte beginnen? Het huidige concept gaat verloren.")) setO(nieuw());
            }}
          >
            Nieuwe offerte
          </Knop>
        </div>
      </form>

      {intern ? (
        <article className="offerte-blad mx-auto w-full max-w-[794px] overflow-hidden rounded-2xl bg-white text-[13px] leading-[1.55] text-[#202020] shadow-xl">
          <header className="rounded-b-[22px] bg-[#202020] px-10 pb-8 pt-10 text-[#EFEEEA]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/woordmerk-primair.svg" alt="GRØNN Studio" className="h-[30px] w-auto" />
            <p className="lbl m-0 mt-12 text-[#DB6923]">Intern overzicht · niet meesturen</p>
            <h2 className="syne m-0 mt-1 text-[40px] leading-[1.05] tracking-[-.02em]">Wat ik overhoud</h2>
            <p className="m-0 mt-2 opacity-80">
              {[o.titel, o.klant].filter(Boolean).join(" · ")} · bij offerte {o.nummer}
            </p>
            <p className="m-0 mt-6 font-semibold">{internNummer}</p>
          </header>
          <div className="px-10 pb-10 pt-6">
            <div className="grid grid-cols-4 gap-2">
              {[
                ["Omzet ex btw", euro(subtotaal)],
                ["Inkoop ex btw", euro(inkoop)],
                ["Over", euro(over)],
                ["Per uur", uren ? euro(rond(over / uren)) : "—"],
              ].map(([k, v], j) => (
                <div key={k} className="rounded-[14px] bg-[#EFEEEA] px-4 py-3">
                  <span className="lbl text-[#5c5b57]">{k}</span>
                  <b className={`syne mt-1 block text-[18px] ${j === 2 ? "text-[#A14312]" : ""}`}>{v}</b>
                </div>
              ))}
            </div>
            <table className="mt-6 w-full border-separate border-spacing-y-1.5 text-[12px]">
              <thead>
                <tr className="lbl text-left text-[#5c5b57]">
                  <th className="px-3">Post</th>
                  <th className="px-3 text-right">Omzet</th>
                  <th className="px-3 text-right">Inkoop</th>
                  <th className="px-3 text-right">Uur</th>
                  <th className="px-3 text-right">Over</th>
                </tr>
              </thead>
              <tbody>
                {o.regels.map((r, j) => (
                  <tr key={j} className="bg-[#EFEEEA]">
                    <td className="rounded-l-[12px] px-3 py-2 font-semibold">
                      {String(j + 1).padStart(2, "0")} · {r.titel || "Post"}
                    </td>
                    <td className="px-3 text-right">{euro(omzet(r))}</td>
                    <td className="px-3 text-right">{euro(r.inkoop || 0)}</td>
                    <td className="px-3 text-right">{r.uren || "–"}</td>
                    <td className="rounded-r-[12px] px-3 text-right font-semibold">{euro(rond(omzet(r) - (r.inkoop || 0)))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="m-0 mt-6 text-[11px] text-[#5c5b57]">
              Alles ex btw. &quot;Over&quot; is vóór inkomstenbelasting en vaste kosten (bus, gereedschap, verzekering).
            </p>
          </div>
        </article>
      ) : (
      /* De offerte zelf: altijd licht, zoals hij op papier staat. */
      <article className="offerte-blad mx-auto w-full max-w-[794px] overflow-hidden rounded-2xl bg-white text-[13px] leading-[1.55] text-[#202020] shadow-xl">
        <header className="rounded-b-[22px] bg-[#202020] px-10 pb-8 pt-10 text-[#EFEEEA]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/woordmerk-primair.svg" alt="GRØNN Studio" className="h-[30px] w-auto" />
          <p className="lbl m-0 mt-12 text-[#DB6923]">Offerte</p>
          <h2 className="syne m-0 mt-1 text-[40px] leading-[1.05] tracking-[-.02em]">{o.titel || "Titel"}</h2>
          <p className="m-0 mt-2 opacity-80">{[o.klant, o.adres].filter(Boolean).join(" · ")}</p>
          <dl className="m-0 mt-8 grid grid-cols-3 gap-3">
            {[
              ["Offertenummer", o.nummer],
              ["Datum", datumNL(o.datum)],
              ["Geldig tot", datumNL(o.geldig)],
            ].map(([k, v]) => (
              <div key={k} className="border-t border-white/20 pt-2">
                <dt className="lbl opacity-60">{k}</dt>
                <dd className="m-0 mt-1 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </header>
        <div className="px-10 pb-10 pt-6">
          {o.intro && <p className="m-0 mb-6 whitespace-pre-line">{o.intro}</p>}
          <h3 className="kop-stip syne m-0 mb-3 text-[17px]">Werkzaamheden en prijs</h3>
          <ol className="m-0 flex list-none flex-col gap-1.5 p-0">
            {o.regels.map((r, i) => (
              <li key={i} className="flex break-inside-avoid justify-between gap-6 rounded-[14px] bg-[#EFEEEA] px-4 py-3">
                <div>
                  <b className="syne text-[14px]">
                    {String(i + 1).padStart(2, "0")} · {r.titel || "Post"}
                  </b>
                  {r.tekst && <span className="mt-0.5 block whitespace-pre-line text-[12px] text-[#5c5b57]">{r.tekst}</span>}
                </div>
                <div className="shrink-0 text-right font-semibold">
                  {euro(rond(r.aantal * r.prijs))}
                  {r.aantal !== 1 && (
                    <span className="block text-[11px] font-normal text-[#5c5b57]">
                      {r.aantal} × {euro(r.prijs)}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-3 flex flex-col gap-1 px-4">
            <Rij k="Subtotaal excl. btw" v={euro(subtotaal)} />
            {btw.map((b) => (
              <Rij key={b.t} k={`Btw ${b.t}%`} v={euro(b.bedrag)} />
            ))}
          </div>
          <div className="mt-3 flex break-inside-avoid justify-between rounded-[14px] bg-[#202020] px-4 py-4 text-[18px] text-[#EFEEEA]">
            <span className="syne">Totaal incl. btw</span>
            <span className="syne text-[#DB6923]">{euro(totaal)}</span>
          </div>
          {o.termijnen && (
            <>
              <h3 className="kop-stip syne m-0 mb-2 mt-8 text-[17px]">Betaling</h3>
              <p className="m-0">
                50% bij opdrachtbevestiging · 30% halverwege het werk · 20% bij oplevering: {euro(t1)} · {euro(t2)} ·{" "}
                {euro(t3)}.
              </p>
            </>
          )}
          {o.slot && <p className="m-0 mt-8 whitespace-pre-line">{o.slot}</p>}
          <p className="m-0 mt-10 border-t border-[#d9d7d0] pt-4 text-[10px] text-[#5c5b57]">
            {BUSINESS.name} · {BUSINESS.address.street}, {BUSINESS.address.postalCode} {BUSINESS.address.city} ·{" "}
            {BUSINESS.phone} · {BUSINESS.email} · KvK {BUSINESS.kvk} · Btw {BUSINESS.btw}
          </p>
        </div>
      </article>
      )}
    </div>
  );
}

function Label({ t, className = "", children }: { t: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 text-[12px] text-gedempt ${className}`}>
      {t}
      {children}
    </label>
  );
}

function Knop({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="cursor-pointer rounded-full border border-lijn px-3 py-1.5 text-inkt">
      {children}
    </button>
  );
}

function Rij({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span>{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}
