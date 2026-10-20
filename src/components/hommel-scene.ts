import * as THREE from "three"

// Een aardhommel (Bombus terrestris) als klein 3D-model dat af en toe over de
// pagina vliegt (eigenaar, 20 okt 2026: "een hommel willekeurig door de
// webpagina ... verder weg, dan weer dichtbij", "verschillende hoeken",
// "vleugels moeten bewegen"). Geen foto: een model, zodat hij echt draait.
// Hij komt binnen, zwerft een tijd rond (soms even stil in de lucht), vliegt
// weg en komt later terug. Zolang hij weg is, wordt er niets getekend.

const ZWART = 0x17130f
const GEEL = 0xe8b530
const WIT = 0xf3eee2

/** Een band-textuur van kop naar staart: zwart, gele kraag, zwart, geel, zwart, witte staart. */
function banden(stops: [number, number][]) {
  const c = document.createElement("canvas")
  c.width = 128
  c.height = 256
  const g = c.getContext("2d")!
  for (let i = 0; i < stops.length; i++) {
    const [van, kleur] = stops[i]
    const tot = i + 1 < stops.length ? stops[i + 1][0] : 1
    g.fillStyle = `#${kleur.toString(16).padStart(6, "0")}`
    g.fillRect(0, van * 256, 128, (tot - van) * 256 + 1)
  }
  // korte haarstreepjes, zodat hij donzig oogt en de banden niet strak zijn
  for (let n = 0; n < 2600; n++) {
    const x = Math.random() * 128
    const y = Math.random() * 256
    const licht = Math.random() < 0.5
    g.strokeStyle = licht ? "rgba(255,240,200,0.18)" : "rgba(0,0,0,0.22)"
    g.beginPath()
    g.moveTo(x, y)
    g.lineTo(x + (Math.random() - 0.5) * 3, y + (Math.random() - 0.5) * 9)
    g.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function bouwHommel() {
  const hommel = new THREE.Group()
  const haar = (map: THREE.Texture) => new THREE.MeshStandardMaterial({ map, roughness: 1, metalness: 0 })
  const zwart = new THREE.MeshStandardMaterial({ color: ZWART, roughness: 0.9 })

  // achterlijf: polen langs z, v loopt van staart (0) naar voren (1)
  const lijfGeo = new THREE.SphereGeometry(0.5, 32, 24)
  lijfGeo.rotateX(-Math.PI / 2)
  const lijf = new THREE.Mesh(lijfGeo, haar(banden([[0, WIT], [0.26, ZWART], [0.5, GEEL], [0.66, ZWART]])))
  lijf.scale.set(0.82, 0.76, 1)
  lijf.position.z = -0.15
  hommel.add(lijf)

  // een zachte haarrand om lijf en borst: een iets grotere, half doorzichtige schil
  const dons = (bron: THREE.Mesh) => {
    const schil = new THREE.Mesh(bron.geometry, new THREE.MeshStandardMaterial({ map: (bron.material as THREE.MeshStandardMaterial).map, roughness: 1, transparent: true, opacity: 0.22, depthWrite: false }))
    schil.scale.copy(bron.scale).multiplyScalar(1.04)
    schil.position.copy(bron.position)
    hommel.add(schil)
  }
  dons(lijf)

  // borststuk met de gele kraag voorop
  const borstGeo = new THREE.SphereGeometry(0.34, 28, 20)
  borstGeo.rotateX(-Math.PI / 2)
  const borst = new THREE.Mesh(borstGeo, haar(banden([[0, ZWART], [0.62, GEEL]])))
  borst.position.set(0, 0.04, 0.42)
  hommel.add(borst)
  dons(borst)

  const kop = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 16), zwart)
  kop.scale.set(1, 0.9, 0.8)
  kop.position.set(0, -0.02, 0.76)
  hommel.add(kop)

  // voelsprieten en poten: dunne zwarte staafjes
  const staaf = (lengte: number, dikte = 0.018) => {
    const g = new THREE.CylinderGeometry(dikte, dikte * 0.7, lengte, 6)
    g.translate(0, lengte / 2, 0)
    return new THREE.Mesh(g, zwart)
  }
  for (const k of [-1, 1]) {
    const spriet = staaf(0.34, 0.014)
    spriet.position.set(k * 0.07, 0.08, 0.86)
    spriet.rotation.set(0.9, 0, k * -0.35)
    hommel.add(spriet)
    // poten: kort, naar achteren gevouwen, zoals in de vlucht
    for (const [z, hoek] of [[0.55, 0.3], [0.44, 0.6], [0.33, 0.9]] as const) {
      const poot = staaf(0.3, 0.022)
      poot.position.set(k * 0.15, -0.2, z)
      poot.rotation.set(Math.PI - 0.9 - hoek * 0.5, 0, k * 0.35)
      hommel.add(poot)
    }
  }

  // vleugels: doorzichtige ovalen op de rug, elk met een "naslag" voor bewegingsonscherpte
  const vorm = new THREE.Shape()
  vorm.absellipse(0, 0, 0.42, 0.15, 0, Math.PI * 2, false, 0)
  const vleugelGeo = new THREE.ShapeGeometry(vorm, 24)
  vleugelGeo.translate(0.42, 0, 0) // scharnier aan de binnenkant
  vleugelGeo.rotateX(-Math.PI / 2)
  const vleugelMat = (o: number) =>
    new THREE.MeshBasicMaterial({ color: 0xd9dde0, transparent: true, opacity: o, side: THREE.DoubleSide, depthWrite: false })
  const vleugels: { mesh: THREE.Mesh; kant: number; fase: number }[] = []
  for (const kant of [-1, 1]) {
    for (const [fase, o] of [[0, 0.42], [0.45, 0.18]] as const) {
      const v = new THREE.Mesh(vleugelGeo, vleugelMat(o))
      v.position.set(kant * 0.12, 0.3, 0.42)
      v.scale.x = kant
      v.rotation.y = kant * -0.35 // iets naar achteren gestreken
      hommel.add(v)
      vleugels.push({ mesh: v, kant, fase })
    }
  }
  return { hommel, vleugels }
}

export function startHommel(): () => void {
  const canvas = document.createElement("canvas")
  canvas.className = "hommel-doek"
  canvas.setAttribute("aria-hidden", "true")
  document.body.appendChild(canvas)

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  scene.add(new THREE.HemisphereLight(0xfff4e0, 0x5a4a38, 1.6))
  const zon = new THREE.DirectionalLight(0xffffff, 1.4)
  zon.position.set(3, 6, 8)
  scene.add(zon)

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  camera.position.set(0, 0, 10)

  const { hommel, vleugels } = bouwHommel()
  hommel.scale.setScalar(0.42)
  scene.add(hommel)

  const maat = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  maat()
  window.addEventListener("resize", maat)

  // halve breedte en hoogte van het beeld op diepte z
  const rand = (z: number) => {
    const hh = Math.tan((camera.fov * Math.PI) / 360) * (camera.position.z - z)
    return { x: hh * camera.aspect, y: hh }
  }
  const tussen = (a: number, b: number) => a + Math.random() * (b - a)
  const nieuwDoel = () => {
    const z = tussen(-12, 5.5)
    const r = rand(z)
    return new THREE.Vector3(tussen(-r.x, r.x) * 0.85, tussen(-r.y, r.y) * 0.8, z)
  }
  const buiten = () => {
    const z = tussen(-8, 3)
    const r = rand(z)
    const kant = Math.random() < 0.5 ? -1 : 1
    return new THREE.Vector3(kant * (r.x + 1.5), tussen(-r.y, r.y) * 0.6, z)
  }

  const pos = new THREE.Vector3()
  const snel = new THREE.Vector3()
  let doel = new THREE.Vector3()
  let fase: "weg" | "vliegt" | "zweeft" | "vertrekt" = "weg"
  let tot = performance.now() + 4000 // eerste bezoek na vier seconden
  let bezoekTot = 0
  let raf = 0
  let vorige = performance.now()
  const kijk = new THREE.Object3D()
  const wens = new THREE.Quaternion()

  const stap = (nu: number) => {
    raf = requestAnimationFrame(stap)
    const dt = Math.min((nu - vorige) / 1000, 0.05)
    vorige = nu

    if (fase === "weg") {
      if (nu < tot || document.hidden) return
      pos.copy(buiten())
      snel.set(0, 0, 0)
      doel = nieuwDoel()
      fase = "vliegt"
      bezoekTot = nu + tussen(18000, 30000)
      canvas.style.opacity = "1"
    }

    if (fase === "zweeft") {
      // stil in de lucht, licht wiebelend, en dan verder
      snel.multiplyScalar(0.9)
      pos.y += Math.sin(nu / 180) * 0.004
      if (nu > tot) {
        fase = nu > bezoekTot ? "vertrekt" : "vliegt"
        doel = fase === "vertrekt" ? buiten() : nieuwDoel()
      }
    } else {
      // sturen naar het doel, met een zoemerige slinger erdoorheen
      const naar = doel.clone().sub(pos)
      const afstand = naar.length()
      const max = fase === "vertrekt" ? 4.2 : 2.6
      naar.setLength(Math.min(max, afstand * 1.4))
      snel.lerp(naar, Math.min(1, dt * 1.6))
      snel.x += Math.sin(nu / 230) * 0.03
      snel.y += Math.cos(nu / 170) * 0.04
      if (afstand < 0.4) {
        if (fase === "vertrekt") {
          fase = "weg"
          tot = nu + tussen(25000, 50000)
          canvas.style.opacity = "0"
          renderer.clear()
          return
        }
        if (Math.random() < 0.45) {
          fase = "zweeft"
          tot = nu + tussen(800, 2200)
        } else doel = nieuwDoel()
      }
      if (fase === "vliegt" && nu > bezoekTot) {
        fase = "vertrekt"
        doel = buiten()
      }
    }
    pos.addScaledVector(snel, dt)
    hommel.position.copy(pos)

    // kijk in de vliegrichting (bij zweven: half naar de kijker), en hel over in bochten
    const richting = snel.lengthSq() > 0.05 ? snel.clone() : new THREE.Vector3(Math.sin(nu / 900), 0, 1)
    kijk.position.copy(pos)
    kijk.lookAt(pos.clone().add(richting))
    kijk.rotateZ(THREE.MathUtils.clamp(-snel.x * 0.12, -0.5, 0.5))
    kijk.rotateX(-0.15)
    wens.copy(kijk.quaternion)
    hommel.quaternion.slerp(wens, Math.min(1, dt * 5))

    // vleugelslag: snel, met de naslag een halve slag later
    const t = nu / 1000
    for (const v of vleugels) v.mesh.rotation.z = v.kant * (0.25 + Math.sin(t * 2 * Math.PI * 21 + v.fase * Math.PI) * 0.75)

    // scherptediepte: heel ver of heel dichtbij een beetje wazig
    const d = camera.position.z - pos.z
    const waas = d > 16 ? (d - 16) * 0.15 : d < 6 ? (6 - d) * 1.2 : 0
    canvas.style.filter = waas > 0.2 ? `blur(${waas.toFixed(1)}px)` : ""

    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(stap)

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener("resize", maat)
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose()
        const m = o.material as THREE.MeshStandardMaterial
        m.map?.dispose()
        m.dispose()
      }
    })
    renderer.dispose()
    canvas.remove()
  }
}
