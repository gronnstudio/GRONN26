import type { Metadata } from "next"
import Link from "next/link"

import { getClientUser } from "@/lib/client-auth"
import { serverHasProject, serverUrlMalformed } from "@/lib/supabase"
import { AuthShell, quietLink } from "../auth-shell"
import { ResetForm } from "./reset-form"

export const metadata: Metadata = {
  title: "Nieuw wachtwoord",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

// Where the link in the recovery mail lands, after the callback route has
// exchanged its code for a session.
//
// The gate is that session. `updateUser({ password })` changes the
// password of whoever is signed in, so reaching this form without one
// must not be possible — otherwise the page would be an invitation to
// try. Following the mailed link is the only way to get one here, which
// is what makes possession of the inbox the proof.
export default async function ResetPage() {
  const user = await getClientUser()

  if (!user) {
    return (
      <AuthShell
        title="Deze link werkt niet meer"
        intro="Herstellinks zijn beperkt geldig en kunnen maar één keer gebruikt worden."
        footer={
          <p>
            <Link href="/clients/wachtwoord-vergeten" className={quietLink}>
              Vraag een nieuwe link aan
            </Link>
          </p>
        }
      >
        <div />
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Nieuw wachtwoord"
      intro={`Kies een nieuw wachtwoord voor ${user.email ?? "je account"}.`}
    >
      <ResetForm
        serverHasProject={serverHasProject()}
        serverUrlMalformed={serverUrlMalformed()}
      />
    </AuthShell>
  )
}
