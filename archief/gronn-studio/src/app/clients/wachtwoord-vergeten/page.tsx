import type { Metadata } from "next"
import Link from "next/link"

import { serverHasProject, serverUrlMalformed } from "@/lib/supabase"
import { AuthShell, quietLink } from "../auth-shell"
import { ForgotForm } from "./forgot-form"

export const metadata: Metadata = {
  title: "Wachtwoord vergeten",
  robots: { index: false, follow: false },
}

export default function ForgotPage() {
  return (
    <AuthShell
      title="Wachtwoord vergeten"
      intro="Vul je e-mailadres in. We sturen je een link waarmee je een nieuw wachtwoord instelt."
      footer={
        <p>
          <Link href="/clients/login" className={quietLink}>
            Terug naar inloggen
          </Link>
        </p>
      }
    >
      <ForgotForm
        serverHasProject={serverHasProject()}
        serverUrlMalformed={serverUrlMalformed()}
      />
    </AuthShell>
  )
}
