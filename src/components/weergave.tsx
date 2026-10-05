"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toon } from "@/lib/geluid";

// WF-026: één knop met een regelaar-icoon opent Kleur (Auto · Licht · Donker;
// Auto = licht van 07.00 tot 19.00) en Toegankelijkheid. Bewaard in deze
// browser; het voorverf-script in layout.tsx past het toe vóór de eerste verf.
type Stand = {
  kleur: "auto" | "licht" | "donker";
  beweging: boolean;
  groot: boolean;
  contrast: boolean;
  onderstreep: boolean;
  geluid: boolean;
};
const KEY = "gronn-weergave";
const STANDAARD: Stand = {
  kleur: "auto",
  beweging: false,
  groot: false,
  contrast: false,
  onderstreep: false,
  geluid: false,
};
const SCHAKELAARS: [keyof Omit<Stand, "kleur">, string][] = [
  ["beweging", "Minder beweging"],
  ["groot", "Grotere tekst"],
  ["contrast", "Meer contrast"],
  ["onderstreep", "Links onderstrepen"],
  ["geluid", "Geluid bij paginawissel"],
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
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export function Weergave({ knopKlasse = "" }: { knopKlasse?: string }) {
  const [open, setOpen] = useState(false);
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
        aria-label="Weergave en toegankelijkheid"
        aria-expanded={open}
        aria-controls="weergave-paneel"
        onClick={() => setOpen(!open)}
        className={`flex h-12 w-full cursor-pointer flex-col items-center justify-center gap-[4px] rounded-full px-1.5 lg:grid lg:size-10 lg:min-w-0 lg:place-items-center lg:px-0 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 ${knopKlasse}`}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 20 20"
          aria-hidden
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        >
          <path d="M3 5h14M3 10h14M3 15h14" />
          <circle cx="7" cy="5" r="2" fill="none" />
          <circle cx="13" cy="10" r="2" fill="none" />
          <circle cx="9" cy="15" r="2" fill="none" />
        </svg>
        <span className="text-[8px] leading-[10px] font-semibold tracking-[.06em] uppercase lg:hidden">Weergave</span>
      </button>
      {gereed &&
        createPortal(
          <div
            ref={paneel}
            id="weergave-paneel"
            role="dialog"
            aria-label="Weergave en toegankelijkheid"
            hidden={!open}
            className="fixed inset-0 z-[1100] overflow-y-auto overscroll-contain bg-grond px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(20px,env(safe-area-inset-top))] text-sm text-inkt md:inset-auto md:bottom-[84px] md:left-1/2 md:z-[200] md:w-80 md:-translate-x-1/2 md:overflow-visible md:rounded-2xl md:border md:border-lijn md:p-5 md:shadow-2xl lg:bottom-[110px]"
          >
            <div className="mb-8 flex items-center justify-between md:mb-4">
              <strong className="syne text-[28px] md:text-[17px]">
                Weergave
              </strong>
              <button
                type="button"
                aria-label="Sluiten"
                onClick={() => setOpen(false)}
                className="grid size-12 cursor-pointer place-items-center rounded-full border border-lijn md:size-8 md:border-0"
              >
                ✕
              </button>
            </div>
            <fieldset className="m-0 mb-4 border-0 p-0">
              <legend className="lbl mb-2.5 p-0 opacity-70">Kleur</legend>
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
                    {k[0].toUpperCase() + k.slice(1)}
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs opacity-70">
                Auto: licht overdag, donker vanaf 19.00 uur.
              </p>
            </fieldset>
            <fieldset className="m-0 border-0 p-0">
              <legend className="lbl mb-2.5 p-0 opacity-70">
                Toegankelijkheid
              </legend>
              {SCHAKELAARS.map(([k, t]) => (
                <label
                  key={k}
                  className="flex cursor-pointer items-center justify-between gap-3 border-t border-lijn py-2.5 last:border-b"
                >
                  <span>{t}</span>
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
              Standaard herstellen
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
