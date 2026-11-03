import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { getClientUser } from "@/lib/client-auth"
import { serverHasProject, serverUrlMalformed } from "@/lib/supabase"
import { AuthShell, quietLink } from "../auth-shell"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Inloggen",
  robots: { index: false, follow: false },
}

// The session is read per request, so this cannot be prerendered.
export const dynamic = "force-dynamic"

export default async function LoginPage() {
  // Already signed in: the sign-in screen is not a place to leave
  // somebody who is through the door.
  if (await getClientUser()) redirect("/dashboard")
  return (
    <AuthShell
      title="Klantportaal"
      intro="Log in om je tuin, je afspraken en je abonnementen te bekijken."
      footer={
        <p>
          Nog geen account?{" "}
          <Link href="/clients/registreren" className={quietLink}>
            Registreer je hier
          </Link>
        </p>
      }
    >
      <LoginForm
        serverHasProject={serverHasProject()}
        serverUrlMalformed={serverUrlMalformed()}
      />
    </AuthShell>
  )
}
