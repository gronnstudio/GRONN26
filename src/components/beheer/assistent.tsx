"use client";

import { useRef, useState } from "react";

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

export function Assistent() {
  const [beurten, setBeurten] = useState<Beurt[]>([]);
  const [tekst, setTekst] = useState("");
  const [stand, setStandState] = useState<Stand>("rust");
  const herkenning = useRef<Herkenning | null>(null);

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
    <section className="rounded-[22px] border border-white/10 bg-white/[.03] p-5">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={luister}
          aria-label={stand === "luistert" ? "Stop met luisteren" : "Spreek een vraag in"}
          className={`grid size-14 shrink-0 cursor-pointer place-items-center rounded-full transition-colors ${stand === "luistert" ? "bg-[#DB6923] text-[#202020]" : "bg-[#EFEEEA] text-[#202020]"}`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <rect x="7" y="2.5" width="6" height="10" rx="3" />
            <path d="M4 9.5a6 6 0 0 0 12 0M10 15.5v2.5" />
          </svg>
        </button>
        <div>
          <p className="m-0 text-[10px] font-semibold uppercase tracking-[.18em] text-[#DB6923]">Assistent</p>
          <p className="syne m-0 text-[20px]">{label}</p>
        </div>
      </div>
      {beurten.length > 0 && (
        <ol className="m-0 mt-4 flex max-h-64 list-none flex-col gap-2 overflow-y-auto p-0 text-[14px]">
          {beurten.map((b, i) => (
            <li key={i} className={b.rol === "nick" ? "self-end rounded-[14px] bg-white/10 px-3 py-2" : "opacity-90"}>
              {b.tekst}
            </li>
          ))}
        </ol>
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
          className="min-w-0 flex-1 rounded-full border border-white/15 bg-transparent px-4 py-2.5 text-[14px] text-[#EFEEEA] placeholder:text-white/40"
        />
        <button type="submit" className="cursor-pointer rounded-full border border-white/20 px-4 text-[14px]">Vraag</button>
      </form>
    </section>
  );
}
