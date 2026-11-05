// Zonder opslag, zodat de rekentests (zonder server) hem ook kunnen laden.
/** ISO-weeknummer en maandag van die week, voor het groeperen per week. */
export function weekVan(datum: string) {
  const d = new Date(`${datum}T12:00:00Z`)
  const dag = (d.getUTCDay() + 6) % 7
  const maandag = new Date(d)
  maandag.setUTCDate(d.getUTCDate() - dag)
  const donderdag = new Date(maandag)
  donderdag.setUTCDate(maandag.getUTCDate() + 3)
  const jan1 = new Date(Date.UTC(donderdag.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((donderdag.getTime() - jan1.getTime()) / 86400000 + 1) / 7)
  return { week, maandag: maandag.toISOString().slice(0, 10) }
}
