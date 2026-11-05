import qrcode from "qrcode-generator"

// Een QR-code als SVG, op de server getekend (ADR 0012): geen script in de
// browser, scherp bij printen en in de PDF. De bibliotheek leest tekens als
// losse bytes, dus de tekst gaat er als UTF-8 in.
export function Qr({ tekst, label, grootte = 132 }: { tekst: string; label: string; grootte?: number }) {
  const q = qrcode(0, "M")
  q.addData(Buffer.from(tekst, "utf8").toString("latin1"))
  q.make()
  const n = q.getModuleCount()
  let d = ""
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + 4} ${r + 4}h1v1h-1z`
  return (
    <svg role="img" aria-label={label} viewBox={`0 0 ${n + 8} ${n + 8}`} width={grootte} height={grootte} shapeRendering="crispEdges" className="block bg-white">
      <path d={d} fill="#202020" />
    </svg>
  )
}
