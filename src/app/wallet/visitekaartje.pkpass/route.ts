import { appleKlaar, bouwApplePas } from "@/lib/wallet"

// Het visitekaartje voor Apple Wallet, bij het bouwen ondertekend met de
// sleutels uit Vercel. Zonder sleutels: 404, en geen knop op de site.
export const dynamic = "force-static"

export async function GET() {
  if (!appleKlaar()) return new Response("Niet gevonden", { status: 404 })
  const pas = await bouwApplePas()
  return new Response(new Uint8Array(pas), {
    headers: {
      "Content-Type": "application/vnd.apple.pkpass",
      "Content-Disposition": 'attachment; filename="gronn-studio.pkpass"',
    },
  })
}
