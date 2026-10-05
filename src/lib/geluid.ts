// Geluid staat standaard uit (eigenaar, 5 okt 2026). Alleen met de schakelaar
// Geluid in Weergave aan, en nooit bij minder beweging: één zachte, korte toon
// bij de paginawissel. Gemaakt met Web Audio, dus geen bestand.
let ctx: AudioContext | null = null

export function toon() {
  const c = document.documentElement.classList
  if (!c.contains("geluid") || c.contains("stil") || matchMedia("(prefers-reduced-motion: reduce)").matches) return
  try {
    ctx ??= new AudioContext()
    const nu = ctx.currentTime
    ;[392, 587.33].forEach((hz, i) => {
      const o = ctx!.createOscillator()
      const g = ctx!.createGain()
      o.type = "sine"
      o.frequency.value = hz
      const t = nu + i * 0.09
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.05, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7)
      o.connect(g).connect(ctx!.destination)
      o.start(t)
      o.stop(t + 0.75)
    })
  } catch {}
}
