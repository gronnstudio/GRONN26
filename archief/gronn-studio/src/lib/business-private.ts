// Business details that must NEVER reach a visitor's browser.
//
// The IBAN lived in `BUSINESS` alongside the address and the KVK number,
// and three public client components imported it: the footer (on every
// page of the site), the terms page, and the privacy page's
// credential detector. It was therefore in the shared client bundle and
// findable with a text search, without opening any page that displays
// it. It had been live that way since the site launched.
//
// Removing the three call sites would have fixed the symptom. The cause
// is that a bank account number sat in a module any component may
// import, so the next person to write `BUSINESS.` and scan the
// autocomplete would put it straight back.
//
// A published account number is not a leak of anything secret — it is
// on every invoice the studio sends. The risk is the opposite direction:
// a number a stranger can read on your own website is a number they can
// use to make a fraudulent invoice look right. Dutch law requires the
// name, address, email, KVK and BTW number on a business website. It
// does not require this.

const IBAN = "NL29SWNB3182369589"

/**
 * The studio's account number, for the owner panel's invoices.
 *
 * Server-side only. There is no `server-only` package in this project
 * and this is not worth adding a dependency for, so the guard is
 * explicit: importing this from a client component throws at module
 * evaluation rather than quietly shipping the string again.
 *
 * `/admin` is a server component that checks the session before it
 * renders anything, so it can read this and pass it down as a prop —
 * the value then travels only in an authenticated response, never in a
 * JavaScript chunk that anyone can request.
 */
export function studioIban(): string {
  if (typeof window !== "undefined") {
    throw new Error(
      "studioIban() is server-only — pass it down as a prop from a server component instead of importing it into client code."
    )
  }
  return IBAN
}
