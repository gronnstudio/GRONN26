import Anthropic from "@anthropic-ai/sdk"
import { NextResponse, type NextRequest } from "next/server"
import { geheugen } from "@/lib/beheer/geheugen"
import { KOEKJE, isEigenaar } from "@/lib/eigenaar"

// De assistent "Grønn" (spreek uit: greun): Nicks vraag (getypt of ingesproken) naar Claude, met het geheugen van
// GRØNN als context. Alleen voor de ingelogde eigenaar; de sleutel staat in
// ANTHROPIC_API_KEY op Vercel. Hij leest en adviseert, hij doet niets zelf.
const PERSOON = `Je heet Grønn (uitgesproken als "greun"), de assistent en chef-staf van Nick Peters (GRØNN Studio). Je antwoordt in het Nederlands, kort en direct, alsof je het hardop zegt: hooguit vier zinnen, geen opsommingstekens, geen markdown, bedragen voluit leesbaar. Spreek hem aan met Nick.
Gebruik alleen de gegevens hieronder. Weet je iets niet, zeg dat dan; verzin nooit klanten, bedragen of afspraken. Je voert niets uit: je adviseert, en Nick beslist. Bewaak zijn gouden regel: functioneel en eenvoudig.`

type Beurt = { rol: "nick" | "grønn"; tekst: string }

export async function POST(request: NextRequest) {
  if (!(await isEigenaar(request.cookies.get(KOEKJE)?.value))) return new NextResponse("Niet ingelogd", { status: 401 })
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ antwoord: "Ik heb nog geen sleutel, Nick. Zet ANTHROPIC_API_KEY in Vercel." })
  const { vraag, eerder = [] } = (await request.json()) as { vraag?: string; eerder?: Beurt[] }
  if (!vraag?.trim()) return NextResponse.json({ antwoord: "Ik hoorde niets." })

  const client = new Anthropic()
  try {
    const antwoord = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: [{ type: "text", text: `${PERSOON}\n\nVandaag: ${new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}\n\n${geheugen()}` }],
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
    if (fout instanceof Anthropic.APIError) return NextResponse.json({ antwoord: `Er ging iets mis bij Claude (${fout.status}).` })
    throw fout
  }
}
