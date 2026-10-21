"use client"

/** Print de bon; in het printvenster kies je ook "Opslaan als pdf". */
export function Print() {
  return (
    <button type="button" onClick={() => window.print()} className="knop self-start bg-oranje text-antraciet focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inkt">
      Printen of opslaan als pdf
    </button>
  )
}
