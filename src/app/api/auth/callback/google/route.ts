import { NextResponse, type NextRequest } from "next/server"
import { DUUR, KOEKJE, maakKoekje, toegestaan } from "@/lib/eigenaar"

// Zelfde terugkeeradres als NextAuth op de oude site, zodat de bestaande
// Google-client zonder wijziging werkt.
//
// Google stuurt de eigenaar hier terug met een code. Die ruilen we server-side
// (rechtstreeks bij Google, over TLS) voor een id_token; alleen een
// geverifieerd adres dat gelijk is aan EDITOR_ALLOWED_EMAIL krijgt het koekje.
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams
  const state = request.cookies.get("gronn-state")?.value
  if (!p.get("code") || !state || p.get("state") !== state) return weiger()
  const antwoord = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: p.get("code")!,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: new URL("/api/auth/callback/google", request.nextUrl.origin).toString(),
      grant_type: "authorization_code",
    }),
  })
  if (!antwoord.ok) return weiger()
  const { id_token } = (await antwoord.json()) as { id_token?: string }
  const deel = id_token?.split(".")[1]
  if (!deel) return weiger()
  const info = JSON.parse(atob(deel.replace(/-/g, "+").replace(/_/g, "/"))) as {
    email?: string
    email_verified?: boolean
    aud?: string
  }
  if (info.aud !== process.env.GOOGLE_CLIENT_ID || !info.email_verified || info.email?.toLowerCase() !== toegestaan())
    return weiger()
  const terug = request.cookies.get("gronn-terug")?.value ?? "/beheer"
  const res = NextResponse.redirect(new URL(terug, request.nextUrl.origin))
  res.cookies.set(KOEKJE, await maakKoekje(info.email), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: DUUR })
  res.cookies.delete({ name: "gronn-state", path: "/api" })
  res.cookies.delete({ name: "gronn-terug", path: "/api" })
  return res
}

const weiger = () => new NextResponse("Inloggen niet gelukt.", { status: 403 })
