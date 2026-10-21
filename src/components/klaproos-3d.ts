import * as THREE from "three"

// Een klaproos (Papaver rhoeas) in 3D, om de hommel op te laten landen
// (eigenaar, 21 okt 2026: "ook die bloem in 3D maakt het gaaf"). Vier
// komvormige kroonbladen met een zwarte vlek aan de voet en fijne aders, een
// groen vruchtbeginsel met de donkere stempelschijf, een krans meeldraden,
// een behaarde stengel en een knikkende knop. De voet van de stengel staat
// op (0, 0, 0); het hart van de bloem ligt op HART.

export const HART = new THREE.Vector3(0.05, 2.6, 0)

const doek = (b: number, h: number) => {
  const c = document.createElement("canvas")
  c.width = b
  c.height = h
  return [c, c.getContext("2d")!] as const
}

/** Kroonblad: scharlakenrood, donkerder naar de voet, zwarte vlek, aders. */
function bladHuid() {
  const [c, g] = doek(256, 256)
  const r = g.createRadialGradient(128, 256, 10, 128, 220, 260)
  r.addColorStop(0, "#7d0f0c")
  r.addColorStop(0.25, "#c8180f")
  r.addColorStop(0.7, "#e2321c")
  r.addColorStop(1, "#ec4a2a")
  g.fillStyle = r
  g.fillRect(0, 0, 256, 256)
  // de zwarte vlek aan de voet, met een rafelige rand
  g.fillStyle = "#120a0a"
  g.beginPath()
  for (let i = 0; i <= 40; i++) {
    const a = Math.PI + (i / 40) * Math.PI
    const s = 64 + Math.sin(i * 1.7) * 6 + Math.random() * 5
    g.lineTo(128 + Math.cos(a) * s, 256 + Math.sin(a) * s * 0.9)
  }
  g.fill()
  // fijne aders die vanaf de voet uitwaaieren
  g.strokeStyle = "rgba(120,10,8,0.35)"
  g.lineWidth = 1.2
  for (let i = 0; i < 46; i++) {
    const a = Math.PI * 1.08 + (i / 45) * Math.PI * 0.84
    g.beginPath()
    g.moveTo(128, 250)
    g.quadraticCurveTo(128 + Math.cos(a) * 90, 250 + Math.sin(a) * 120, 128 + Math.cos(a) * 190, 250 + Math.sin(a) * 260)
    g.stroke()
  }
  // zijdeachtige kreukels
  for (let i = 0; i < 900; i++) {
    g.fillStyle = `rgba(${Math.random() < 0.5 ? "255,120,90" : "110,8,6"},0.05)`
    g.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 6 + Math.random() * 10)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Een kroonblad als komvormig, golvend vlak; de voet ligt in de oorsprong. */
function kroonblad(breed: number, lang: number) {
  const geo = new THREE.PlaneGeometry(breed, lang, 24, 24)
  geo.translate(0, lang / 2 + 0.03, 0)
  const p = geo.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    const v = Math.min(1, Math.max(0, (y - 0.03) / lang)) // 0 = voet, 1 = rand
    const u = x / (breed / 2) // -1 .. 1
    // smal aan de voet, breed in het midden en rond aan de rand
    const vorm = Math.pow(Math.sin(Math.PI * (0.04 + 0.92 * v)), 0.55) * (0.55 + 0.45 * v)
    const nx = x * vorm
    // kom: de zijkanten en de rand buigen omhoog; de rand golft
    const kom = u * u * 0.16 * breed * v + v * v * 0.22 * lang
    const golf = Math.sin(u * 7 + v * 3) * 0.035 * v * lang
    p.setXYZ(i, nx, y * (1 - u * u * 0.08), kom + golf)
  }
  geo.computeVertexNormals()
  return geo
}

export function bouwKlaproos() {
  const plant = new THREE.Group()
  const stengelMat = new THREE.MeshStandardMaterial({ color: 0x5f7d3a, roughness: 0.8 })

  // stengel: lichte boog, smal
  const boog = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.08, 0.9, 0.02),
    new THREE.Vector3(-0.02, 1.8, 0),
    new THREE.Vector3(HART.x, HART.y + 0.02, 0),
  ])
  plant.add(new THREE.Mesh(new THREE.TubeGeometry(boog, 40, 0.028, 8), stengelMat))
  // afstaande haartjes op de stengel
  const haar: number[] = []
  for (let i = 0; i < 260; i++) {
    const t = Math.random()
    const p = boog.getPoint(t)
    const a = Math.random() * Math.PI * 2
    const d = new THREE.Vector3(Math.cos(a), 0.4, Math.sin(a)).normalize()
    p.addScaledVector(d, 0.025)
    haar.push(p.x, p.y, p.z, p.x + d.x * 0.06, p.y + d.y * 0.06, p.z + d.z * 0.06)
  }
  const haarGeo = new THREE.BufferGeometry()
  haarGeo.setAttribute("position", new THREE.Float32BufferAttribute(haar, 3))
  plant.add(new THREE.LineSegments(haarGeo, new THREE.LineBasicMaterial({ color: 0x9bb07a, transparent: true, opacity: 0.6 })))

  // bloem
  const bloem = new THREE.Group()
  bloem.position.copy(HART)
  bloem.rotation.set(-0.35, 0, 0.12) // iets naar voren geknikt
  plant.add(bloem)
  const huid = bladHuid()
  const bladMat = new THREE.MeshPhysicalMaterial({
    map: huid,
    side: THREE.DoubleSide,
    roughness: 0.55,
    sheen: 1,
    sheenColor: new THREE.Color(0xff6a4a),
    sheenRoughness: 0.4,
    transmission: 0.25,
    thickness: 0.05,
  })
  const groot = kroonblad(0.95, 0.75)
  const klein = kroonblad(0.8, 0.66)
  for (let i = 0; i < 4; i++) {
    const blad = new THREE.Mesh(i % 2 ? klein : groot, bladMat)
    const houder = new THREE.Group()
    houder.rotation.y = (i * Math.PI) / 2 + 0.2
    blad.rotation.x = -Math.PI / 2 + (i % 2 ? 0.42 : 0.3) // schuin omhoog, kommetje
    blad.position.y = i % 2 ? 0.035 : 0
    houder.add(blad)
    bloem.add(houder)
  }
  // vruchtbeginsel met stempelschijf
  const vrucht = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 20, 14),
    new THREE.MeshStandardMaterial({ color: 0x8aa05a, roughness: 0.6 }),
  )
  vrucht.scale.set(1, 1.15, 1)
  vrucht.position.y = 0.1
  bloem.add(vrucht)
  const schijf = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.075, 0.014, 18),
    new THREE.MeshStandardMaterial({ color: 0x2a2030, roughness: 0.7 }),
  )
  schijf.position.y = 0.195
  bloem.add(schijf)
  // krans meeldraden: donkere draadjes met blauwzwarte helmknopjes
  const draad: number[] = []
  const knopGeo = new THREE.SphereGeometry(0.011, 6, 4)
  const knopMat = new THREE.MeshStandardMaterial({ color: 0x1d1a2a, roughness: 0.5 })
  const knoppen = new THREE.InstancedMesh(knopGeo, knopMat, 90)
  const m = new THREE.Matrix4()
  for (let i = 0; i < 90; i++) {
    const a = (i / 90) * Math.PI * 2 + Math.random() * 0.1
    const r0 = 0.09
    const r1 = 0.15 + Math.random() * 0.06
    const h = 0.14 + Math.random() * 0.05
    draad.push(Math.cos(a) * r0, 0.04, Math.sin(a) * r0, Math.cos(a) * r1, h, Math.sin(a) * r1)
    m.makeTranslation(Math.cos(a) * r1, h, Math.sin(a) * r1)
    knoppen.setMatrixAt(i, m)
  }
  const draadGeo = new THREE.BufferGeometry()
  draadGeo.setAttribute("position", new THREE.Float32BufferAttribute(draad, 3))
  bloem.add(new THREE.LineSegments(draadGeo, new THREE.LineBasicMaterial({ color: 0x241820 })))
  bloem.add(knoppen)

  // knikkende, behaarde knop op een eigen steeltje
  const knopBoog = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.02, 1.0, 0),
    new THREE.Vector3(0.35, 1.6, 0.05),
    new THREE.Vector3(0.48, 1.95, 0.05),
    new THREE.Vector3(0.52, 1.82, 0.05),
  ])
  plant.add(new THREE.Mesh(new THREE.TubeGeometry(knopBoog, 24, 0.02, 6), stengelMat))
  const knop = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshStandardMaterial({ color: 0x6f8a45, roughness: 0.75 }))
  knop.scale.set(0.85, 1.35, 0.85)
  knop.position.set(0.52, 1.72, 0.05)
  knop.rotation.z = 0.25
  plant.add(knop)

  /** Zacht wiegen in de wind; t in seconden. */
  const wieg = (t: number) => {
    plant.rotation.z = Math.sin(t * 0.7) * 0.025 + Math.sin(t * 1.9) * 0.008
    bloem.rotation.z = 0.12 + Math.sin(t * 1.3 + 1) * 0.04
  }
  return { plant, wieg }
}
