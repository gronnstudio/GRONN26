"use client"

import dynamic from "next/dynamic"

import { useDeferredVisible } from "@/lib/use-deferred-visible"
import { useHydrated } from "@/lib/use-hydrated"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { cn } from "@/lib/utils"

// 3D loads lazily and only where it earns its cost: WebGL available, no
// reduced-motion. Phones render a lighter tier (sparser mesh, capped DPR).
// Everywhere else this renders nothing and the page's static composition
// stands on its own — the 3D layer is an enhancement, never a dependency.
const TerrainScene = dynamic(
  () => import("./terrain-scene").then((m) => m.TerrainScene),
  { ssr: false }
)

// The probe is environmental and stable per session — computed once,
// cached at module level, read during render (no setState-in-effect).
let webglSupport: boolean | null = null
function supportsWebGL() {
  if (webglSupport === null) {
    try {
      const canvas = document.createElement("canvas")
      webglSupport = !!(
        canvas.getContext("webgl2") ?? canvas.getContext("webgl")
      )
    } catch {
      webglSupport = false
    }
  }
  return webglSupport
}

export function Terrain({
  mature = false,
  className,
}: {
  mature?: boolean
  className?: string
}) {
  const reduced = useReducedMotion()
  const hydrated = useHydrated()
  // The wrapper renders first and empty; the scene is built only once the
  // page has loaded, the browser is idle and this layer is near the
  // viewport — so three.js never competes with the hero text for the
  // main thread. Off screen, the frameloop stops entirely.
  const { ref, mount, visible } = useDeferredVisible<HTMLDivElement>()

  const ready = hydrated && !reduced && supportsWebGL()
  const lite = ready && !window.matchMedia("(min-width: 1024px)").matches

  if (!ready) return null

  return (
    <div ref={ref} aria-hidden className={cn("pointer-events-none", className)}>
      {mount && <TerrainScene mature={mature} lite={lite} paused={!visible} />}
    </div>
  )
}
