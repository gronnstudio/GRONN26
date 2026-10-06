import { NextResponse, type NextRequest } from "next/server"
import { KOEKJE, isEigenaar } from "@/lib/eigenaar"

// De offertemaker (/offertes) is alleen voor de eigenaar: inloggen met Google
// (zie src/lib/eigenaar.ts). Zonder Google-instellingen bestaat de pagina niet
// (404). Er wordt niets opgeslagen op de server; een concept blijft in de
// browser van de eigenaar.
export async function proxy(request: NextRequest) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.AUTH_SECRET) return new NextResponse("Niet gevonden", { status: 404 })
  if (await isEigenaar(request.cookies.get(KOEKJE)?.value)) return NextResponse.next()
  const url = new URL("/api/inloggen", request.nextUrl.origin)
  url.searchParams.set("terug", request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

export const config = { matcher: ["/offertes", "/offertes/:path*"] }
