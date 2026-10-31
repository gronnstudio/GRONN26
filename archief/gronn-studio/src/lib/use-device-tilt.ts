"use client"

import { useEffect } from "react"
import { useMotionValue, useSpring, type MotionValue } from "framer-motion"

// Normalized left-right device tilt (gamma, clamped to -1..1 across
// ±30°), spring-smoothed and delivered as a MotionValue so consumers
// animate at sensor rate without React re-renders.
//
// iOS 13+ only emits deviceorientation after a permission grant that
// must happen inside a user gesture — the first touch anywhere asks
// once, and everything degrades silently to a static 0 when the API is
// missing or the request is denied. Pass disabled (reduced motion) to
// skip the sensor entirely.
export function useDeviceTilt(disabled = false): MotionValue<number> {
  const raw = useMotionValue(0)
  const smooth = useSpring(raw, { stiffness: 120, damping: 22, mass: 0.4 })

  useEffect(() => {
    if (disabled) {
      raw.set(0)
      return
    }

    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return
      raw.set(Math.max(-1, Math.min(1, e.gamma / 30)))
    }
    window.addEventListener("deviceorientation", onOrient)

    const DOE = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>
    }
    const ask =
      typeof DOE.requestPermission === "function"
        ? () => DOE.requestPermission!().catch(() => {})
        : null
    if (ask) window.addEventListener("touchend", ask, { once: true })

    return () => {
      window.removeEventListener("deviceorientation", onOrient)
      if (ask) window.removeEventListener("touchend", ask)
    }
  }, [disabled, raw])

  return smooth
}
