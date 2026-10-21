import * as THREE from "three"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"
import { bouwKlaproos, HART } from "./klaproos-3d"

// De linker margebloem als echte 3D-klaproos (eigenaar, 21 okt 2026: "ook die
// bloem in 3D maakt het gaaf"). Een klein eigen canvas op de plek van de foto;
// de foto blijft staan als terugval. Het canvas draagt data-landing op het
// hart van de bloem, zodat de hommel er net zo op landt als op de foto.
// Getekend wordt alleen als de bloem in beeld is, op 30 beelden per seconde.

export function startKlaproos(vak: HTMLElement): () => void {
  const canvas = document.createElement("canvas")
  canvas.className = "plant hommel-bloem hommel-bloem-links hommel-bloem-3d"
  canvas.setAttribute("aria-hidden", "true")
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power", failIfMajorPerformanceCaveat: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NeutralToneMapping

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const omgeving = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = omgeving
  scene.environmentIntensity = 0.55
  scene.add(new THREE.HemisphereLight(0xfff1d6, 0x4a3c2c, 1.1))
  const zon = new THREE.DirectionalLight(0xfff0d8, 2.2)
  zon.position.set(3, 6, 8)
  scene.add(zon)
  const tegen = new THREE.DirectionalLight(0xffe2b0, 1.4) // tegenlicht door de kroonbladen
  tegen.position.set(-3, 4, -6)
  scene.add(tegen)

  const { plant, wieg } = bouwKlaproos()
  scene.add(plant)
  // even breed als de foto (348 × 640): de plant vult de hoogte
  const camera = new THREE.PerspectiveCamera(23, 348 / 640, 0.1, 50)
  camera.position.set(0.05, 1.55, 8)
  camera.lookAt(0.05, 1.55, 0)
  camera.updateMatrixWorld()
  const hart = HART.clone().add(new THREE.Vector3(0, 0.12, 0)).project(camera)
  canvas.setAttribute("data-landing", `${((hart.x + 1) / 2).toFixed(3)},${((1 - hart.y) / 2).toFixed(3)}`)

  vak.appendChild(canvas)
  vak.classList.add("drie-d")

  let breed = 0
  let hoog = 0
  let zichtbaar = false
  const kijk = new IntersectionObserver(([i]) => (zichtbaar = i.isIntersecting))
  kijk.observe(canvas)
  let raf = 0
  let vorige = 0
  const stap = (nu: number) => {
    raf = requestAnimationFrame(stap)
    if (!zichtbaar || document.hidden || vak.classList.contains("weg") || nu - vorige < 33) return
    vorige = nu
    const r = canvas.getBoundingClientRect()
    if (!r.width) return
    if (r.width !== breed || r.height !== hoog) {
      breed = r.width
      hoog = r.height
      renderer.setSize(breed, hoog, false)
    }
    wieg(nu / 1000)
    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(stap)

  return () => {
    cancelAnimationFrame(raf)
    kijk.disconnect()
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments || o instanceof THREE.InstancedMesh) {
        o.geometry.dispose()
        const m = o.material as THREE.MeshStandardMaterial
        m.map?.dispose()
        m.dispose()
      }
    })
    omgeving.dispose()
    pmrem.dispose()
    renderer.dispose()
    canvas.remove()
    vak.classList.remove("drie-d")
  }
}
