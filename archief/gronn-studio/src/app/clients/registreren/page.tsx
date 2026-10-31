import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { getClientUser } from "@/lib/client-auth"
import { serverHasProject, serverUrlMalformed } from "@/lib/supabase"
import { AuthShell, quietLink } from "../auth-shell"
import { RegisterForm } from "./register-form"

export const metadata: Metadata = {
  title: "Registreren",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function RegisterPage() {
  if (await getClientUser()) redirect("/dashboard")
  return (
    <AuthShell
      title="Account aanmaken"
      intro="Een account geeft je toegang tot je eigen dossier. Het maakt er geen — dat doet de studio."
      footer={
        <p>
          Heb je al een account?{" "}
          <Link href="/clients/login" className={quietLink}>
            Inloggen
          </Link>
        </p>
      }
    >
      <RegisterForm
        serverHasProject={serverHasProject()}
        serverUrlMalformed={serverUrlMalformed()}
      />
    </AuthShell>
  )
}
