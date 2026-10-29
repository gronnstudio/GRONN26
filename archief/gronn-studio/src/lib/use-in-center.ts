"use client"

import { useEffect, useRef, useState } from "react"

// True while the element crosses the middle band of the viewport (the
// central ~24%). The building block for scroll-linked highlighting: as the
// reader scrolls, whatever sits in the band is "in focus".
export function useInCenter<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [inCenter, setInCenter] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInCenter(entry.isIntersecting),
      { rootMargin: "-38% 0% -38% 0%" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return { ref, inCenter }
}
