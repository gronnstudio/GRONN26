import * as THREE from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js"

// Een aardhommel (Bombus terrestris) als klein 3D-model dat af en toe over de
// pagina vliegt (eigenaar, 20 okt 2026: "een hommel willekeurig door de
// webpagina ... verder weg, dan weer dichtbij", "verschillende hoeken",
// "vleugels moeten bewegen"; 21 okt: "maak de hommel super realistisch").
// Geen foto: een model, zodat hij echt draait. Vacht in lagen (shell fur),
// geaderde rookbruine vleugels met een zweem regenboog, glanzende facetogen,
// geknikte voelsprieten, gelede poten met een stuifmeelklompje achteraan.
// Hij komt binnen, zwerft een tijd rond (soms even stil in de lucht), vliegt
// weg en komt later terug. Zolang hij weg is, wordt er niets getekend.

const ZWART = "#2b241d"
const GEEL = "#d9a23a" // oker, zoals de kraag van een aardhommel
const WIT = "#efe6d2" // de vuilwitte staart
const LAGEN = 20 // vachtlagen per lichaamsdeel

const doek = (b: number, h: number) => {
  const c = document.createElement("canvas")
  c.width = b
  c.height = h
  return [c, c.getContext("2d")!] as const
}

/** Kleurbanden van staart (boven) naar kop (onder), met zachte overgangen. */
function banden(stops: [number, string][]) {
  const [c, g] = doek(64, 256)
  const grad = g.createLinearGradient(0, 0, 0, 256)
  for (let i = 0; i < stops.length; i++) {
    const [van, kleur] = stops[i]
    const tot = i + 1 < stops.length ? stops[i + 1][0] : 1
    grad.addColorStop(Math.min(1, van + 0.015), kleur)
    grad.addColorStop(Math.max(0, tot - 0.015), kleur)
  }
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 256)
  // haren lopen over de bandranden heen en verschillen iets van kleur
  const bron = g.getImageData(0, 0, 64, 256).data
  for (let n = 0; n < 5000; n++) {
    const x = Math.random() * 64
    const y = Math.random() * 256
    const van = (Math.min(255, Math.max(0, Math.round(y + (Math.random() - 0.5) * 22))) * 64 + Math.floor(x)) * 4
    const f = 0.8 + Math.random() * 0.4
    g.strokeStyle = `rgb(${bron[van] * f},${bron[van + 1] * f},${bron[van + 2] * f})`
    g.lineWidth = 1
    g.beginPath()
    g.moveTo(x, y)
    g.lineTo(x + (Math.random() - 0.5) * 2, y + (Math.random() - 0.5) * 8)
    g.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Haardichtheid: elk stipje is een haar, de helderheid is zijn lengte. */
function harenKaart() {
  const [c, g] = doek(512, 512)
  g.fillStyle = "#000"
  g.fillRect(0, 0, 512, 512)
  for (let n = 0; n < 60000; n++) {
    const l = 110 + Math.random() * 145
    g.fillStyle = `rgb(${l},${l},${l})`
    g.beginPath()
    g.arc(Math.random() * 512, Math.random() * 512, 0.7 + Math.random() * 0.6, 0, Math.PI * 2)
    g.fill()
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(4, 7)
  return t
}

/** Rookbruin vleugelvlies met aders, vooral aan de voorrand en de basis, zoals bij een bij. */
function vleugelHuid() {
  const [c, g] = doek(512, 192)
  g.fillStyle = "rgba(92,74,52,0.22)"
  g.fillRect(0, 0, 512, 192)
  g.strokeStyle = "rgba(60,44,30,0.7)"
  g.lineCap = "round"
  const lijn = (w: number, ...p: number[]) => {
    g.lineWidth = w
    g.beginPath()
    g.moveTo(p[0], p[1])
    for (let i = 2; i < p.length; i += 4) g.quadraticCurveTo(p[i], p[i + 1], p[i + 2], p[i + 3])
    g.stroke()
  }
  // voorrand (costa) en het donkere randvlekje (stigma)
  lijn(4.5, 0, 40, 160, 22, 330, 30)
  g.fillStyle = "rgba(60,44,30,0.8)"
  g.beginPath()
  g.ellipse(300, 34, 22, 7, -0.05, 0, Math.PI * 2)
  g.fill()
  // lengteaders en dwarsaders die de cellen vormen
  lijn(2.4, 0, 70, 140, 64, 250, 78)
  lijn(2.1, 0, 112, 120, 112, 230, 128)
  lijn(1.8, 250, 78, 300, 62, 330, 30)
  lijn(1.8, 230, 128, 280, 110, 300, 72)
  lijn(1.6, 300, 72, 360, 66, 400, 48)
  lijn(1.6, 300, 72, 350, 98, 390, 92)
  lijn(1.4, 400, 48, 400, 70, 390, 92)
  lijn(1.4, 330, 30, 370, 34, 400, 48)
  lijn(1.4, 140, 64, 150, 90, 120, 112)
  lijn(1.3, 230, 128, 290, 150, 360, 140)
  lijn(1.3, 390, 92, 380, 120, 360, 140)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

/** Vleugelvorm met de scharnier in de oorsprong, lengte langs +x. */
function vleugelGeo(lengte: number, breedte: number) {
  const s = new THREE.Shape()
  s.moveTo(0, 0.02 * lengte)
  s.bezierCurveTo(0.3 * lengte, 0.12 * breedte, 0.75 * lengte, 0.55 * breedte, 0.97 * lengte, 0.32 * breedte)
  s.bezierCurveTo(1.04 * lengte, 0.1 * breedte, 1.0 * lengte, -0.32 * breedte, 0.8 * lengte, -0.42 * breedte)
  s.bezierCurveTo(0.5 * lengte, -0.52 * breedte, 0.18 * lengte, -0.3 * breedte, 0, -0.03 * lengte)
  const geo = new THREE.ShapeGeometry(s, 32)
  // uv: x langs de lengte, y van achterrand naar voorrand
  const p = geo.attributes.position
  const uv = geo.attributes.uv
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / lengte, 0.5 + p.getY(i) / (1.2 * breedte))
  geo.rotateX(-Math.PI / 2) // plat op de rug, voorrand naar voren (-y wordt +z)
  return geo
}

/** Losse haren als dunne gebogen lijntjes, in de kleur van de huid eronder:
 *  zij maken de rand pluizig, zoals bij een echte hommel tegen het licht. */
function haarStrengen(kern: THREE.Mesh, kleur: THREE.Texture, lengte: number, aantal: number) {
  const beeld = kleur.image as HTMLCanvasElement
  const px = beeld.getContext("2d", { willReadFrequently: true })!.getImageData(0, 0, beeld.width, beeld.height).data
  const monster = new MeshSurfaceSampler(kern).build()
  const p = new THREE.Vector3()
  const n = new THREE.Vector3()
  const uv = new THREE.Vector2()
  const kam = new THREE.Vector3(0, -0.3, -1).normalize().multiplyScalar(0.6)
  const punten: number[] = []
  const kleuren: number[] = []
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  for (let i = 0; i < aantal; i++) {
    monster.sample(p, n, undefined, uv)
    const l = lengte * (0.4 + Math.random() * 0.75)
    const krul = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.9)
    a.copy(p)
    b.copy(p).addScaledVector(n, l * 0.5).addScaledVector(kam, l * 0.18).addScaledVector(krul, l * 0.2)
    c.copy(b).addScaledVector(n, l * 0.3).addScaledVector(kam, l * 0.35).addScaledVector(krul, l * 0.45)
    punten.push(a.x, a.y, a.z, b.x, b.y, b.z, b.x, b.y, b.z, c.x, c.y, c.z)
    const x = Math.min(beeld.width - 1, Math.floor(uv.x * beeld.width))
    const y = Math.min(beeld.height - 1, Math.floor((1 - uv.y) * beeld.height))
    const k = (y * beeld.width + x) * 4
    const tint = new THREE.Color().setRGB(px[k] / 255, px[k + 1] / 255, px[k + 2] / 255, THREE.SRGBColorSpace)
    const voet = tint.clone().multiplyScalar(0.45)
    const midden = tint.clone().multiplyScalar(0.8)
    const punt = tint.clone().lerp(new THREE.Color(1, 0.97, 0.9), 0.12)
    for (const kl of [voet, midden, midden, punt]) kleuren.push(kl.r, kl.g, kl.b)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute("position", new THREE.Float32BufferAttribute(punten, 3))
  geo.setAttribute("color", new THREE.Float32BufferAttribute(kleuren, 3))
  return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.8 }))
}

function bouwHommel() {
  const hommel = new THREE.Group()
  const haren = harenKaart()

  /** Een lichaamsdeel met vacht: een kern plus LAGEN steeds grotere schillen
   *  waarin alleen de langere haren overblijven, iets naar achteren gekamd. */
  const harig = (geo: THREE.BufferGeometry, kleur: THREE.Texture, vacht: number, kam = 0.03, strengen = 0) => {
    const deel = new THREE.Group()
    const r = (geo.boundingSphere ?? (geo.computeBoundingSphere(), geo.boundingSphere!)).radius
    const kern = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: kleur, color: 0x777777, roughness: 1 }))
    deel.add(kern)
    if (strengen) deel.add(haarStrengen(kern, kleur, vacht * 1.05, strengen))
    for (let i = 1; i <= LAGEN; i++) {
      const h = i / LAGEN
      const laag = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
          map: kleur,
          alphaMap: haren,
          alphaTest: 0.3 + h * 0.66,
          transparent: false,
          roughness: 0.95,
          // onderin de vacht is het donker, de punten vangen licht
          color: new THREE.Color().setScalar(0.42 + h * 0.75),
          side: THREE.DoubleSide,
        }),
      )
      laag.scale.setScalar(1 + (h * vacht) / r)
      laag.position.z = -h * kam
      laag.position.y = -h * kam * 0.4
      deel.add(laag)
    }
    return deel
  }

  // achterlijf: zes ringen (tergieten) die als dakpannen over elkaar liggen, spits naar de staart
  const lijfGeo = new THREE.SphereGeometry(0.5, 56, 40)
  lijfGeo.rotateX(-Math.PI / 2)
  {
    const p = lijfGeo.attributes.position
    for (let i = 0; i < p.count; i++) {
      const z = p.getZ(i)
      const t = z + 0.5 // 0 = staart, 1 = voor
      const ring = 1 - 0.045 * Math.pow(1 - ((t * 5.5) % 1), 2)
      const spits = t < 0.3 ? 0.62 + (0.38 * t) / 0.3 : 1
      p.setXY(i, p.getX(i) * ring * spits, p.getY(i) * ring * spits)
    }
    lijfGeo.computeVertexNormals()
  }
  const lijf = harig(lijfGeo, banden([[0, WIT], [0.3, ZWART], [0.52, GEEL], [0.68, ZWART]]), 0.1, 0.03, 9000)
  lijf.scale.set(0.86, 0.78, 1.08)
  lijf.position.set(0, -0.06, -0.24)
  lijf.rotation.x = -0.22 // het achterlijf hangt iets omlaag
  hommel.add(lijf)

  // borststuk: rond en dicht behaard, gele kraag voorop
  const borstGeo = new THREE.SphereGeometry(0.33, 44, 32)
  borstGeo.rotateX(-Math.PI / 2)
  const borst = harig(borstGeo, banden([[0, ZWART], [0.6, GEEL]]), 0.1, 0.03, 6000)
  borst.scale.set(1.04, 0.96, 1)
  borst.position.set(0, 0.06, 0.36)
  hommel.add(borst)

  // kop: iets naar beneden gebogen, zwart behaard, met glanzende facetogen
  const kopGeo = new THREE.SphereGeometry(0.17, 32, 24)
  const kop = harig(kopGeo, banden([[0, ZWART]]), 0.05, 0.015, 500)
  kop.scale.set(1.1, 0.95, 0.75)
  kop.position.set(0, -0.08, 0.72)
  kop.rotation.x = 0.5
  hommel.add(kop)

  const chitine = new THREE.MeshPhysicalMaterial({ color: 0x0d0b09, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.15 })
  const oogMat = new THREE.MeshPhysicalMaterial({ color: 0x1c1712, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.3, sheen: 0.5, sheenColor: 0x6a5a40 })
  for (const k of [-1, 1]) {
    const oog = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 18), oogMat)
    oog.scale.set(0.32, 0.95, 0.5)
    oog.position.set(k * 0.155, -0.06, 0.74)
    oog.rotation.z = k * 0.2
    hommel.add(oog)
  }
  // kaken
  for (const k of [-1, 1]) {
    const kaak = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.05, 6), chitine)
    kaak.position.set(k * 0.03, -0.21, 0.8)
    kaak.rotation.set(Math.PI * 0.85, 0, k * 0.3)
    hommel.add(kaak)
  }

  // dunne gelede staafjes: voelsprieten en poten
  const staaf = (lengte: number, dikte: number, mat: THREE.Material = chitine) => {
    const g = new THREE.CylinderGeometry(dikte * 0.8, dikte, lengte, 8)
    g.translate(0, lengte / 2, 0)
    return new THREE.Mesh(g, mat)
  }
  /** Ketting van segmenten: elk volgend stuk hangt aan het eind van het vorige. */
  const ketting = (delen: [number, number, number, number?][], mat?: THREE.Material) => {
    const wortel = new THREE.Group()
    let ouder: THREE.Object3D = wortel
    let lengteVorige = 0
    for (const [lengte, dikte, knik, draai = 0] of delen) {
      const lid = new THREE.Group()
      lid.position.y = lengteVorige
      lid.rotation.set(knik, draai, 0)
      lid.add(staaf(lengte, dikte, mat))
      ouder.add(lid)
      ouder = lid
      lengteVorige = lengte
    }
    return wortel
  }

  const pootMat = new THREE.MeshStandardMaterial({ color: 0x1a1612, roughness: 0.8 })
  const stuifmeel = new THREE.MeshStandardMaterial({ color: 0xe0901e, roughness: 0.9 })
  for (const k of [-1, 1]) {
    // voelspriet: schacht, knik, en een zweep van kleine leedjes
    const spriet = ketting(
      [[0.12, 0.01, 0], [0.06, 0.008, 1.2], ...Array.from({ length: 5 }, () => [0.042, 0.007, 0.08] as [number, number, number])],
      chitine,
    )
    spriet.position.set(k * 0.045, 0.0, 0.82)
    spriet.rotation.set(0.15, 0, k * -0.45)
    hommel.add(spriet)

    // poten: dij, scheen en voet, in de vlucht naar achteren en onder het lijf
    const poten: [number, number, number][] = [
      [0.2, 0.52, 0.5],
      [0.24, 0.36, 0.8],
      [0.27, 0.2, 1.1],
    ]
    poten.forEach(([dij, z, hoek], i) => {
      const achter = i === 2
      const poot = ketting(
        [
          [dij, 0.02, 0],
          [dij * 1.1, achter ? 0.032 : 0.017, -1.3],
          [0.06, 0.01, 0.4],
          [0.05, 0.008, 0.25],
          [0.05, 0.007, 0.25],
        ],
        pootMat,
      )
      poot.position.set(k * 0.12, -0.16, z)
      poot.rotation.set(Math.PI + hoek, 0, k * 0.35)
      hommel.add(poot)
      if (achter) {
        // stuifmeelkorfje op de achterscheen
        const korf = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), stuifmeel)
        korf.scale.set(0.8, 1.3, 0.8)
        const scheen = poot.children[0].children[1]
        korf.position.set(0, dij * 0.6, 0.02)
        scheen.add(korf)
      }
    })
  }

  // vleugels: voor- en achtervleugel per kant, elk met drie naslagen voor bewegingsonscherpte
  const huid = vleugelHuid()
  const vleugelMat = (o: number) =>
    new THREE.MeshPhysicalMaterial({
      map: huid,
      transparent: true,
      opacity: o,
      side: THREE.DoubleSide,
      depthWrite: false,
      roughness: 0.15,
      metalness: 0,
      iridescence: 1,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [180, 520],
      clearcoat: 0.6,
    })
  const voor = vleugelGeo(0.92, 0.3)
  const achter = vleugelGeo(0.6, 0.2)
  const vleugels: { mesh: THREE.Object3D; kant: number; fase: number }[] = []
  for (const kant of [-1, 1]) {
    for (const [fase, o] of [[0, 1], [0.22, 0.32], [0.45, 0.2], [0.7, 0.12]] as const) {
      const scharnier = new THREE.Group()
      scharnier.position.set(kant * 0.13, 0.33, 0.44)
      for (const [geo, dz, dy] of [[voor, 0, 0], [achter, -0.07, -0.01]] as const) {
        const v = new THREE.Mesh(geo, vleugelMat(o))
        v.position.set(0, dy, dz)
        v.scale.x = kant
        v.rotation.y = kant * -0.42 // naar achteren gestreken
        scharnier.add(v)
      }
      hommel.add(scharnier)
      vleugels.push({ mesh: scharnier, kant, fase })
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
  renderer.toneMapping = THREE.NeutralToneMapping

  const scene = new THREE.Scene()
  // een zachte omgeving voor de glans op ogen en vleugels, plus warm zonlicht
  const pmrem = new THREE.PMREMGenerator(renderer)
  const omgeving = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = omgeving
  scene.environmentIntensity = 0.55
  scene.add(new THREE.HemisphereLight(0xfff1d6, 0x4a3c2c, 1.1))
  const zon = new THREE.DirectionalLight(0xfff0d8, 2.2)
  zon.position.set(3, 6, 8)
  scene.add(zon)
  const tegen = new THREE.DirectionalLight(0xffe2b0, 1.2) // tegenlicht door de haren
  tegen.position.set(-4, 3, -6)
  scene.add(tegen)

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  camera.position.set(0, 0, 10)

  const { hommel, vleugels } = bouwHommel()
  hommel.scale.setScalar(0.46)
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
  let tot = performance.now() + 500 // Hommel.tsx wacht al vier seconden met laden
  let bezoekTot = 0
  let raf = 0
  let vorige = performance.now()
  const kijk = new THREE.Object3D()
  const wens = new THREE.Quaternion()
  let schiet = 0 // volgende zijsprong: echte hommels zigzaggen als ze zoeken

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
      if (fase === "vliegt" && nu > schiet) {
        snel.add(new THREE.Vector3(tussen(-1, 1), tussen(-0.6, 0.6), tussen(-0.8, 0.8)).multiplyScalar(1.3))
        schiet = nu + tussen(350, 1100)
      }
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
    // een zware hommel trilt en deint in de lucht: kleine, onrustige schokjes bovenop de koers
    const s = nu / 1000
    hommel.position.set(
      pos.x + Math.sin(s * 7.3) * 0.025 + Math.sin(s * 17.9) * 0.008,
      pos.y + Math.sin(s * 9.1) * 0.035 + Math.sin(s * 23.3) * 0.01,
      pos.z + Math.sin(s * 6.1) * 0.02,
    )

    // kijk in de vliegrichting (bij zweven: half naar de kijker), en hel over in bochten;
    // hoe trager, hoe meer hij rechtop hangt, zoals een hommel die stil hangt
    const vaart = snel.length()
    const richting = vaart > 0.22 ? snel.clone() : new THREE.Vector3(Math.sin(nu / 900), 0, 1)
    kijk.position.copy(pos)
    kijk.lookAt(pos.clone().add(richting))
    kijk.rotateZ(THREE.MathUtils.clamp(-snel.x * 0.12, -0.5, 0.5))
    kijk.rotateX(-0.55 + Math.min(vaart, 3) * 0.14)
    kijk.rotateZ(Math.sin(s * 5.3) * 0.06) // wiebelen om de lengteas
    wens.copy(kijk.quaternion)
    hommel.quaternion.slerp(wens, Math.min(1, dt * 5))

    // vleugelslag: op en neer met een slag voor- en achteruit; de naslagen lopen achter
    const t = nu / 1000
    for (const v of vleugels) {
      const hoek = t * 2 * Math.PI * 21 - v.fase * 1.4
      v.mesh.rotation.z = v.kant * (0.2 + Math.sin(hoek) * 0.7)
      v.mesh.rotation.y = v.kant * Math.cos(hoek) * 0.35
    }

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
      if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) {
        o.geometry.dispose()
        const m = o.material as THREE.MeshStandardMaterial
        m.map?.dispose()
        m.alphaMap?.dispose()
        m.dispose()
      }
    })
    omgeving.dispose()
    pmrem.dispose()
    renderer.dispose()
    canvas.remove()
  }
}

/** Alleen voor een close-up bij het bijwerken van het model. */
export { bouwHommel as _bouwHommel }
