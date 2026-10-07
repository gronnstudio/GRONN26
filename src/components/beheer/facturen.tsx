"use client";

import { useEffect, useState } from "react";
import type { Factuur } from "@/lib/beheer/data";
import { euro } from "@/lib/format";

// Facturen met een verwijderknop (eigenaar, 7 okt 2026). Verwijderen verbergt
// de factuur in deze browser; "Toon alles" haalt ze terug. De lijst zelf staat
// in src/lib/beheer/data.ts.
const KEY = "gronn-facturen-weg";
const lbl = "text-[10px] font-semibold uppercase tracking-[.18em]";
const datum = (d: string) => new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

export function Facturen({ ontvangen, betalen }: { ontvangen: Factuur[]; betalen: Factuur[] }) {
  const [weg, setWeg] = useState<string[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        setWeg(JSON.parse(localStorage.getItem(KEY) || "[]"));
      } catch {}
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const bewaar = (lijst: string[]) => {
    setWeg(lijst);
    try {
      localStorage.setItem(KEY, JSON.stringify(lijst));
    } catch {}
  };

  return (
    <section className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:col-span-2">
      {([
        ["Te ontvangen", ontvangen],
        ["Te betalen", betalen],
      ] as const).map(([titel, alle]) => {
        const lijst = alle.filter((f) => !weg.includes(f.nummer));
        const som = lijst.filter((f) => !f.betaald).reduce((s, f) => s + (f.bedrag ?? 0), 0);
        const verborgen = alle.length - lijst.length;
        return (
          <div key={titel}>
            <div className="flex items-baseline justify-between gap-4">
              <p className={`${lbl} m-0 opacity-60`}>Facturen · {titel}</p>
              {som > 0 && <p className="m-0 text-[13px] font-semibold">{euro(som)} open</p>}
            </div>
            <ul className="m-0 mt-3 list-none p-0">
              {lijst.map((f) => {
                const telaat = !f.betaald && new Date(f.vervalt) < new Date();
                return (
                  <li key={f.nummer} className={`flex items-start justify-between gap-3 border-t border-lijn py-3 ${f.betaald ? "opacity-50" : ""}`}>
                    <div className="min-w-0 flex-1">
                      <b className="block font-semibold [overflow-wrap:anywhere]">{f.nummer}</b>
                      <span className="text-[13px] opacity-70">{f.aan} · {f.stand}</span>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="block font-semibold tabular-nums">{f.bedrag ? euro(f.bedrag) : "—"}</span>
                      <span className={`text-[12px] ${telaat ? "text-oranje-tekst" : "opacity-60"}`}>
                        {f.betaald ? "betaald" : `${telaat ? "verlopen" : "vervalt"} ${datum(f.vervalt)}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => bewaar([...weg, f.nummer])}
                      aria-label={`Verwijder ${f.nummer}`}
                      title="Verwijderen"
                      className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border border-lijn text-[13px] opacity-60 hover:border-oranje hover:opacity-100"
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
            {verborgen > 0 && (
              <button
                type="button"
                onClick={() => bewaar(weg.filter((n) => !alle.some((f) => f.nummer === n)))}
                className="mt-2 cursor-pointer text-[12px] opacity-60 hover:opacity-100"
              >
                {verborgen} verwijderd · Toon alles
              </button>
            )}
          </div>
        );
      })}
    </section>
  );
}
