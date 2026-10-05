import type { Metadata } from "next"
import Link from "next/link"
import { Opening } from "@/components/wereld/opening"
import { T } from "@/components/taal"

export const metadata: Metadata = { title: "Offline", robots: "noindex" }

// De pagina die de service worker toont als er geen netwerk is.
export default function Offline() {
  return (
    <Opening
      label={{ nl: "Geen verbinding", en: "No connection" }}
      titel={{ nl: "Even geen\nnetwerk.", en: "No network\nright now." }}
      zin={<T t={{ nl: "Zodra je weer verbinding hebt, laadt de site gewoon verder.", en: "As soon as you are connected again, the site simply carries on loading." }} />}
    >
      <p className="mt-8">
        <Link href="/" className="w-lijnlink text-gebroken-wit">
          <T t={{ nl: "Opnieuw proberen →", en: "Try again →" }} />
        </Link>
      </p>
    </Opening>
  )
}
