"use client";

import { useEffect, useState } from "react";

// Dezelfde kleurkeuze als in Weergave op de site (Auto · Licht · Donker; Auto =
// licht van 07.00 tot 19.00), en dezelfde bewaarde stand: wat je hier kiest,
// geldt ook op de site en andersom. Het voorverf-script in layout.tsx zet het
// vóór de eerste verf.
type Kleur = "auto" | "licht" | "donker";
const KEY = "gronn-weergave";
const KEUZES: [Kleur, string][] = [
  ["auto", "Auto"],
  ["licht", "Licht"],
  ["donker", "Donker"],
];

export function KleurKeuze() {
  const [kleur, setKleur] = useState<Kleur>("auto");

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        setKleur(JSON.parse(localStorage.getItem(KEY) || "{}").kleur ?? "auto");
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const kies = (k: Kleur) => {
    setKleur(k);
    const u = new Date().getHours();
    document.documentElement.classList.toggle("donker", k === "donker" || (k === "auto" && (u < 7 || u >= 19)));
    try {
      const stand = JSON.parse(localStorage.getItem(KEY) || "{}");
      localStorage.setItem(KEY, JSON.stringify({ ...stand, kleur: k }));
    } catch {}
  };

  return (
    <fieldset className="m-0 flex rounded-full border border-lijn p-[3px]">
      <legend className="sr-only">Kleur</legend>
      {KEUZES.map(([k, naam]) => (
        <label
          key={k}
          className="cursor-pointer rounded-full px-2.5 py-1 text-[12px] font-medium has-checked:bg-inkt has-checked:text-grond has-focus-visible:outline-2"
        >
          <input type="radio" name="beheer-kleur" value={k} checked={kleur === k} onChange={() => kies(k)} className="sr-only" />
          {naam}
        </label>
      ))}
    </fieldset>
  );
}
