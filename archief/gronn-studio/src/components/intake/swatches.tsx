import type { ReactNode } from "react"

// Material samples for the intake pickers.
//
// Picking a paving bond by looking at it beats reading "fired brick
// paver, approx. 200×50 mm", and a client who has never said the word
// "dikformaat" can still point at one. That is the whole argument for
// drawing these.
//
// They are built from four primitives — a bond, a scatter, a stand of
// stems, a frame — rather than sixty hand-drawn files. Sixty drawings
// would be the "clipart illustration" this project has already rejected
// once; sixty variations on four rules is a material library, and it
// stays consistent because nothing is drawn twice.
//
// ── The colour exception ──────────────────────────────────────────
//
// These hardcode colour, which the project otherwise forbids outright.
// It is the same exception `photo-glass` claims and for the same reason:
// a fired clay paver is that red under every palette, and repainting the
// brick when the visitor picks Blue Hour would make the sample a lie.
// A material sample is a photograph of a material, not chrome. The frame
// around it, the caption under it and the selected state on it are all
// themed tokens — only what is being sampled is fixed.
//
// The randomness is seeded and deterministic, so the server and the
// client draw the same gravel and hydration does not complain.

const W = 132
const H = 92

/** A tiny LCG. Same seed, same picture, on both sides of hydration. */
function rng(seed: number) {
  let a = seed
  return () => {
    a = (a * 9301 + 49297) % 233280
    return a / 233280
  }
}

const RED = ["#a8522f", "#95482a", "#b25e36", "#8e4526", "#a55830"]
const GREY = ["#b6b2aa", "#ada9a1", "#bebab2", "#a9a59d"]
const DARK = ["#6e7270", "#787c79", "#666a68"]
const STONE = ["#c3bfb6", "#cac6bd", "#bab6ac"]
const WOOD = ["#9a7a50", "#8c6e48", "#a5855a"]
const GREEN = "#4a6b4b"
const GREEN_LIGHT = "#7e9470"
const GREEN_DEEP = "#33513a"
const PAPER = "#e4e0d7"
const WATER = "#7fa6a0"

/** A running bond, optionally staggered. Rows overrun the frame. */
function bond(
  w: number,
  h: number,
  gap: number,
  cols: number,
  rows: number,
  fills: string[],
  stagger = false
): ReactNode[] {
  const out: ReactNode[] = []
  let n = 0
  for (let j = 0; j < rows; j++) {
    for (let i = -1; i < cols + 1; i++) {
      const x = i * (w + gap) + (stagger && j % 2 ? (w + gap) / 2 : 0)
      out.push(
        <rect
          key={`${i}-${j}`}
          x={x}
          y={j * (h + gap)}
          width={w}
          height={h}
          fill={fills[n++ % fills.length]}
        />
      )
    }
  }
  return out
}

/** Loose aggregate: gravel, grit, chippings, blossom. */
function scatter(n: number, seed: number, r: number, fills: string[]): ReactNode[] {
  const rand = rng(seed)
  return Array.from({ length: n }, (_, i) => (
    <circle
      key={i}
      cx={+(rand() * W).toFixed(1)}
      cy={+(rand() * H).toFixed(1)}
      r={+(r * (0.5 + rand())).toFixed(1)}
      fill={fills[i % fills.length]}
    />
  ))
}

/** A stand of stems rising from the bottom edge. */
function stems(n: number, seed: number, colour: string, top: number): ReactNode[] {
  const rand = rng(seed)
  return Array.from({ length: n }, (_, i) => {
    const x = rand() * W
    const t = top + rand() * 22
    const c = x + (rand() - 0.5) * 16
    return (
      <path
        key={i}
        d={`M${x.toFixed(1)} ${H + 2} Q${c.toFixed(1)} ${((t + H) / 2).toFixed(1)} ${(c + (rand() - 0.5) * 8).toFixed(1)} ${t.toFixed(1)}`}
        fill="none"
        stroke={colour}
        strokeWidth={+(1 + rand() * 1.2).toFixed(1)}
        strokeLinecap="round"
        opacity={+(0.5 + rand() * 0.5).toFixed(2)}
      />
    )
  })
}

function ground(fill: string) {
  return <rect width={W} height={H} fill={fill} />
}

const SWATCHES: Record<string, ReactNode> = {
  // ── Atmosphere ──────────────────────────────────────────────────
  "mood.formal": (
    <>
      {ground("#f2efea")}
      <rect y={52} width={W} height={40} fill="#c7c3ba" />
      <rect x={14} y={20} width={46} height={30} fill={GREEN} />
      <rect x={70} y={12} width={48} height={38} fill="#d6d2c9" />
      <rect y={50} width={W} height={2} fill="#9a968e" />
    </>
  ),
  "mood.wild": (
    <>
      {ground("#f2efea")}
      <rect y={62} width={W} height={30} fill="#cfc8b8" />
      {stems(46, 7, GREEN, 10)}
      {stems(20, 31, GREEN_LIGHT, 26)}
    </>
  ),
  "mood.spare": (
    <>
      {ground("#d9d5cc")}
      {scatter(60, 3, 1.1, ["#c4c0b7", "#cecac1"])}
      <ellipse cx={34} cy={56} rx={17} ry={9} fill="#8e9a88" />
      <ellipse cx={96} cy={60} rx={11} ry={6} fill="#6f7c6c" />
    </>
  ),
  "mood.lush": (
    <>
      {ground("#f2efea")}
      {stems(40, 11, GREEN, 14)}
      {scatter(46, 17, 3.2, ["#b589a8", "#c9a0b6", "#8e7fa8", "#e0d3b8"])}
    </>
  ),
  "mood.dry": (
    <>
      {ground("#e2dccf")}
      {scatter(90, 23, 1.6, ["#cfc7b6", "#c2b9a6"])}
      <ellipse cx={30} cy={58} rx={16} ry={11} fill="#93a08c" />
      <ellipse cx={92} cy={50} rx={19} ry={13} fill="#a3ae99" />
    </>
  ),
  "mood.woodland": (
    <>
      {ground("#dedcd2")}
      <rect x={52} width={9} height={H} fill="#6e6152" />
      <rect x={104} width={6} height={H} fill="#7c6e5d" />
      {stems(34, 41, GREEN_DEEP, 30)}
    </>
  ),
  "mood.productive": (
    <>
      {ground("#dad3c4")}
      <rect x={8} y={14} width={52} height={30} fill="none" stroke={WOOD[1]} strokeWidth={3} />
      <rect x={8} y={52} width={52} height={30} fill="none" stroke={WOOD[1]} strokeWidth={3} />
      <rect x={72} y={14} width={52} height={68} fill="none" stroke={WOOD[1]} strokeWidth={3} />
      {stems(26, 53, GREEN, 18)}
    </>
  ),

  // ── Planting ────────────────────────────────────────────────────
  "planting.grasses": (
    <>
      {ground("#f2efea")}
      {stems(60, 5, "#9c9a6e", 12)}
      {stems(24, 19, "#b8a87e", 22)}
    </>
  ),
  "planting.meadow": (
    <>
      {ground("#f2efea")}
      {stems(38, 29, GREEN_LIGHT, 20)}
      {scatter(40, 37, 2.6, ["#d8b33f", "#c25e7a", "#7e7fb0", "#e0e0d2"])}
    </>
  ),
  "planting.evergreen": (
    <>
      {ground("#f2efea")}
      <ellipse cx={28} cy={66} rx={22} ry={18} fill={GREEN} />
      <ellipse cx={70} cy={72} rx={16} ry={13} fill="#5c7a56" />
      <ellipse cx={104} cy={62} rx={20} ry={16} fill="#3e5c42" />
    </>
  ),
  "planting.shade": (
    <>
      {ground("#dcddd4")}
      {stems(30, 59, GREEN_DEEP, 22)}
      {stems(16, 67, "#5f7a5a", 34)}
    </>
  ),
  "planting.drought": (
    <>
      {ground("#e1dcd0")}
      {scatter(70, 71, 1.4, ["#cec7b7"])}
      <ellipse cx={40} cy={60} rx={18} ry={12} fill="#9eaa97" />
      <ellipse cx={94} cy={54} rx={15} ry={11} fill="#aeb7a5" />
    </>
  ),
  "planting.thicket": (
    <>
      {ground("#f2efea")}
      <ellipse cx={34} cy={56} rx={30} ry={26} fill={GREEN} />
      <ellipse cx={92} cy={62} rx={32} ry={28} fill="#3f5c41" />
      {scatter(22, 83, 2.2, ["#c33b2c", "#8e2f28"])}
    </>
  ),

  // ── Water ───────────────────────────────────────────────────────
  "water.none": (
    <>
      {ground("#e6e2da")}
      <path
        d="M46 34 L86 58 M86 34 L46 58"
        stroke="#b4b0a7"
        strokeWidth={4}
        strokeLinecap="round"
      />
    </>
  ),
  "water.pool": (
    <>
      {ground("#d9d5cb")}
      <path
        d="M18 52 C26 30 96 26 114 46 C126 62 92 78 60 76 C30 74 10 68 18 52Z"
        fill={WATER}
      />
      {stems(12, 89, GREEN_DEEP, 30)}
    </>
  ),
  "water.basin": (
    <>
      {ground("#ddd9d0")}
      <rect x={22} y={24} width={88} height={46} fill="#6f9a95" />
      <rect x={22} y={24} width={88} height={46} fill="none" stroke="#5b5f5c" strokeWidth={3} />
      <path d="M30 40h34M30 50h22" stroke="rgb(255 255 255 / 0.5)" strokeWidth={2} />
    </>
  ),
  "water.swale": (
    <>
      {ground("#dad6cb")}
      <path d="M0 40 C34 78 98 78 132 40 L132 92 L0 92Z" fill="#b9c4ae" />
      <path d="M0 40 C34 78 98 78 132 40" fill="none" stroke={WATER} strokeWidth={3} />
      {stems(18, 97, GREEN_LIGHT, 46)}
    </>
  ),
  "water.drinker": (
    <>
      {ground("#dfdbd2")}
      <ellipse cx={66} cy={52} rx={30} ry={16} fill={WATER} />
      <ellipse cx={66} cy={52} rx={30} ry={16} fill="none" stroke="#8d8a80" strokeWidth={3} />
    </>
  ),

  // ── Paving ──────────────────────────────────────────────────────
  "paving.waaltje": <>{bond(30, 9, 2, 5, 8, RED, true)}</>,
  "paving.dikformaat": <>{bond(34, 13, 2, 4, 6, RED, true)}</>,
  "paving.herringbone": (
    <>
      {ground("#f2efea")}
      <g transform="rotate(45 66 46)">{bond(26, 9, 2, 6, 14, RED, true)}</g>
    </>
  ),
  "paving.concrete": <>{bond(30, 10, 2, 5, 8, GREY, true)}</>,
  "paving.ceramic": <>{bond(42, 42, 3, 3, 3, DARK, false)}</>,
  "paving.stone": (
    <>
      <path d="M0 0h48v30H0z" fill={STONE[0]} />
      <path d="M48 0h50v44H48z" fill={STONE[1]} />
      <path d="M98 0h34v22H98z" fill={STONE[2]} />
      <path d="M0 30h30v34H0z" fill={STONE[1]} />
      <path d="M30 30h18v34H30z" fill={STONE[2]} />
      <path d="M98 22h34v42H98z" fill={STONE[0]} />
      <path d="M48 44h50v20H48z" fill={STONE[2]} />
      <path d="M0 64h64v28H0z" fill={STONE[2]} />
      <path d="M64 64h68v28H64z" fill={STONE[1]} />
    </>
  ),
  "paving.gravel": (
    <>
      {ground("#f2efea")}
      {scatter(140, 13, 2.2, ["#c6bfb0", "#b8b0a0", "#d2ccbe", "#ada595"])}
    </>
  ),
  "paving.halfpaving": (
    <>
      {ground("#d4c7ae")}
      {scatter(160, 43, 1.1, ["#c7b99e", "#ded2bb"])}
    </>
  ),
  "paving.deck": (
    <>
      {ground(WOOD[1])}
      {bond(W, 13, 3, 1, 6, WOOD, false)}
    </>
  ),
  "paving.chips": (
    <>
      {ground("#a98a5f")}
      {scatter(120, 61, 2.4, ["#8e7247", "#c0a176", "#9c7f52"])}
    </>
  ),
  "paving.greenjoint": (
    <>
      {ground(GREEN_LIGHT)}
      {bond(38, 26, 5, 4, 4, STONE, false)}
    </>
  ),
  "paving.reuse": (
    <>
      {ground(PAPER)}
      {bond(30, 9, 2, 5, 8, ["#c8c4bb", "#bfbbb2", "#d0ccc3"], true)}
      <path
        d="M34 46 h64 M78 30 l20 16 l-20 16"
        fill="none"
        stroke="#7d7a72"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),

  // ── Edges ───────────────────────────────────────────────────────
  "edges.corten": (
    <>
      {ground("#e0dcd3")}
      <rect y={34} width={W} height={24} fill="#a4553a" />
      <rect y={34} width={W} height={3} fill="#c06b48" />
    </>
  ),
  "edges.hardwood": (
    <>
      {ground("#e0dcd3")}
      <rect y={32} width={W} height={28} fill={WOOD[0]} />
      <path d="M0 44h132" stroke={WOOD[1]} strokeWidth={2} />
    </>
  ),
  "edges.brickwall": <>{bond(30, 13, 3, 5, 6, RED, true)}</>,
  "edges.drystone": <>{bond(24, 11, 3, 6, 7, STONE, true)}</>,
  "edges.kerb": (
    <>
      {ground("#e0dcd3")}
      <rect y={36} width={W} height={20} fill="#a9a59d" />
      <path d="M44 36v20M88 36v20" stroke="#8e8a82" strokeWidth={2} />
    </>
  ),
  "edges.noedge": (
    <>
      {ground("#d9d5cb")}
      <path d="M0 58 C34 44 98 70 132 52 L132 92 L0 92Z" fill={GREEN_LIGHT} />
    </>
  ),

  // ── Boundary ────────────────────────────────────────────────────
  "boundary.fence": (
    <>
      {ground("#3b4440")}
      {bond(9, H, 3, 11, 1, ["#39433f", "#434d48", "#2f3835"], false)}
    </>
  ),
  "boundary.wire": (
    <>
      {ground("#dcd8cf")}
      <path
        d="M14 0v92M38 0v92M62 0v92M86 0v92M110 0v92M0 18h132M0 42h132M0 66h132"
        stroke="#9a968e"
        strokeWidth={1.5}
      />
      {stems(30, 73, GREEN, 6)}
    </>
  ),
  "boundary.hedge": (
    <>
      {ground("#dcd8cf")}
      <rect y={16} width={W} height={76} fill={GREEN} />
      {scatter(70, 79, 2.4, ["#40603f", "#587a4e"])}
    </>
  ),
  "boundary.mixed": (
    <>
      {ground("#dcd8cf")}
      <ellipse cx={24} cy={60} rx={30} ry={34} fill="#3f5c41" />
      <ellipse cx={72} cy={52} rx={30} ry={38} fill={GREEN} />
      <ellipse cx={116} cy={62} rx={26} ry={32} fill="#5c7a56" />
      {scatter(18, 101, 2.2, ["#c33b2c", "#e0d3b8"])}
    </>
  ),
  "boundary.keep": (
    <>
      {ground(PAPER)}
      <path
        d="M32 30h68v40H32z"
        fill="none"
        stroke="#9a968e"
        strokeWidth={3}
        strokeDasharray="7 5"
      />
    </>
  ),

  // ── Functions ───────────────────────────────────────────────────
  "functions.dining": (
    <>
      {ground(PAPER)}
      <ellipse cx={66} cy={46} rx={30} ry={19} fill={WOOD[0]} />
      <rect x={16} y={38} width={14} height={16} fill="#7d7a72" />
      <rect x={102} y={38} width={14} height={16} fill="#7d7a72" />
    </>
  ),
  "functions.lounging": (
    <>
      {ground(PAPER)}
      <path d="M24 62h84v10H24z" fill={WOOD[0]} />
      <path d="M24 62 L52 34 L66 44 L44 62Z" fill={WOOD[2]} />
      <circle cx={104} cy={24} r={11} fill="#e0c67a" />
    </>
  ),
  "functions.fire": (
    <>
      {ground(PAPER)}
      <rect x={34} y={50} width={64} height={26} fill="#7d7a72" />
      <path d="M66 46 C56 34 74 30 66 16 C84 26 82 44 66 46Z" fill="#d2542a" />
    </>
  ),
  "functions.play": (
    <>
      {ground("#c4cfb4")}
      <circle cx={44} cy={52} r={14} fill={PAPER} />
      <path d="M88 26v40M78 66h20" stroke={WOOD[1]} strokeWidth={4} strokeLinecap="round" />
    </>
  ),
  "functions.kitchengarden": (
    <>
      {ground("#dad3c4")}
      <rect x={10} y={24} width={46} height={52} fill="none" stroke={WOOD[1]} strokeWidth={3} />
      <path
        d="M76 76 L76 30 L104 16 L132 30 L132 76Z"
        fill="none"
        stroke="#8d8a80"
        strokeWidth={3}
      />
      {stems(14, 107, GREEN, 36)}
    </>
  ),
  "functions.storage": (
    <>
      {ground(PAPER)}
      <path d="M20 78V44L66 20l46 24v34Z" fill="#8d8a80" />
      <rect x={52} y={52} width={28} height={26} fill={PAPER} />
    </>
  ),
  "functions.work": (
    <>
      {ground(PAPER)}
      <rect x={34} y={40} width={64} height={8} fill={WOOD[0]} />
      <path d="M52 40V70M80 40v30" stroke="#7d7a72" strokeWidth={4} />
      <rect x={54} y={24} width={24} height={16} fill="#5b5f5c" />
    </>
  ),
  "functions.wildlife": (
    <>
      {ground("#dad3c4")}
      <path d="M40 76V40l24-16 24 16v36Z" fill={WOOD[1]} />
      <circle cx={64} cy={50} r={8} fill="#3b342a" />
      {stems(16, 113, GREEN, 50)}
    </>
  ),
  "functions.car": (
    <>
      {ground(GREEN_LIGHT)}
      {bond(38, 26, 5, 4, 4, GREY, false)}
    </>
  ),
  "functions.lighting": (
    <>
      {ground("#2f3835")}
      <circle cx={34} cy={40} r={16} fill="#e0c67a" opacity={0.35} />
      <circle cx={34} cy={40} r={5} fill="#f0dca8" />
      <circle cx={92} cy={58} r={20} fill="#e0c67a" opacity={0.3} />
      <circle cx={92} cy={58} r={5} fill="#f0dca8" />
    </>
  ),
}

/**
 * The sample for one option, or a blank card when none is drawn.
 *
 * `aria-hidden` throughout: the caption beside it already names the
 * material, and a screen reader announcing "gravel drawing, gravel"
 * is worse than one that just says "gravel".
 */
/**
 * Does this picker have drawings at all?
 *
 * Read rather than declared, so it cannot drift. The material pickers
 * are shown as sample cards because the sample IS the answer — you
 * cannot choose a paver from its name. The pickers added when the form
 * was shortened (budget, household, what has to stay) have nothing to
 * draw, and rendering them as cards gave each text answer an empty
 * 132×92 rectangle of paper above it: a lot of screen for a word, and on
 * a phone a whole column of nothing.
 *
 * So the form asks this question instead of being told the answer. Draw
 * a swatch for a group later and its picker becomes a row of cards on
 * its own.
 */
export function hasSwatches(group: string): boolean {
  const prefix = `${group}.`
  return Object.keys(SWATCHES).some((k) => k.startsWith(prefix))
}

export function Swatch({ group, option }: { group: string; option: string }) {
  const art = SWATCHES[`${group}.${option}`]
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden
      className="block h-auto w-full"
    >
      {art ?? ground(PAPER)}
    </svg>
  )
}
