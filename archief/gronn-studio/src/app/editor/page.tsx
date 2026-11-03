import type { Metadata } from "next"

import { getOwnerSession } from "@/lib/auth"
import { EditorGate } from "./editor-gate"

export const metadata: Metadata = {
  title: "Editor",
  robots: "noindex",
}

// The editor's front door. Signed out: a Google sign-in restricted to
// the studio account. Signed in: confirmation + pointer to the site,
// where the on-page editing UI lives (PR E3).
export default async function EditorPage() {
  const session = await getOwnerSession()
  return <EditorGate signedIn={!!session} />
}
