// Weergave: kleur (Auto / Licht / Donker) en beweging.
//
// Auto volgt de klok van de bezoeker: licht van 07:00 tot 19:00, daarna
// donker — "de Uren" uit gronn-studio. Het pre-paint-script hieronder
// draait vóór de eerste paint, zodat niemand een flits van de verkeerde
// grond ziet. De grenzen staan maar op één plek: hier.

export const KLEUR_KEY = "gronn-weergave"
export const BEWEGING_KEY = "gronn-beweging"

export type Kleur = "auto" | "licht" | "donker"
export type Beweging = "systeem" | "minder"

export const DAG_START = 7
export const NACHT_START = 19

export function kleurVanKlok(nu: Date = new Date()): "licht" | "donker" {
  const uur = nu.getHours()
  return uur >= DAG_START && uur < NACHT_START ? "licht" : "donker"
}

/** Zet de klasse en de bewegingsvoorkeur op <html>. Ook gebruikt na een keuze. */
export function pasToe(kleur: Kleur, beweging: Beweging) {
  const html = document.documentElement
  const thema = kleur === "auto" ? kleurVanKlok() : kleur
  html.classList.toggle("licht", thema === "licht")
  html.classList.toggle("donker", thema === "donker")
  if (beweging === "minder") html.dataset.motion = "reduced"
  else delete html.dataset.motion
}

export const PREPAINT = `try{var d=document.documentElement,k=localStorage.getItem(${JSON.stringify(KLEUR_KEY)}),h=new Date().getHours();d.classList.add(k==="licht"||k==="donker"?k:(h>=${DAG_START}&&h<${NACHT_START}?"licht":"donker"));if(localStorage.getItem(${JSON.stringify(BEWEGING_KEY)})==="minder")d.dataset.motion="reduced"}catch(e){}`
