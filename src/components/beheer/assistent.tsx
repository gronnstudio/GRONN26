"use client";

import { useEffect, useRef, useState } from "react";

// Praat met Grønn (spreek uit: greun). De browser zet spraak om in tekst
// (Chrome en Safari), /api/assistent vraagt het Claude, en het antwoord wordt
// voorgelezen met een Nederlandse stem van het apparaat. Typen kan altijd.
type Beurt = { rol: "nick" | "grønn"; tekst: string };
type Stand = "rust" | "luistert" | "denkt" | "praat";

type Herkenning = {
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  onerror: () => void;
  start: () => void;
  stop: () => void;
};

const zetStand = (s: Stand) => document.documentElement.setAttribute("data-assistent", s);

// Het gesprek blijft bewaard in deze browser, zodat herladen het niet wist.
// Eén tik stelt een vraag die vaak terugkomt.
const SNEL = ["Wat moet ik vandaag doen?", "Wat staat er open aan offertes?", "Wat is het dringendst?"];

// Op een klantkaart krijgt Grønn die klant mee (alleen het id; de server zoekt
// de gegevens zelf op en controleert de inlog), met eigen snelle vragen.
export function Assistent({ klantId, snel = SNEL }: { klantId?: string; snel?: string[] } = {}) {
  const KEY = klantId ? `gronn-assistent-${klantId}` : "gronn-assistent";
  const [beurten, setBeurten] = useState<Beurt[]>([]);
  const [tekst, setTekst] = useState("");
  const [stand, setStandState] = useState<Stand>("rust");
  const herkenning = useRef<Herkenning | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        setBeurten(JSON.parse(localStorage.getItem(KEY) || "[]"));
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, [KEY]);
  useEffect(() => {
    try {
      if (beurten.length) localStorage.setItem(KEY, JSON.stringify(beurten.slice(-20)));
      else localStorage.removeItem(KEY);
    } catch {}
  }, [beurten, KEY]);

  const stel = (s: Stand) => {
    setStandState(s);
    zetStand(s);
  };

  const spreek = (zin: string) => {
    if (!("speechSynthesis" in window)) return stel("rust");
    const u = new SpeechSynthesisUtterance(zin.replace(/Grønn/g, "Greun"));
    u.lang = "nl-NL";
    const stem = speechSynthesis.getVoices().find((v) => v.lang.startsWith("nl"));
    if (stem) u.voice = stem;
    u.onend = () => stel("rust");
    stel("praat");
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  };

  const vraag = async (v: string) => {
    if (!v.trim()) return;
    const eerder = beurten;
    setBeurten([...eerder, { rol: "nick", tekst: v }]);
    setTekst("");
    stel("denkt");
    try {
      const r = await fetch("/api/assistent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vraag: v, eerder, klantId }),
      });
      const { antwoord } = (await r.json()) as { antwoord: string };
      setBeurten((b) => [...b, { rol: "grønn", tekst: antwoord }]);
      spreek(antwoord);
    } catch {
      setBeurten((b) => [...b, { rol: "grønn", tekst: "Ik kan de server niet bereiken." }]);
      stel("rust");
    }
  };

  const luister = () => {
    if (stand === "luistert") return herkenning.current?.stop();
    const W = window as unknown as { SpeechRecognition?: new () => Herkenning; webkitSpeechRecognition?: new () => Herkenning };
    const Klasse = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!Klasse) {
      setBeurten((b) => [...b, { rol: "grønn", tekst: "Spraak werkt in deze browser niet; typ je vraag maar." }]);
      return;
    }
    speechSynthesis?.cancel();
    const h = new Klasse();
    h.lang = "nl-NL";
    h.interimResults = false;
    let gehoord = "";
    h.onresult = (e) => {
      gehoord = Array.from(e.results).map((r) => r[0].transcript).join(" ");
    };
    h.onend = () => (gehoord ? vraag(gehoord) : stel("rust"));
    h.onerror = () => stel("rust");
    herkenning.current = h;
    stel("luistert");
    h.start();
  };

  const label = { rust: "Praat met Grønn", luistert: "Ik luister…", denkt: "Even denken…", praat: "Grønn praat" }[stand];

  return (
    <section aria-label="Gesprek met Grønn" className="flex min-h-full flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={luister}
          aria-label={stand === "luistert" ? "Stop met luisteren" : "Spreek een vraag in"}
          className={`grid size-[44px] shrink-0 cursor-pointer place-items-center rounded-full transition-colors ${stand === "luistert" ? "bg-let text-grond" : "bg-accent text-op-accent"}`}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <rect x="7" y="2.5" width="6" height="10" rx="3" />
            <path d="M4 9.5a6 6 0 0 0 12 0M10 15.5v2.5" />
          </svg>
        </button>
        <p className="m-0 flex-1 font-semibold" aria-live="polite">{label}</p>
        {beurten.length > 0 && (
          <button type="button" onClick={() => setBeurten([])} className="crm-knop-stil crm-knop-klein">
            Wis gesprek
          </button>
        )}
      </div>
      {beurten.length > 0 && (
        <ol className="m-0 flex list-none flex-col gap-3 p-0 text-[14px] leading-[1.55]">
          {beurten.map((b, i) => (
            <li key={i} className={b.rol === "nick" ? "self-end rounded-[12px] bg-accent/10 px-3 py-2" : "whitespace-pre-line"}>
              {b.tekst}
            </li>
          ))}
          {stand === "denkt" && <li className="text-gedempt">Grønn denkt na…</li>}
        </ol>
      )}
      {beurten.length === 0 && (
        <div className="grid gap-1.5">
          <p className="crm-label m-0">Vaak gevraagd</p>
          {snel.map((v) => (
            <button key={v} type="button" onClick={() => vraag(v)} className="cursor-pointer rounded-[8px] border border-lijn bg-grond px-3 py-2 text-left text-[13px] hover:border-accent">
              {v}
            </button>
          ))}
        </div>
      )}
      <form
        className="sticky bottom-0 mt-auto flex gap-2 bg-vlak pt-2"
        onSubmit={(e) => {
          e.preventDefault();
          vraag(tekst);
        }}
      >
        <input
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          placeholder="Vraag iets aan Grønn…"
          aria-label="Vraag aan Grønn"
          className="crm-veld flex-1"
        />
        <button type="submit" className="crm-knop">Vraag</button>
      </form>
      <p className="m-0 text-[11px] text-gedempt">Grønn leest je klanten en calculaties, zonder telefoon of e-mail. Grønn wijzigt niets zelf.</p>
    </section>
  );
}
