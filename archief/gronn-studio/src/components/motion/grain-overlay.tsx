// Fixed film-grain texture for cinematic depth over the flat dark sections.
// Static SVG turbulence as a tiled background-image; the jitter is a plain
// CSS steps() keyframe (see globals.css `grain-shift`) so it costs nothing
// beyond compositing and is automatically frozen by motion-reduce:.
const NOISE_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>
      <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter>
      <rect width='100%' height='100%' filter='url(#n)'/>
    </svg>`
  )

export function GrainOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 opacity-[0.05] mix-blend-overlay motion-safe:animate-[grain-shift_0.5s_steps(4)_infinite]"
      style={{ backgroundImage: `url("${NOISE_SVG}")`, backgroundSize: "120px 120px" }}
    />
  )
}
