import Anthropic from "@anthropic-ai/sdk"
import { NextResponse, type NextRequest } from "next/server"
import { geheugen } from "@/lib/beheer/geheugen"
import { leesKlanten } from "@/lib/beheer/klanten"
import { crmOverzicht, klantContext } from "@/lib/crm/context"
import { KOEKJE, isEigenaar } from "@/lib/eigenaar"
import { ZONDER_CLAUDE, zelfAntwoord } from "@/lib/beheer/zelf"

// De assistent "Grønn" (spreek uit: greun): Nicks vraag (getypt of ingesproken) naar Claude, met het geheugen van
// GRØNN als context. Alleen voor de ingelogde eigenaar; de sleutel staat in
// ANTHROPIC_API_KEY op Vercel. Hij leest en adviseert, hij doet niets zelf.
const PERSOON = `Je heet Grønn (uitgesproken als "greun"), de assistent en chef-staf van Nick Peters (GRØNN Studio). Je antwoordt in het Nederlands, kort en direct, alsof je het hardop zegt: hooguit vier zinnen, geen opsommingstekens, geen markdown, bedragen voluit leesbaar. Spreek hem aan met Nick.
Gebruik alleen de gegevens hieronder. Weet je iets niet, zeg dat dan; verzin nooit klanten, bedragen of afspraken. Je voert niets uit: je adviseert, en Nick beslist. Bewaak zijn gouden regel: functioneel en eenvoudig.`

type Beurt = { rol: "nick" | "grønn"; tekst: string }

export async function POST(request: NextRequest) {
  if (!(await isEigenaar(request.cookies.get(KOEKJE)?.value))) return new NextResponse("Niet ingelogd", { status: 401 })
  const { vraag, eerder = [], klantId } = (await request.json()) as { vraag?: string; eerder?: Beurt[]; klantId?: string }
  if (!vraag?.trim()) return NextResponse.json({ antwoord: "Ik hoorde niets." })
  // Op een klantkaart gaat de vraag altijd naar Claude, met die klant erbij.
  const zelf = klantId ? null : zelfAntwoord(vraag)
  if (zelf) return NextResponse.json({ antwoord: zelf })
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ antwoord: ZONDER_CLAUDE })

  // Het CRM erbij: alle lopende klanten kort, en de open klant uitgebreid.
  const klanten = await leesKlanten()
  const open = typeof klantId === "string" ? klanten.find((k) => k.id === klantId) : undefined
  const crm = `${crmOverzicht(klanten)}${open ? `\n\n${klantContext(open)}` : ""}`

  const client = new Anthropic()
  try {
    const antwoord = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: [{ type: "text", text: `${PERSOON}\n\nVandaag: ${new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}\n\n${geheugen()}\n\n${crm}` }],
      messages: [
        ...eerder.slice(-8).map((b) => ({ role: b.rol === "nick" ? ("user" as const) : ("assistant" as const), content: b.tekst })),
        { role: "user", content: vraag.slice(0, 2000) },
      ],
    })
    if (antwoord.stop_reason === "refusal") return NextResponse.json({ antwoord: "Daar kan ik je niet mee helpen, Nick." })
    const tekst = antwoord.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join(" ").trim()
    return NextResponse.json({ antwoord: tekst || "Ik heb even geen antwoord." })
  } catch (fout) {
    if (fout instanceof Anthropic.RateLimitError) return NextResponse.json({ antwoord: "Even te druk, probeer het zo nog eens." })
    if (fout instanceof Anthropic.APIError) return NextResponse.json({ antwoord: ZONDER_CLAUDE })
    throw fout
  }
}
