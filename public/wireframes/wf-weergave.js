/*
  WF-026 — Weergave en toegankelijkheid.

  Eén knop rechtsboven met een regelaar-icoon opent één paneel met twee
  groepen: Kleur (Auto · Licht · Donker) en Toegankelijkheid (minder
  beweging, grotere tekst, meer contrast, links onderstrepen). De keuzes
  gelden direct, op elke pagina, en blijven bewaard in deze browser.

  Gebruik: zet <button data-weergave-knop></button> in de kop en laad dit
  script. ?paneel=open opent het paneel meteen (voor de naslag).
*/
(() => {
  const KEY = 'gronn-wf-weergave'
  const STANDAARD = { kleur: 'auto', beweging: false, groot: false, contrast: false, onderstreep: false }
  let stand = { ...STANDAARD }
  try { stand = { ...STANDAARD, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch {}

  /* ── stijl: alleen grijs, ook in donker ─────────────────────────── */
  const css = `
  .regelaar{all:unset;box-sizing:border-box;width:44px;height:44px;display:grid;place-items:center;border-radius:999px;cursor:pointer;color:inherit}
  .regelaar:hover{background:rgba(127,127,127,.15)}
  .regelaar:focus-visible{outline:2px solid currentColor;outline-offset:2px}
  .regelaar[aria-expanded="true"]{background:rgba(127,127,127,.2)}
  .wv-paneel{position:fixed;top:72px;right:clamp(12px,4vw,56px);z-index:200;width:320px;max-width:calc(100vw - 24px);background:var(--wv-bg,#EFEEEA);color:var(--wv-ink,#202020);border:1px solid var(--wv-lijn,rgba(0,0,0,.15));box-shadow:0 24px 60px -30px rgba(0,0,0,.45);padding:20px;font-family:Montserrat,sans-serif;font-size:14px}
  .wv-paneel[hidden]{display:none}
  .wv-kop{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
  .wv-kop strong{font-size:15px;font-weight:600}
  .wv-sluit{all:unset;cursor:pointer;width:32px;height:32px;display:grid;place-items:center;border-radius:999px}
  .wv-sluit:focus-visible{outline:2px solid currentColor}
  .wv-groep{border:0;margin:0 0 18px;padding:0}
  .wv-groep legend{font-family:Montserrat,sans-serif;font-size:11px;letter-spacing:.06em;text-transform:uppercase;opacity:.7;margin-bottom:10px;padding:0}
  .wv-seg{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--wv-lijn,rgba(0,0,0,.2));border-radius:999px;padding:3px}
  .wv-seg label{text-align:center;padding:8px 0;border-radius:999px;cursor:pointer;font-size:13px;font-weight:500}
  .wv-seg input{position:absolute;opacity:0;pointer-events:none}
  .wv-seg label:has(input:checked){background:var(--wv-ink,#202020);color:var(--wv-bg,#EFEEEA)}
  .wv-seg label:has(input:focus-visible){outline:2px solid var(--wv-ink,#202020);outline-offset:2px}
  .wv-uitleg{margin:8px 0 0;font-size:12px;opacity:.7}
  .wv-rij{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--wv-lijn,rgba(0,0,0,.12));cursor:pointer}
  .wv-rij:last-child{border-bottom:1px solid var(--wv-lijn,rgba(0,0,0,.12))}
  .wv-rij input{appearance:none;-webkit-appearance:none;margin:0;flex:none;width:40px;height:24px;border-radius:999px;background:rgba(127,127,127,.35);position:relative;cursor:pointer;transition:background .2s}
  .wv-rij input::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#EFEEEA;transition:transform .2s}
  .wv-rij input:checked{background:var(--wv-ink,#202020)}
  .wv-rij input:checked::after{transform:translateX(16px);background:var(--wv-bg,#EFEEEA)}
  .wv-rij input:focus-visible{outline:2px solid var(--wv-ink,#202020);outline-offset:2px}
  .wv-reset{all:unset;cursor:pointer;font-family:Montserrat,sans-serif;font-size:11px;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid currentColor;margin-top:4px}
  @media (max-width:767px){.wv-paneel{top:auto;bottom:84px;left:12px;right:12px;width:auto}}

  /* de keuzes zelf */
  html.wv-donker{--wv-bg:#202020;--wv-ink:#EFEEEA;--wv-lijn:rgba(255,255,255,.18);--ink:#EFEEEA;--muted:#A9A8A3;--ph:#333331;--lijn:rgba(255,255,255,.18);color-scheme:dark}
  html.wv-donker .ph{color:#A9A8A3}
  html.wv-donker body{background:#202020;color:#EFEEEA}
  html.wv-donker .tekening text{fill:#EFEEEA}html.wv-donker .tekening .noot{fill:#A9A8A3}
  html.wv-donker .tekening .lijn{stroke:#EFEEEA}html.wv-donker .tekening .vak{fill:#202020;stroke:#EFEEEA}html.wv-donker .tekening .vijver{fill:#23483A;stroke:#EFEEEA}
  html.wv-donker .kennis{background:#23483A}
  html.wv-donker .cta,html.wv-donker .knop{color:#202020}
  html.wv-groot main{zoom:1.15}
  html.wv-contrast{--muted:var(--ink);--lijn:currentColor}
  html.wv-contrast .muted{color:inherit !important;opacity:1}
  html.wv-onderstreep main a{text-decoration:underline !important;text-underline-offset:3px}
  html.wv-beweging *,html.wv-beweging *::before,html.wv-beweging *::after{transition:none !important;animation:none !important;scroll-behavior:auto !important}
  `
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)

  const html = document.documentElement
  const klokDonker = () => { const u = new Date().getHours(); return u < 7 || u >= 19 }
  function pasToe() {
    const donker = stand.kleur === 'donker' || (stand.kleur === 'auto' && klokDonker())
    html.classList.toggle('wv-donker', donker)
    html.classList.toggle('wv-beweging', stand.beweging)
    html.classList.toggle('wv-groot', stand.groot)
    html.classList.toggle('wv-contrast', stand.contrast)
    html.classList.toggle('wv-onderstreep', stand.onderstreep)
    try { localStorage.setItem(KEY, JSON.stringify(stand)) } catch {}
  }
  pasToe()

  const knop = document.querySelector('[data-weergave-knop]')
  if (!knop) return
  knop.className = 'regelaar'
  knop.type = 'button'
  knop.setAttribute('aria-label', 'Weergave en toegankelijkheid')
  knop.setAttribute('aria-expanded', 'false')
  knop.setAttribute('aria-controls', 'wv-paneel')
  /* het regelaar-icoon: drie schuiven */
  knop.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 5h14M3 10h14M3 15h14"/><circle cx="7" cy="5" r="2" fill="var(--wv-bg,#EFEEEA)"/><circle cx="13" cy="10" r="2" fill="var(--wv-bg,#EFEEEA)"/><circle cx="9" cy="15" r="2" fill="var(--wv-bg,#EFEEEA)"/></svg>'

  const paneel = document.createElement('div')
  paneel.id = 'wv-paneel'
  paneel.className = 'wv-paneel'
  paneel.setAttribute('role', 'dialog')
  paneel.setAttribute('aria-label', 'Weergave en toegankelijkheid')
  paneel.hidden = true
  const kleur = (w, t) => `<label><input type="radio" name="wv-kleur" value="${w}" ${stand.kleur === w ? 'checked' : ''}>${t}</label>`
  const schakel = (k, t) => `<label class="wv-rij"><span>${t}</span><input type="checkbox" role="switch" data-k="${k}" ${stand[k] ? 'checked' : ''}></label>`
  paneel.innerHTML = `
    <div class="wv-kop"><strong>Weergave</strong><button class="wv-sluit" type="button" aria-label="Sluiten">✕</button></div>
    <fieldset class="wv-groep"><legend>Kleur</legend>
      <div class="wv-seg">${kleur('auto', 'Auto')}${kleur('licht', 'Licht')}${kleur('donker', 'Donker')}</div>
      <p class="wv-uitleg">Auto: licht overdag, donker vanaf 19.00 uur.</p>
    </fieldset>
    <fieldset class="wv-groep"><legend>Toegankelijkheid</legend>
      ${schakel('beweging', 'Minder beweging')}${schakel('groot', 'Grotere tekst')}${schakel('contrast', 'Meer contrast')}${schakel('onderstreep', 'Links onderstrepen')}
    </fieldset>
    <button class="wv-reset" type="button">Standaard herstellen</button>`
  document.body.appendChild(paneel)

  const open = (ja) => {
    paneel.hidden = !ja
    knop.setAttribute('aria-expanded', String(ja))
    if (ja) paneel.querySelector('input:checked, input')?.focus()
    else knop.focus({ preventScroll: true })
  }
  knop.addEventListener('click', () => open(paneel.hidden))
  paneel.querySelector('.wv-sluit').addEventListener('click', () => open(false))
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !paneel.hidden) open(false) })
  document.addEventListener('click', (e) => { if (!paneel.hidden && !paneel.contains(e.target) && !knop.contains(e.target)) open(false) })
  paneel.addEventListener('change', (e) => {
    const t = e.target
    if (t.name === 'wv-kleur') stand.kleur = t.value
    if (t.dataset.k) stand[t.dataset.k] = t.checked
    pasToe()
  })
  paneel.querySelector('.wv-reset').addEventListener('click', () => {
    stand = { ...STANDAARD }
    paneel.querySelectorAll('input').forEach((i) => { i.checked = i.type === 'radio' ? i.value === 'auto' : false })
    pasToe()
  })
  if (new URLSearchParams(location.search).get('paneel') === 'open') open(true)
})()
