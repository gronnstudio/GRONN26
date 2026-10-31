"use client"

import { useCallback, useEffect, useState } from "react"

// Decoration must never compete with content for the main thread.
//
// This hook answers two questions for an element:
//   mount   — may the expensive thing be created yet? True once the page
//             has loaded AND the browser went idle AND the element is
//             near the viewport. Latches on: we never tear the thing
//             back down, only pause it.
//   visible — is it on screen right now? Drives pausing, so an
//             off-screen canvas stops burning frames.
//
// Measured motivation: home/mobile spent 6.4 s in script evaluation and
// 7.8 s of LCP render delay while the terrain booted during load
// (docs/perf/README.md).

function scheduleIdle(callback: () => void): () => void {
  type IdleWindow = typeof window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
    cancelIdleCallback?: (handle: number) => void
  }
  const w = window as IdleWindow

  const runWhenIdle = () => {
    let done = false
    const fireOnce = () => {
      if (done) return
      done = true
      callback()
    }

    // A plain timer is the backstop, because requestIdleCallback does
    // not fire at all in a background tab — without this, a page opened
    // in a background tab would never build its scene. Safari has no
    // requestIdleCallback either, so the timer is its only path.
    const timer = window.setTimeout(fireOnce, 1500)
    const handle =
      typeof w.requestIdleCallback === "function"
        ? w.requestIdleCallback(fireOnce, { timeout: 2500 })
        : undefined

    return () => {
      window.clearTimeout(timer)
      if (handle !== undefined) w.cancelIdleCallback?.(handle)
    }
  }

  if (document.readyState === "complete") return runWhenIdle()

  let cancelIdle: (() => void) | undefined
  const onLoad = () => {
    cancelIdle = runWhenIdle()
  }
  window.addEventListener("load", onLoad, { once: true })
  return () => {
    window.removeEventListener("load", onLoad)
    cancelIdle?.()
  }
}

export function useDeferredVisible<T extends HTMLElement>({
  rootMargin = "300px",
}: { rootMargin?: string } = {}) {
  // A callback ref, not useRef: callers commonly render nothing on the
  // first pass (waiting for hydration, capability probes, …), so the
  // node appears later. An effect keyed on a plain ref would have run
  // once against null and never observed anything.
  const [element, setElement] = useState<T | null>(null)
  const ref = useCallback((node: T | null) => setElement(node), [])
  const [idle, setIdle] = useState(false)
  const [near, setNear] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => scheduleIdle(() => setIdle(true)), [])

  useEffect(() => {
    if (!element) return

    // Two observers: a generous margin decides when it may be built, a
    // tight one decides whether it should be running.
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true)
          nearObserver.disconnect()
        }
      },
      { rootMargin }
    )
    const visibleObserver = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting)
    )
    nearObserver.observe(element)
    visibleObserver.observe(element)

    return () => {
      nearObserver.disconnect()
      visibleObserver.disconnect()
    }
  }, [element, rootMargin])

  return { ref, mount: idle && near, visible }
}
