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
const KEY = "gronn-assistent";
// Eén tik stelt een vraag die vaak terugkomt.
const SNEL = ["Wat moet ik vandaag doen?", "Wat staat er open aan offertes?", "Wat is het dringendst?"];

export function Assistent() {
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
  }, []);
  useEffect(() => {
    try {
      if (beurten.length) localStorage.setItem(KEY, JSON.stringify(beurten.slice(-20)));
      else localStorage.removeItem(KEY);
    } catch {}
  }, [beurten]);

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
        body: JSON.stringify({ vraag: v, eerder }),
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
    <section className="rounded-[22px] border border-lijn bg-inkt/[.03] p-5">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={luister}
          aria-label={stand === "luistert" ? "Stop met luisteren" : "Spreek een vraag in"}
          className={`grid size-14 shrink-0 cursor-pointer place-items-center rounded-full transition-colors ${stand === "luistert" ? "bg-oranje text-antraciet" : "bg-inkt text-grond"}`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <rect x="7" y="2.5" width="6" height="10" rx="3" />
            <path d="M4 9.5a6 6 0 0 0 12 0M10 15.5v2.5" />
          </svg>
        </button>
        <div className="flex-1">
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[.18em] text-oranje-tekst">Assistent</p>
          <p className="syne m-0 text-[20px]">{label}</p>
        </div>
        {beurten.length > 0 && (
          <button type="button" onClick={() => setBeurten([])} className="cursor-pointer self-start text-[12px] opacity-60 hover:opacity-100">
            Wis gesprek
          </button>
        )}
      </div>
      {beurten.length > 0 && (
        <ol className="m-0 mt-4 flex max-h-64 list-none flex-col gap-2 overflow-y-auto p-0 text-[14px]">
          {beurten.map((b, i) => (
            <li key={i} className={b.rol === "nick" ? "self-end rounded-[14px] bg-inkt/10 px-3 py-2" : "opacity-90"}>
              {b.tekst}
            </li>
          ))}
        </ol>
      )}
      {beurten.length === 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SNEL.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => vraag(v)}
              className="cursor-pointer rounded-full border border-lijn px-3 py-1.5 text-[12px] hover:border-oranje"
            >
              {v}
            </button>
          ))}
        </div>
      )}
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          vraag(tekst);
        }}
      >
        <input
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          placeholder="Of typ: wat moet ik vandaag doen?"
          aria-label="Vraag aan Grønn"
          className="min-w-0 flex-1 rounded-full border border-lijn bg-transparent px-4 py-2.5 text-[14px] text-inkt placeholder:text-gedempt"
        />
        <button type="submit" className="cursor-pointer rounded-full border border-lijn px-4 text-[14px]">Vraag</button>
      </form>
    </section>
  );
}
