import { NextResponse, type NextRequest } from "next/server"
import { KOEKJE } from "@/lib/eigenaar"

// Uitloggen: het koekje van de eigenaar weg, terug naar de voorpagina.
export function GET(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/", request.nextUrl.origin))
  res.cookies.delete({ name: KOEKJE, path: "/" })
  return res
}
