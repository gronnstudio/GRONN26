import { NextResponse, type NextRequest } from "next/server"

// De offertemaker (/offertes) is alleen voor de eigenaar: een wachtwoord via de
// browser (basic auth), uit de Vercel-variabele OFFERTE_WACHTWOORD. Staat die
// niet, dan bestaat de pagina gewoon niet (404). Er wordt niets opgeslagen op
// de server; een concept blijft in de browser van de eigenaar.
export function proxy(request: NextRequest) {
  const wachtwoord = process.env.OFFERTE_WACHTWOORD
  if (!wachtwoord) return new NextResponse("Niet gevonden", { status: 404 })
  const kop = request.headers.get("authorization") ?? ""
  const [soort, waarde] = kop.split(" ")
  if (soort === "Basic" && waarde) {
    const tekst = atob(waarde)
    if (tekst.slice(tekst.indexOf(":") + 1) === wachtwoord) return NextResponse.next()
  }
  return new NextResponse("Inloggen vereist", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="GRONN offertes", charset="UTF-8"' },
  })
}

export const config = { matcher: ["/offertes", "/offertes/:path*"] }
