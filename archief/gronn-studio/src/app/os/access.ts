import "server-only"

import { getOwnerSession } from "@/lib/auth"

// Who may open /os. Asked by the layout AND by every page.
//
// Production: the studio owner and nobody else, with the same
// `getOwnerSession()` every owner route uses.
//
// Why every page asks too, and not only the layout: Next renders a
// layout and its page side by side and sends both in the response, so a
// layout that returns the sign-in gate instead of `children` still ships
// the page's markup in the RSC payload. tests/e2e/os-gate.spec.ts caught
// the Core's client names in a signed-out response exactly that way. A
// page that returns the gate itself renders nothing else.
//
// Preview and local development: open. Vercel previews of this repo sit
// behind Vercel's own SSO, and Google sign-in does not work on a preview
// URL (its callback is registered for gronn.studio only), so gating them
// would make the prototype impossible to review on a phone. Once phase 2
// reads Supabase this exception must go (docs/gronn-os/README.md, D-03).
export const OPEN_OUTSIDE_PRODUCTION =
  process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development"

export async function canOpenOs(): Promise<boolean> {
  if (OPEN_OUTSIDE_PRODUCTION) return true
  return (await getOwnerSession()) !== null
}
