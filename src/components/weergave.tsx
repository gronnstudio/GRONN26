"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toon } from "@/lib/geluid";
import { T, type Tekst } from "@/components/taal";
import { useTaal } from "@/components/taal-klant";

// WF-026: één knop met een regelaar-icoon opent Kleur (Auto · Licht · Donker;
// Auto = licht van 07.00 tot 19.00) en Toegankelijkheid. Bewaard in deze
// browser; het voorverf-script in layout.tsx past het toe vóór de eerste verf.
type Stand = {
  kleur: "auto" | "licht" | "donker";
  taal: "nl" | "en";
  beweging: boolean;
  groot: boolean;
  contrast: boolean;
  onderstreep: boolean;
  geluid: boolean;
};
const KEY = "gronn-weergave";
const STANDAARD: Stand = {
  kleur: "auto",
  taal: "nl",
  beweging: false,
  groot: false,
  contrast: false,
  onderstreep: false,
  geluid: false,
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
  ["geluid", { nl: "Geluid bij het doek", en: "Sound with the curtain" }],
];

function pasToe(s: Stand) {
  const u = new Date().getHours();
  const c = document.documentElement.classList;
  c.toggle(
    "donker",
    s.kleur === "donker" || (s.kleur === "auto" && (u < 7 || u >= 19)),
  );
  c.toggle("stil", s.beweging);
  c.toggle("groot", s.groot);
  c.toggle("contrast", s.contrast);
  c.toggle("onderstreep", s.onderstreep);
  c.toggle("geluid", s.geluid);
  c.toggle("en", s.taal === "en");
  document.documentElement.lang = s.taal;
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export function Weergave({ knopKlasse = "" }: { knopKlasse?: string }) {
  const [open, setOpen] = useState(false);
  const taal = useTaal();
  const [gereed, setGereed] = useState(false);
  const [stand, setStand] = useState<Stand>(STANDAARD);
  const paneel = useRef<HTMLDivElement>(null);
  const knop = useRef<HTMLButtonElement>(null);

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
  useEffect(() => {
    const t = setTimeout(() => setGereed(true), 0);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!open) return;
    const toets = (e: KeyboardEvent) =>
      e.key === "Escape" && (setOpen(false), knop.current?.focus());
    const klik = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!paneel.current?.contains(t) && !knop.current?.contains(t))
        setOpen(false);
    };
    document.addEventListener("keydown", toets);
    document.addEventListener("click", klik);
    return () => {
      document.removeEventListener("keydown", toets);
      document.removeEventListener("click", klik);
    };
  }, [open]);
  useEffect(() => {
    if (!open || window.matchMedia("(min-width: 768px)").matches) return;
    const oud = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = oud;
    };
  }, [open]);

  const zet = (s: Stand) => {
    setStand(s);
    pasToe(s);
    if (s.geluid && !stand.geluid) toon(); // meteen laten horen hoe het klinkt
  };

  return (
    <>
      <button
        ref={knop}
        type="button"
        aria-label={taal === "en" ? "Display and accessibility" : "Weergave en toegankelijkheid"}
        aria-expanded={open}
        aria-controls="weergave-paneel"
        onClick={() => setOpen(!open)}
        className={knopKlasse}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 5h14M3 10h14M3 15h14" />
          <circle cx="7" cy="5" r="2" />
          <circle cx="13" cy="10" r="2" />
          <circle cx="9" cy="15" r="2" />
        </svg>
      </button>
      {gereed &&
        createPortal(
          <div
            ref={paneel}
            id="weergave-paneel"
            role="dialog"
            aria-label={taal === "en" ? "Display and accessibility" : "Weergave en toegankelijkheid"}
            hidden={!open}
            className="fixed inset-0 z-[1100] overflow-y-auto overscroll-contain bg-grond px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(20px,env(safe-area-inset-top))] text-sm text-inkt md:inset-auto md:bottom-[84px] md:left-1/2 md:z-[200] md:w-80 md:-translate-x-1/2 md:overflow-visible md:rounded-2xl md:border md:border-lijn md:p-5 md:shadow-2xl lg:bottom-[110px]"
          >
            <div className="mb-8 flex items-center justify-between md:mb-4">
              <strong className="syne text-[28px] md:text-[17px]">
                <T t={{ nl: "Weergave", en: "Display" }} />
              </strong>
              <button
                type="button"
                aria-label={taal === "en" ? "Close" : "Sluiten"}
                onClick={() => setOpen(false)}
                className="grid size-[var(--knop)] cursor-pointer place-items-center rounded-full border border-lijn md:size-[var(--knop-klein)] md:border-0"
              >
                ✕
              </button>
            </div>
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
              <p className="mt-2 text-xs opacity-70">
                <T t={{ nl: "Auto: licht overdag, donker vanaf 19.00 uur.", en: "Auto: light by day, dark from 7 pm." }} />
              </p>
            </fieldset>
            <fieldset className="m-0 border-0 p-0">
              <legend className="lbl mb-2.5 p-0 opacity-70">
                <T t={{ nl: "Toegankelijkheid", en: "Accessibility" }} />
              </legend>
              {SCHAKELAARS.map(([k, t]) => (
                <label
                  key={k}
                  className="flex cursor-pointer items-center justify-between gap-3 border-t border-lijn py-2.5 last:border-b"
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
            </fieldset>
            <button
              type="button"
              onClick={() => zet(STANDAARD)}
              className="lbl mt-3 cursor-pointer border-b border-current"
            >
              <T t={{ nl: "Standaard herstellen", en: "Restore defaults" }} />
            </button>
          </div>,
          document.body,
        )}
    </>
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
