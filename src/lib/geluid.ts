// Geluid staat standaard uit (eigenaar, 5 okt 2026). Alleen met de schakelaar
// Geluid in Weergave aan, en nooit bij minder beweging. Bij het doek: een zacht
// windje door bladeren (gefilterde ruis die aanzwelt en wegsterft) met één
// kort vogelfluitje erbovenop. Gemaakt met Web Audio, dus geen bestand.
let ctx: AudioContext | null = null

export function toon() {
  const c = document.documentElement.classList
  if (!c.contains("geluid") || c.contains("stil") || matchMedia("(prefers-reduced-motion: reduce)").matches) return
  try {
    ctx ??= new AudioContext()
    const a = ctx
    const nu = a.currentTime

    // wind: twee seconden ruis door een bandfilter dat langzaam omhoog schuift
    const duur = 1.8
    const buf = a.createBuffer(1, a.sampleRate * duur, a.sampleRate)
    const d = buf.getChannelData(0)
    let laatst = 0
    for (let i = 0; i < d.length; i++) {
      laatst = (laatst + 0.02 * (Math.random() * 2 - 1)) / 1.02 // bruine ruis: zacht, geen sis
      d[i] = laatst * 3.5
    }
    const ruis = a.createBufferSource()
    ruis.buffer = buf
    const filter = a.createBiquadFilter()
    filter.type = "bandpass"
    filter.Q.value = 0.8
    filter.frequency.setValueAtTime(400, nu)
    filter.frequency.linearRampToValueAtTime(1400, nu + duur * 0.6)
    filter.frequency.linearRampToValueAtTime(700, nu + duur)
    const wg = a.createGain()
    wg.gain.setValueAtTime(0, nu)
    wg.gain.linearRampToValueAtTime(0.18, nu + 0.5)
    wg.gain.linearRampToValueAtTime(0, nu + duur)
    ruis.connect(filter).connect(wg).connect(a.destination)
    ruis.start(nu)

    // vogel: twee snelle glijtonen, heel zacht
    ;[0.55, 0.72].forEach((t0, i) => {
      const o = a.createOscillator()
      const g = a.createGain()
      const t = nu + t0
      o.type = "sine"
      o.frequency.setValueAtTime(i ? 3600 : 3200, t)
      o.frequency.exponentialRampToValueAtTime(i ? 4600 : 4200, t + 0.06)
      o.frequency.exponentialRampToValueAtTime(2800, t + 0.12)
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(0.025, t + 0.015)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)
      o.connect(g).connect(a.destination)
      o.start(t)
      o.stop(t + 0.16)
    })
  } catch {}
}
