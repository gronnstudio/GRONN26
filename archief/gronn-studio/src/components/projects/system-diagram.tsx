"use client"

import { motion } from "framer-motion"

import { useT } from "@/components/language-provider"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// Animated water-system diagram for the Connected Pond Ecosystem case
// study: upper pond → planted stream → wetland biofilter → spillway →
// lower pond → return line. Flow is shown by drifting dashes (CSS
// dash-flow keyframe); paths draw themselves in on first view. Frozen but
// fully legible under reduced-motion.
export function SystemDiagram() {
  const t = useT()
  const reduced = useReducedMotion()

  const flowClass = reduced
    ? ""
    : "motion-safe:[animation:dash-flow_1.6s_linear_infinite]"

  const draw = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { pathLength: 0 },
          whileInView: { pathLength: 1 },
          viewport: { once: true, margin: "-15%" },
          transition: { duration: 1.2, delay, ease: "easeInOut" as const },
        }

  return (
    <figure className="rounded-lg border border-line/10 bg-surface/60 p-6 sm:p-10">
      <svg viewBox="0 0 800 320" className="w-full" role="img">
        <title>
          {t({
            en: "Water circulation diagram: upper pond, planted stream, wetland biofilter, spillway, lower pond, return line",
            nl: "Watercirculatiediagram: bovenvijver, beplante beek, moerasbiofilter, overloop, ondervijver, retourleiding",
          })}
        </title>

        {/* Upper pond */}
        <ellipse cx="120" cy="80" rx="90" ry="38" fill="#3e7c8f" opacity="0.75" />
        <ellipse cx="120" cy="76" rx="66" ry="24" fill="#d0ede0" opacity="0.15" />

        {/* Planted stream: upper pond → wetland */}
        <motion.path
          d="M205 90 C280 110 320 140 380 150"
          fill="none"
          stroke="#3e7c8f"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.7"
          {...draw(0.2)}
        />
        <path
          d="M205 90 C280 110 320 140 380 150"
          fill="none"
          stroke="#d0ede0"
          strokeWidth="2"
          strokeDasharray="6 10"
          strokeLinecap="round"
          className={flowClass}
        />

        {/* Wetland biofilter */}
        <rect x="380" y="120" width="130" height="64" rx="10" fill="#4a6b3d" opacity="0.5" />
        {[398, 420, 442, 464, 486].map((x) => (
          <path
            key={x}
            d={`M${x} 176 C${x - 4} 160 ${x + 4} 148 ${x} 132`}
            fill="none"
            stroke="#d0ede0"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
          />
        ))}

        {/* Spillway: wetland → lower pond */}
        <motion.path
          d="M510 155 C560 165 600 190 640 210"
          fill="none"
          stroke="#3e7c8f"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.7"
          {...draw(0.5)}
        />
        <path
          d="M510 155 C560 165 600 190 640 210"
          fill="none"
          stroke="#d0ede0"
          strokeWidth="2"
          strokeDasharray="6 10"
          strokeLinecap="round"
          className={flowClass}
        />

        {/* Lower pond */}
        <ellipse cx="680" cy="240" rx="100" ry="42" fill="#3e7c8f" opacity="0.85" />
        <ellipse cx="680" cy="236" rx="74" ry="27" fill="#d0ede0" opacity="0.15" />

        {/* Return line: lower pond → upper pond (the single pump lift) */}
        <motion.path
          d="M600 270 C380 300 160 260 100 130"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="1.5"
          strokeDasharray="4 8"
          {...draw(0.8)}
        />

        {/* Labels */}
        <g
          className="fill-current font-mono"
          fontSize="11"
          style={{ letterSpacing: "0.12em" }}
        >
          <text x="120" y="30" textAnchor="middle" fill="var(--foreground)">
            {t({ en: "UPPER POND", nl: "BOVENVIJVER" })}
          </text>
          <text x="290" y="100" textAnchor="middle" fill="var(--muted)">
            {t({ en: "PLANTED STREAM", nl: "BEPLANTE BEEK" })}
          </text>
          <text x="445" y="108" textAnchor="middle" fill="var(--foreground)">
            {t({ en: "WETLAND BIOFILTER", nl: "MOERASBIOFILTER" })}
          </text>
          <text x="585" y="196" textAnchor="middle" fill="var(--muted)">
            {t({ en: "SPILLWAY", nl: "OVERLOOP" })}
          </text>
          <text x="680" y="305" textAnchor="middle" fill="var(--foreground)">
            {t({ en: "LOWER POND", nl: "ONDERVIJVER" })}
          </text>
          <text x="320" y="292" textAnchor="middle" fill="var(--muted)">
            {t({ en: "RETURN — SINGLE PUMP LIFT", nl: "RETOUR — ÉÉN POMPSLAG" })}
          </text>
        </g>
      </svg>
      <figcaption className="mt-4 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted">
        {t({
          en: "Every metre of the route filters, oxygenates or hosts life",
          nl: "Elke meter van de route filtert, voegt zuurstof toe of herbergt leven",
        })}
      </figcaption>
    </figure>
  )
}
