"use client"

import { meldGemaild } from "@/app/dashboard/klanten/mail-acties"

// Opent je mailprogramma met de mail klaar; op de klantkaart komt "gemaild" in de tijdlijn.
export function MailKnop({ href, klantId, wat, label = "Mailen" }: { href: string; klantId: string; wat: string; label?: string }) {
  return (
    <a href={href} onClick={() => void meldGemaild(klantId, wat)} className="crm-knop-rand crm-knop-klein">
      {label}
    </a>
  )
}
