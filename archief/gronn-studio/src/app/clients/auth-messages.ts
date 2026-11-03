// Supabase answers in English, and the strings are for developers:
// "Invalid login credentials", "User already registered". Those reach a
// homeowner who is trying to look at their own garden, so they are
// translated here rather than printed raw.
//
// The mapping is deliberately coarse. A precise translation of every
// auth error would tell an attacker which half of a login was wrong, and
// the sign-in screen is exactly where that distinction is worth hiding.
export function authMessage(raw: string | undefined): string {
  const m = (raw ?? "").toLowerCase()
  if (m.includes("invalid login credentials")) {
    return "Dit e-mailadres en wachtwoord horen niet bij elkaar."
  }
  if (m.includes("email not confirmed")) {
    return "Bevestig eerst je e-mailadres via de link die we je stuurden."
  }
  if (m.includes("already registered")) {
    return "Er bestaat al een account met dit adres. Log in, of vraag een nieuw wachtwoord aan."
  }
  if (m.includes("password") && m.includes("least")) {
    return "Kies een wachtwoord van minstens acht tekens."
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "Te veel pogingen achter elkaar. Wacht even en probeer het opnieuw."
  }
  if (m.includes("expired") || m.includes("invalid")) {
    return "Deze link is verlopen of al gebruikt. Vraag een nieuwe aan."
  }
  return "Er ging iets mis. Probeer het zo opnieuw."
}

/** Shown wherever there is no Supabase project configured. */
export const UNCONFIGURED =
  "Het klantportaal is nog niet aangesloten. Neem contact op met de studio."

/**
 * Shown when the server holds the project but the browser does not.
 *
 * A different sentence because it is a different fault, and because the
 * first one sent the owner to ring themselves. `NEXT_PUBLIC_*` is baked
 * into the JavaScript when the site is built, so a deployment made
 * before those variables were added never learns them — the fix is a
 * fresh deploy, not a phone call, and the screen should say so.
 */
/**
 * Shown when a project URL is configured and is not a URL.
 *
 * A third sentence rather than folding into the one above, because the
 * advice is opposite: redeploying over a malformed value changes
 * nothing, and sending somebody round that loop is how an afternoon
 * disappears.
 */
export const BAD_URL =
  "De Supabase-URL klopt niet — controleer de waarde in Vercel (geen aanhalingstekens, beginnend met https://)."

export const STALE_BUILD =
  "Het portaal is ingesteld, maar deze versie van de site kent de sleutels nog niet. Rol de site opnieuw uit."
