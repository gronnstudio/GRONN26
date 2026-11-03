import { bouwVcard } from "@/lib/vcard"

// De contactkaart, bij het bouwen opgebouwd uit business.ts — zo kan hij
// niet afwijken van voettekst, juridische pagina's en JSON-LD.
export const dynamic = "force-static"

export function GET() {
  return new Response(bouwVcard(), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="gronn-studio.vcf"',
    },
  })
}
