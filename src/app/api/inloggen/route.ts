import { NextResponse, type NextRequest } from "next/server"

// Start van het inloggen met Google: een willekeurige state in een koekje, dan
// door naar Google. Terug komt de eigenaar op /api/inloggen/terug.
export function GET(request: NextRequest) {
  const id = process.env.GOOGLE_CLIENT_ID
  if (!id) return new NextResponse("Niet gevonden", { status: 404 })
  const terug = request.nextUrl.searchParams.get("terug") ?? "/offertes"
  const state = crypto.randomUUID()
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth")
  url.search = new URLSearchParams({
    client_id: id,
    redirect_uri: new URL("/api/inloggen/terug", request.nextUrl.origin).toString(),
    response_type: "code",
    scope: "openid email",
    state,
    prompt: "select_account",
  }).toString()
  const res = NextResponse.redirect(url)
  const opties = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/api/inloggen", maxAge: 600 }
  res.cookies.set("gronn-state", state, opties)
  res.cookies.set("gronn-terug", terug.startsWith("/") && !terug.startsWith("//") ? terug : "/offertes", opties)
  return res
}
