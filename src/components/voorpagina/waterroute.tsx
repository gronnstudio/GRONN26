// De waterroute van WF-015/WF-025, letterlijk overgenomen; alleen de kleuren
// lopen via de tokens (inkt, gedempt, grond, salie), zodat de tekening ook
// in donker klopt. Tekst ín de vijvers blijft antraciet: salie is in beide
// weergaven licht.
const T = "fill-inkt text-[11px] tracking-[.06em]"
const NOOT = "fill-gedempt text-[10px] tracking-[.06em]"
const LIJN = "fill-none stroke-inkt [stroke-width:1]"
const VAK = "fill-grond stroke-inkt [stroke-width:1]"
const VIJVER = "fill-salie stroke-inkt [stroke-width:1]"
const IN_VIJVER = "fill-antraciet text-[11px] tracking-[.06em]"

export function Waterroute() {
  return (
    <svg className="h-auto w-full font-mono" viewBox="0 0 640 460" role="img" aria-labelledby="sys-titel">
      <title id="sys-titel">De waterroute: van vijver B via pomp en filter naar vijver A en de waterval, en via de beekloop terug.</title>
      {/* lijnen */}
      <path className={LIJN} d="M120 380 V300 H200" />
      <path className={LIJN} d="M260 300 H330" />
      <path className={LIJN} d="M410 300 H450 V190" />
      <path className={LIJN} d="M450 190 V110 H510" />
      <path className={LIJN} d="M450 190 H330 V130" />
      <path className={LIJN} d="M555 130 V400 H200" strokeDasharray="4 4" />
      <path className={LIJN} d="M230 105 H150 V366" strokeDasharray="4 4" />
      {/* onderdelen */}
      <ellipse className={VIJVER} cx="120" cy="400" rx="80" ry="34" />
      <text className={IN_VIJVER} x="82" y="404">VIJVER B</text>
      <rect className={VAK} x="200" y="285" width="60" height="30" />
      <text className={T} x="212" y="304">POMP</text>
      <rect className={VAK} x="330" y="280" width="80" height="40" />
      <text className={T} x="344" y="304">FILTER</text>
      <circle className="fill-inkt" cx="450" cy="190" r="4" />
      <text className={T} x="462" y="194">SPLITSING</text>
      <ellipse className={VIJVER} cx="300" cy="105" rx="70" ry="28" />
      <text className={IN_VIJVER} x="264" y="109">VIJVER A</text>
      <rect className={VAK} x="510" y="90" width="90" height="40" />
      <text className={T} x="522" y="114">WATERVAL</text>
      <text className={NOOT} x="565" y="300">BEEKLOOP</text>
      {/* annotaties */}
      <text className={NOOT} x="200" y="272">AQUAFORTE DM-10000 VARIO S</text>
      <text className={NOOT} x="330" y="340">3 KAMERS · BYPASS</text>
      <text className={NOOT} x="340" y="182">50 MM DRUK-PVC</text>
      <text className={NOOT} x="462" y="212">2 TAKKEN</text>
      <text className={NOOT} x="462" y="226">REGELBAAR</text>
      <text className={NOOT} x="20" y="40">WATERROUTE · SCHEMATISCH</text>
    </svg>
  )
}
