"use client"

import { useEffect, useMemo, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import * as THREE from "three"

// Procedural topographic field: a wireframe terrain slowly breathing and
// tilting toward the pointer. Not decorative tech-3D — it is the ground the
// rest of the page draws on: the hero shows it sparse, the closing CTA
// shows it mature (denser, greener), completing the ecological narrative.
// Kept deliberately cheap: one plane, basic material, capped DPR.

function Field({ mature, lite }: { mature: boolean; lite: boolean }) {
  const group = useRef<THREE.Group>(null)
  // Window-level pointer: the canvas wrapper is pointer-events-none (it's a
  // background layer), so R3F's own pointer state never updates.
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [])

  const geometry = useMemo(() => {
    const density = lite ? 40 : mature ? 72 : 56
    const g = new THREE.PlaneGeometry(34, 20, density, Math.round(density * 0.6))
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      // Layered sines read as rolling terrain without a noise dependency.
      const z =
        Math.sin(x * 0.32) * Math.cos(y * 0.45) * 1.1 +
        Math.sin(x * 0.85 + y * 0.35) * 0.4 +
        Math.cos(x * 0.12 - y * 0.2) * 0.7
      pos.setZ(i, z * (mature ? 1.15 : 1))
    }
    g.computeVertexNormals()
    return g
  }, [mature, lite])

  useFrame(({ clock }) => {
    const g = group.current
    if (!g) return
    const t = clock.elapsedTime
    // Slow drift + gentle pointer tilt (lerped so it never snaps).
    g.rotation.z = t * 0.015
    g.rotation.x = THREE.MathUtils.lerp(
      g.rotation.x,
      -1.25 + pointer.current.y * 0.06,
      0.05
    )
    g.rotation.y = THREE.MathUtils.lerp(
      g.rotation.y,
      pointer.current.x * 0.08,
      0.05
    )
    g.position.y = -2.4 + Math.sin(t * 0.25) * 0.15
  })

  return (
    <group ref={group} rotation={[-1.25, 0, 0]} position={[0, -2.4, 0]}>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          wireframe
          color={mature ? "#2e9d69" : "#197b4f"}
          transparent
          opacity={mature ? 0.4 : 0.25}
        />
      </mesh>
    </group>
  )
}

export function TerrainScene({
  mature = false,
  lite = false,
  paused = false,
}: {
  mature?: boolean
  lite?: boolean
  /** Off-screen: stop the render loop instead of animating unseen frames. */
  paused?: boolean
}) {
  return (
    <Canvas
      dpr={lite ? [1, 1.25] : [1, 1.5]}
      camera={{ position: [0, 2.4, 7.5], fov: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop={paused ? "never" : "always"}
    >
      <Field mature={mature} lite={lite} />
    </Canvas>
  )
}
