/* Gedeeld door bouwer.html en bouwer-bekijk.html: een bouwsteen ophalen uit
   zijn bronwireframe en tonen in een kader dat meegroeit met de inhoud. */
(() => {
  const HOOGTE = { 1440: 900, 834: 1112, 390: 844 }
  /* ── bronnen ophalen en een stuk eruit knippen ────────────────────── */
  const bronnen = {}
  function bron(naam) {
    if (!bronnen[naam]) {
      bronnen[naam] = fetch(`/wireframes/${naam}.html`).then((r) => r.text()).then((t) => {
        const doc = new DOMParser().parseFromString(t, 'text/html')
        const kop = [...doc.head.querySelectorAll('style, link[rel="stylesheet"]')].map((e) => e.outerHTML).join('\n')
        return { doc, kop }
      })
    }
    return bronnen[naam]
  }
  async function documentVoor(steen) {
    const { doc, kop } = await bron(steen.bron)
    const el = doc.querySelector(steen.kies)
    let html = el ? el.outerHTML : `<p style="padding:24px;font-family:monospace">Niet gevonden: ${steen.bron} → ${steen.kies}</p>`
    if (steen.wrap) html = `<div class="wrap">${html}</div>`
    const extra = `<style>
      body{display:flow-root!important;padding:0!important;margin:0!important;min-height:0!important}
      .wv-paneel{display:none!important}
      ${steen.vast ? 'nav.dock,nav.km,.km-hoeken,header.balk,.vast{position:relative!important;inset:auto!important;bottom:auto!important;top:auto!important;margin:0 auto!important}body{padding:16px 0!important;overflow:hidden}nav.km{transform:none!important;width:max-content!important;left:auto!important;right:auto!important}nav.km:not(.licht) .km-pil a{color:#202020}' : ''}
    </style>`
    // Kies licht of donker zoals het weergavepaneel van de wireframes.
    const thema = `<script>try{var s=JSON.parse(localStorage.getItem('gronn-wf-weergave')||'{}'),u=new Date().getHours(),k=s.kleur||'auto';if(k==='donker'||(k==='auto'&&(u<7||u>=19)))document.documentElement.classList.add('wv-donker')}catch(e){}<\/script>`
    // Links in een bouwsteen openen niets: de bouwer is geen site.
    const stil = `<script>document.addEventListener('click',function(e){var a=e.target.closest('a');if(a){e.preventDefault()}},true)<\/script>`
    return `<!doctype html><html lang="nl" class="wv-beweging"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600&family=Montserrat:wght@400;500;600&family=Geist+Mono&display=swap" rel="stylesheet">
      ${kop}${extra}${thema}</head><body>${html}<script src="/wireframes/wf-weergave.js"><\/script>${stil}</body></html>`
  }

  /* Een kader dat meegroeit met zijn inhoud. */
  function kader(steen, breedte) {
    const f = document.createElement('iframe')
    f.title = steen.naam
    f.loading = 'lazy'
    f.style.height = (HOOGTE[breedte] || 900) + 'px'
    documentVoor(steen).then((html) => { f.srcdoc = html })
    f.addEventListener('load', () => {
      const d = f.contentDocument
      if (!d) return
      let n = 0
      const meet = () => {
        if (n++ > 8) return
        const h = Math.max(d.body.scrollHeight, 40)
        if (Math.abs(h - f.offsetHeight) > 2) f.style.height = h + 'px'
      }
      meet()
      setTimeout(meet, 300); setTimeout(meet, 1200)
      d.fonts && d.fonts.ready.then(meet)
      d.querySelectorAll('img').forEach((i) => i.addEventListener('load', meet))
    })
    return f
  }

  window.GRONN_KERN = { documentVoor, kader }
})()
