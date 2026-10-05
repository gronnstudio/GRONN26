// Het bestaande woordmerk, nooit opnieuw getekend: het primaire logo, op
// licht de antraciete variant en op donker de witte (eigenaar, 28-29 sep 2026).
export function Logo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/woordmerk-primair-antraciet.svg" alt="GRØNN Studio" className={`${className} dark:hidden`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/woordmerk-primair.svg" alt="GRØNN Studio" className={`${className} hidden dark:block`} />
    </>
  )
}
