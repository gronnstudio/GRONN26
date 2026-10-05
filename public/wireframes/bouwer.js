/* De bouwer (zie bouwer.html). Eenvoudig gehouden: één staat-object in
   localStorage, alles opnieuw tekenen na elke wijziging. */
(() => {
  const KEY = 'gronn-bouwer'
  const STENEN = window.BOUWSTENEN || []
  const PER_ID = Object.fromEntries(STENEN.map((s) => [s.id, s]))
  const HOOGTE = { 1440: 900, 834: 1112, 390: 844 }
  const $ = (q) => document.querySelector(q)

  /* ── staat ─────────────────────────────────────────────────────────── */
  let staat
  try { staat = JSON.parse(localStorage.getItem(KEY)) } catch {}
  if (!staat || !Array.isArray(staat.paginas) || !staat.paginas.length) staat = { paginas: [{ naam: 'Voorpagina', blokken: [] }], actief: 0, breedte: 1440 }
  const bewaar = () => { try { localStorage.setItem(KEY, JSON.stringify(staat)) } catch {} }
  const pagina = () => staat.paginas[staat.actief] || staat.paginas[0]
  let gekozen = -1

  const { documentVoor, kader } = window.GRONN_KERN

  /* ── tekenen ───────────────────────────────────────────────────────── */
  function tekenTabs() {
    const t = $('#tabs'); t.innerHTML = ''
    staat.paginas.forEach((p, i) => {
      const b = document.createElement('button')
      b.className = 'tab'; b.type = 'button'; b.role = 'tab'
      b.setAttribute('aria-selected', String(i === staat.actief))
      b.textContent = `${p.naam} · ${p.blokken.length}`
      b.onclick = () => { staat.actief = i; gekozen = -1; bewaar(); alles() }
      t.appendChild(b)
    })
  }

  function tekenDoek() {
    const binnen = $('#doek-binnen'); binnen.innerHTML = ''
    const br = staat.breedte
    binnen.style.width = br + 'px'
    const beschikbaar = $('#doek').clientWidth - 40
    binnen.style.zoom = Math.min(1, beschikbaar / br)
    const p = pagina()
    if (!p.blokken.length) {
      binnen.innerHTML = `<div class="leeg"><strong>${p.naam} is nog leeg</strong>Kies links een bouwsteen en druk op ＋. Of begin rechts met het prototype.</div>`
      return
    }
    p.blokken.forEach((id, i) => {
      const s = PER_ID[id]
      const w = document.createElement('div')
      w.className = 'blok' + (i === gekozen ? ' gekozen' : '')
      w.id = 'blok-' + i
      w.appendChild(s ? kader(s, br) : Object.assign(document.createElement('p'), { className: 'leeg', textContent: `Bouwsteen "${id}" bestaat niet meer.` }))
      binnen.appendChild(w)
    })
  }

  function tekenLijst() {
    const l = $('#lijst'); l.innerHTML = ''
    const p = pagina()
    if (!p.blokken.length) { l.innerHTML = '<li style="grid-template-columns:1fr;color:var(--gedempt)">Nog niets. Gebruik ＋ in de bibliotheek.</li>'; return }
    p.blokken.forEach((id, i) => {
      const s = PER_ID[id] || { naam: id, groep: '?' }
      const li = document.createElement('li')
      if (i === gekozen) li.className = 'gekozen'
      li.innerHTML = `<span class="mono">${String(i + 1).padStart(2, '0')}</span>
        <button class="naam" type="button">${s.naam}<small>${s.groep} · ${s.bron ? 'uit ' + s.bron : ''}</small></button>
        <span class="acties">
          <button class="icoon" type="button" data-a="op" aria-label="Omhoog" ${i === 0 ? 'disabled' : ''}>↑</button>
          <button class="icoon" type="button" data-a="neer" aria-label="Omlaag" ${i === p.blokken.length - 1 ? 'disabled' : ''}>↓</button>
          <button class="icoon" type="button" data-a="dub" aria-label="Dupliceer">⧉</button>
          <button class="icoon" type="button" data-a="weg" aria-label="Verwijder">✕</button>
        </span>`
      li.querySelector('.naam').onclick = () => {
        gekozen = i; tekenLijst()
        document.querySelectorAll('.blok').forEach((b, j) => b.classList.toggle('gekozen', j === i))
        document.getElementById('blok-' + i)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      li.querySelectorAll('[data-a]').forEach((b) => b.onclick = () => {
        const a = b.dataset.a, bl = p.blokken
        if (a === 'op') { [bl[i - 1], bl[i]] = [bl[i], bl[i - 1]]; gekozen = i - 1 }
        if (a === 'neer') { [bl[i + 1], bl[i]] = [bl[i], bl[i + 1]]; gekozen = i + 1 }
        if (a === 'dub') { bl.splice(i + 1, 0, id); gekozen = i + 1 }
        if (a === 'weg') { bl.splice(i, 1); gekozen = -1 }
        bewaar(); tekenTabs(); tekenLijst(); tekenDoek()
      })
      l.appendChild(li)
    })
  }

  /* ── bibliotheek ───────────────────────────────────────────────────── */
  const GROEPEN = ['Alle', ...new Set(STENEN.map((s) => s.groep))]
  let groep = 'Alle'
  const kijker = new IntersectionObserver((items) => items.forEach((it) => {
    if (!it.isIntersecting) return
    const v = it.target; kijker.unobserve(v)
    const f = kader(PER_ID[v.dataset.id], 1440)
    f.removeAttribute('loading')
    f.style.transform = `scale(${v.clientWidth / 1440})`
    f.style.height = '820px'
    f.addEventListener('load', () => { f.style.height = '820px' })
    v.appendChild(f)
  }), { root: $('.bieb'), rootMargin: '300px' })

  function tekenGroepen() {
    const g = $('#groepen'); g.innerHTML = ''
    GROEPEN.forEach((n) => {
      const b = document.createElement('button')
      b.type = 'button'; b.className = 'knop' + (n === groep ? ' aan' : ''); b.textContent = n
      b.setAttribute('aria-pressed', String(n === groep))
      b.onclick = () => { groep = n; tekenGroepen(); tekenKaarten() }
      g.appendChild(b)
    })
  }
  function tekenKaarten() {
    const k = $('#kaarten'); k.innerHTML = ''
    const q = $('#zoek').value.trim().toLowerCase()
    const lijst = STENEN.filter((s) => (groep === 'Alle' || s.groep === groep) && (!q || `${s.naam} ${s.groep} ${s.bron} ${s.toel || ''}`.toLowerCase().includes(q)))
    let vorige = ''
    lijst.forEach((s) => {
      if (s.groep !== vorige && groep === 'Alle') { const h = document.createElement('p'); h.className = 'mono groep-titel'; h.textContent = s.groep; k.appendChild(h); vorige = s.groep }
      const c = document.createElement('article')
      c.className = 'kaart'
      c.innerHTML = `<div class="voorbeeld" data-id="${s.id}"></div>
        <div class="kaart-voet"><div><strong>${s.naam}</strong><small>${s.toel ? s.toel + ' · ' : ''}uit <a href="/wireframes/${s.bron}" target="_blank">${s.bron}</a></small></div>
        <button class="plus" type="button" aria-label="Voeg ${s.naam} toe aan ${pagina().naam}">＋</button></div>`
      c.querySelector('.plus').onclick = () => {
        pagina().blokken.push(s.id); gekozen = pagina().blokken.length - 1; bewaar(); tekenTabs(); tekenLijst(); tekenDoek()
        setTimeout(() => document.getElementById('blok-' + gekozen)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
      }
      k.appendChild(c)
      kijker.observe(c.querySelector('.voorbeeld'))
    })
    if (!lijst.length) k.innerHTML = '<p class="noot">Niets gevonden.</p>'
  }

  /* ── knoppen ───────────────────────────────────────────────────────── */
  function alles() { tekenTabs(); tekenLijst(); tekenDoek() }
  document.querySelectorAll('.toestel button').forEach((b) => {
    b.setAttribute('aria-pressed', String(+b.dataset.b === staat.breedte))
    b.onclick = () => {
      staat.breedte = +b.dataset.b; bewaar()
      document.querySelectorAll('.toestel button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
      tekenDoek()
    }
  })
  $('#nieuw-pagina').onclick = () => {
    const n = prompt('Naam van de nieuwe pagina', 'Nieuwe pagina'); if (!n) return
    staat.paginas.push({ naam: n, blokken: [] }); staat.actief = staat.paginas.length - 1; gekozen = -1; bewaar(); alles()
  }
  $('#hernoem').onclick = () => { const n = prompt('Nieuwe naam', pagina().naam); if (n) { pagina().naam = n; bewaar(); alles(); tekenKaarten() } }
  $('#dupliceer-pagina').onclick = () => { const p = pagina(); staat.paginas.splice(staat.actief + 1, 0, { naam: p.naam + ' (kopie)', blokken: [...p.blokken] }); staat.actief++; bewaar(); alles() }
  $('#wis-pagina').onclick = () => {
    if (staat.paginas.length === 1) { pagina().blokken = []; bewaar(); alles(); return }
    if (!confirm(`Pagina "${pagina().naam}" verwijderen?`)) return
    staat.paginas.splice(staat.actief, 1); staat.actief = Math.max(0, staat.actief - 1); gekozen = -1; bewaar(); alles()
  }
  $('#alles-wissen').onclick = () => { if (confirm('De hele site wissen?')) { staat = { paginas: [{ naam: 'Voorpagina', blokken: [] }], actief: 0, breedte: staat.breedte }; bewaar(); alles() } }
  $('#sjabloon').onclick = () => {
    if (staat.paginas.some((p) => p.blokken.length) && !confirm('Dit vervangt je huidige site door het prototype. Doorgaan?')) return
    const kop = 'kop-standaard', menu = 'menu-dock', voet = 'voet-colofon'
    staat.paginas = [
      { naam: 'Voorpagina', blokken: [kop, 'opening-kop-foto', 'foto-beeld', 'tekening-waterroute', 'over-kort', 'stappen-zes', 'kennis-vlak', voet, menu] },
      { naam: 'Vijvers', blokken: [kop, 'opening-pagina-kop', 'diensten-vijvers', 'foto-onderbreking', 'werk-blok-vijver', 'diensten-vraag', 'kennis-einde', voet, menu] },
      { naam: 'Tuinen', blokken: [kop, 'opening-tuinen', 'diensten-fase-1', 'kennis-einde', voet, menu] },
      { naam: 'Werk', blokken: [kop, 'werk-lijst-raster', voet, menu] },
      { naam: 'Project', blokken: [kop, 'opening-project-held', 'opening-project-titel', 'project-inleiding', 'project-uitspraak', 'project-cijfer', 'tekening-waterroute', 'project-inhoud', 'project-tabel', 'project-citaat', 'foto-slot', 'project-slot', voet, menu] },
      { naam: 'Over', blokken: [kop, 'over-verhaal', 'stappen-zes', 'kennis-einde', voet, menu] },
      { naam: 'Kennismaken', blokken: [kop, 'kennis-formulier', voet, menu] },
      { naam: 'FAQ', blokken: [kop, 'faq-vragen', 'kennis-einde', voet, menu] },
    ].map((p) => ({ ...p, blokken: p.blokken.filter((id) => PER_ID[id]) }))
    staat.actief = 0; gekozen = -1; bewaar(); alles()
  }
  $('#exporteer').onclick = () => {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(staat, null, 2)], { type: 'application/json' }))
    a.download = 'gronn-site-wireframe.json'; a.click()
  }
  $('#importeer').onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return
    try { const s = JSON.parse(await f.text()); if (!Array.isArray(s.paginas)) throw 0; staat = { breedte: 1440, actief: 0, ...s }; bewaar(); alles() }
    catch { alert('Dit bestand kan ik niet lezen.') }
    e.target.value = ''
  }
  $('#los').onclick = () => window.open(`/wireframes/bouwer-bekijk?p=${staat.actief}`, '_blank')
  $('#zoek').oninput = tekenKaarten
  addEventListener('keydown', (e) => { if (e.key === '/' && document.activeElement !== $('#zoek')) { e.preventDefault(); $('#zoek').focus() } })
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(tekenDoek, 200) })

  tekenGroepen(); tekenKaarten(); alles()
})()
