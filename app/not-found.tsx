import Link from "next/link"

import { PageIntro } from "@/components/PageIntro"

export default function NotFound() {
  return (
    <PageIntro label="404" titel="Hier groeit nog niets.">
      <p>
        Deze pagina bestaat niet (meer).{" "}
        <Link href="/" className="text-foreground underline underline-offset-4">Naar de voorpagina</Link>
      </p>
    </PageIntro>
  )
}
