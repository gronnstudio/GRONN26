import type { Metadata } from "next"
import Link from "next/link"
import { Opening } from "@/components/wereld/opening"

export const metadata: Metadata = { title: "Offline", robots: "noindex" }

// De pagina die de service worker toont als er geen netwerk is.
export default function Offline() {
  return (
    <Opening label="Geen verbinding" titel={"Even geen\nnetwerk."} zin="Zodra je weer verbinding hebt, laadt de site gewoon verder.">
      <p className="mt-8">
        <Link href="/" className="w-lijnlink text-gebroken-wit">
          Opnieuw proberen →
        </Link>
      </p>
    </Opening>
  )
}
