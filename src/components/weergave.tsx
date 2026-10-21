"use client";

import { useEffect, useState } from "react";
import { T, type Tekst } from "@/components/taal";
import { useMuziek, zetMuziek } from "@/components/muziek";

// WF-026: Kleur (Auto · Licht · Donker;
// Auto = de instelling van het toestel) en Toegankelijkheid. Bewaard in deze
// browser; het voorverf-script in layout.tsx past het toe vóór de eerste verf.
type Stand = {
  kleur: "auto" | "licht" | "donker";
  taal: "nl" | "en";
  beweging: boolean;
  groot: boolean;
  contrast: boolean;
  onderstreep: boolean;
  /** Lettertoetsen als sneltoets (zoek.tsx); WCAG 2.1.4 wil ze uit kunnen zetten. */
  toetsen: boolean;
};
const KEY = "gronn-weergave";
const STANDAARD: Stand = {
  kleur: "auto",
  taal: "nl",
  beweging: false,
  groot: false,
  contrast: false,
  onderstreep: false,
  toetsen: true,
};
const KLEUREN: Record<Stand["kleur"], Tekst> = {
  auto: "Auto",
  licht: { nl: "Licht", en: "Light" },
  donker: { nl: "Donker", en: "Dark" },
};
const SCHAKELAARS: [keyof Omit<Stand, "kleur" | "taal">, Tekst][] = [
  ["beweging", { nl: "Minder beweging", en: "Less motion" }],
  ["groot", { nl: "Grotere tekst", en: "Larger text" }],
  ["contrast", { nl: "Meer contrast", en: "More contrast" }],
  ["onderstreep", { nl: "Links onderstrepen", en: "Underline links" }],
  ["toetsen", { nl: "Sneltoetsen", en: "Keyboard shortcuts" }],
];

function pasToe(s: Stand) {
  const c = document.documentElement.classList;
  // Auto volgt de instelling van het toestel, zoals Apple en Material het
  // voorschrijven (eigenaar, 11 okt 2026), niet meer de klok.
  c.toggle(
    "donker",
    s.kleur === "donker" || (s.kleur === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches),
  );
  c.toggle("stil", s.beweging);
  c.toggle("groot", s.groot);
  c.toggle("contrast", s.contrast);
  c.toggle("onderstreep", s.onderstreep);
  c.toggle("en", s.taal === "en");
  document.documentElement.lang = s.taal;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

// Sinds 18 okt 2026 geen eigen knop en paneel meer: de instellingen staan in
// het hamburgermenu (eigenaar: "hierin breng je alles onder wat in menu niet
// staat zoals weergave"). De muziek zelf staat in muziek.tsx.
export function Instellingen() {
  const [stand, setStand] = useState<Stand>(STANDAARD);
  const speelt = useMuziek();

  // Bewaarde stand ophalen ná de eerste render (hydration-veilig).
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        setStand({
          ...STANDAARD,
          ...JSON.parse(localStorage.getItem(KEY) || "{}"),
        });
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, []);
  // Zet iemand zijn toestel tijdens het bezoek op licht of donker, dan volgt
  // Auto meteen.
  useEffect(() => {
    if (stand.kleur !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const volg = () => document.documentElement.classList.toggle("donker", mq.matches);
    mq.addEventListener("change", volg);
    return () => mq.removeEventListener("change", volg);
  }, [stand.kleur]);

  const zet = (s: Stand) => {
    setStand(s);
    pasToe(s);
  };

  return (
    <div className="text-sm lg:grid lg:grid-cols-[1fr_1fr_2fr] lg:items-start lg:gap-x-10">
      <fieldset className="m-0 mb-4 border-0 p-0">
        <legend className="lbl mb-2.5 p-0 opacity-70">
          <T t={{ nl: "Taal", en: "Language" }} />
        </legend>
        <div className="grid grid-cols-2 rounded-full border border-lijn p-[3px]">
          {([["nl", "Nederlands"], ["en", "English"]] as const).map(([k, naam]) => (
            <label
              key={k}
              lang={k}
              className="relative flex cursor-pointer items-center justify-center rounded-full py-2 text-center text-[13px] font-medium has-checked:bg-inkt has-checked:text-grond has-focus-visible:outline-2"
            >
              <input
                type="radio"
                name="taal"
                value={k}
                checked={stand.taal === k}
                onChange={() => zet({ ...stand, taal: k })}
                className="sr-only"
              />
              <span className="inline-flex items-center justify-center gap-2">
                <Vlag taal={k} />
                {naam}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="m-0 mb-4 border-0 p-0">
        <legend className="lbl mb-2.5 p-0 opacity-70"><T t={{ nl: "Kleur", en: "Colour" }} /></legend>
        <div className="grid grid-cols-3 rounded-full border border-lijn p-[3px]">
          {(["auto", "licht", "donker"] as const).map((k) => (
            <label
              key={k}
              className="cursor-pointer rounded-full py-2 text-center text-[13px] font-medium has-checked:bg-inkt has-checked:text-grond has-focus-visible:outline-2"
            >
              <input
                type="radio"
                name="kleur"
                value={k}
                checked={stand.kleur === k}
                onChange={() => zet({ ...stand, kleur: k })}
                className="sr-only"
              />
              <T t={KLEUREN[k]} />
            </label>
          ))}
        </div>
        <p className="mt-2 mb-0 text-xs opacity-70">
          <T t={{ nl: "Auto: volgt de instelling van je telefoon of computer.", en: "Auto: follows your phone or computer setting." }} />
        </p>
      </fieldset>
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
      <label data-muziek className="flex cursor-pointer items-center justify-between gap-3 border-t border-lijn py-2.5">
        <span><T t={{ nl: "Muziek", en: "Music" }} /></span>
        <input
          type="checkbox"
          role="switch"
          checked={speelt}
          onChange={(e) => zetMuziek(e.target.checked)}
          className="size-5 cursor-pointer accent-[var(--inkt)]"
        />
      </label>
      {SCHAKELAARS.map(([k, t]) => (
        <label
          key={k}
          className="flex cursor-pointer items-center justify-between gap-3 border-t border-lijn py-2.5"
        >
          <span><T t={t} /></span>
          <input
            type="checkbox"
            role="switch"
            checked={stand[k]}
            onChange={(e) => zet({ ...stand, [k]: e.target.checked })}
            className="size-5 cursor-pointer accent-[var(--inkt)]"
          />
        </label>
      ))}
      <button
        type="button"
        onClick={() => {
          zet(STANDAARD);
          zetMuziek(true);
        }}
        className="lbl mt-3 w-fit cursor-pointer self-start border-0 border-b border-current bg-transparent p-0 text-inherit lg:col-start-2 lg:mt-4"
      >
        <T t={{ nl: "Standaard herstellen", en: "Restore defaults" }} />
      </button>
      </div>
    </div>
  );
}

/** Twee ronde vlagjes voor de taalkeuze (eigenaar, 5 okt 2026). Puur versiering. */
function Vlag({ taal }: { taal: "nl" | "en" }) {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" className="shrink-0 rounded-full ring-1 ring-black/10">
      <clipPath id={`vlag-${taal}`}>
        <circle cx="10" cy="10" r="10" />
      </clipPath>
      {taal === "nl" ? (
        <g clipPath="url(#vlag-nl)">
          <rect width="20" height="7" fill="#AE1C28" />
          <rect y="6.67" width="20" height="6.67" fill="#fff" />
          <rect y="13.33" width="20" height="6.67" fill="#21468B" />
        </g>
      ) : (
        <g clipPath="url(#vlag-en)">
          <rect width="20" height="20" fill="#012169" />
          <path d="M0 0L20 20M20 0L0 20" stroke="#fff" strokeWidth="4" />
          <path d="M0 0L20 20M20 0L0 20" stroke="#C8102E" strokeWidth="1.5" />
          <path d="M10 0V20M0 10H20" stroke="#fff" strokeWidth="6" />
          <path d="M10 0V20M0 10H20" stroke="#C8102E" strokeWidth="3.4" />
        </g>
      )}
    </svg>
  )
}
