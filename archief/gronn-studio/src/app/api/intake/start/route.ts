import { NextResponse } from "next/server"

import { INTAKE_REFERENCE_PATTERN, mintReference } from "@/lib/intake-reference"

// Where an intake gets its identity — on the server, before anything is
// uploaded.
//
// It used to get it in the browser, from the visitor's own project name:
// `2026-08-30-` plus a slug of whatever they typed. Two things followed
// from that, and both cost real submissions.
//
// The folder name was guessable, so `/api/intake/photo` — which is
// public, because the form it serves is — would mint an upload token for
// any folder a caller cared to name, including someone else's. And the
// browser and the server slugged that name differently, so for five of
// every nine realistic project names the photographs and the record
// ended up in two different folders and the submission arrived carrying
// none of the files it described.
//
// Now the server names the folder and the visitor's words stay words.
// The reference keeps its date, because a dated folder is legible in the
// panel and in the store, and gains twelve random hex characters, which
// is what makes it unguessable and collision-free.
export async function POST() {
  const reference = mintReference()
  return NextResponse.json(
    { reference, pattern: INTAKE_REFERENCE_PATTERN.source },
    { headers: { "Cache-Control": "no-store" } }
  )
}
