"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useTaal } from "@/components/taal-klant";

// Muziek staat standaard aan (eigenaar, 19 okt 2026: "Zet muziek standaard
// aan, maak rechts midden een zwevende knop om muziek te muten!"). Browsers
// laten geluid pas toe na een tik of toets, dus de lus start bij de eerste
// interactie. Uitzetten wordt bewaard; bij verlaten van de site (ander tabblad,
// app weg, pagina dicht) pauzeert hij ("Bij verlaten van website moet muziek
// automatisch uit"). Eén speler en één stand voor de hele site.
const KEY = "gronn-muziek";
let speler: HTMLAudioElement | null = null;
let aan = true;
let gelezen = false;
const luisteraars = new Set<() => void>();

function lees() {
  if (!gelezen && typeof window !== "undefined") {
    gelezen = true;
    try {
      aan = localStorage.getItem(KEY) !== "uit";
    } catch {}
  }
  return aan;
}

function speel() {
  if (!speler) {
    speler = new Audio("/muziek/achtergrond.mp3");
    speler.loop = true;
    speler.volume = 0.35;
  }
  speler.play().catch(() => {});
}

export function zetMuziek(nieuw: boolean) {
  aan = nieuw;
  gelezen = true;
  try {
    if (nieuw) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, "uit");
  } catch {}
  if (nieuw) speel();
  else speler?.pause();
  luisteraars.forEach((f) => f());
}

function abonneer(f: () => void) {
  luisteraars.add(f);
  return () => luisteraars.delete(f);
}

export function useMuziek() {
  return useSyncExternalStore(abonneer, lees, () => true);
}

/** De zwevende knop rechts midden; start ook de muziek bij de eerste tik. */
export function MuziekKnop() {
  const speelt = useMuziek();
  const en = useTaal() === "en";

  useEffect(() => {
    // Eerste tik of toets ergens op de site start de lus, behalve een tik op
    // deze knop zelf: wie die als eerste raakt, wil stilte.
    const start = (e: Event) => {
      if ((e.target as Element | null)?.closest?.("[data-muziek]")) return stop();
      if (lees()) speel();
      stop();
    };
    const stop = () => {
      window.removeEventListener("pointerdown", start, true);
      window.removeEventListener("keydown", start, true);
    };
    window.addEventListener("pointerdown", start, true);
    window.addEventListener("keydown", start, true);
    const weg = () => speler?.pause();
    const terug = () => {
      if (document.visibilityState === "hidden") weg();
      else if (lees() && speler) speel();
    };
    document.addEventListener("visibilitychange", terug);
    window.addEventListener("pagehide", weg);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", terug);
      window.removeEventListener("pagehide", weg);
    };
  }, []);

  const label = speelt ? (en ? "Mute music" : "Muziek uit") : en ? "Play music" : "Muziek aan";
  return (
    <button
      type="button"
      data-muziek
      aria-label={label}
      title={label}
      aria-pressed={!speelt}
      onClick={() => zetMuziek(!speelt)}
      className="fixed top-1/2 right-2 z-[99] grid size-[var(--knop-klein)] md:right-3 md:size-[var(--knop)] -translate-y-1/2 cursor-pointer place-items-center rounded-full border-0 glas text-gebroken-wit focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oranje"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
        {speelt ? (
          <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" stroke="var(--oranje)" />
        ) : (
          <path d="M16 9.5l5 5M21 9.5l-5 5" />
        )}
      </svg>
    </button>
  );
}
