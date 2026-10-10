"use client"

// Bewaart een slide op de telefoon via het deelmenu (iPhone: "Bewaar
// afbeelding"). Een gewone download opent op iOS het bestand in hetzelfde
// tabblad, zonder weg terug. Zonder deelmenu (desktop) gewoon downloaden.
export function Bewaar({ src, naam, label }: { src: string; naam: string; label: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        const blob = await (await fetch(src)).blob()
        const file = new File([blob], naam, { type: blob.type })
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file] }).catch(() => {})
          return
        }
        const a = document.createElement("a")
        a.href = URL.createObjectURL(blob)
        a.download = naam
        a.click()
        URL.revokeObjectURL(a.href)
      }}
      className="absolute bottom-1.5 right-1.5 flex size-[36px] items-center justify-center rounded-full bg-[#202020]/80 text-[16px] font-bold text-white"
    >
      <span aria-hidden>↓</span>
      <span className="sr-only">{label}</span>
    </button>
  )
}
