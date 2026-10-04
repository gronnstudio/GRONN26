import { AboutFragment } from "@/components/AboutFragment"
import { ClosingInvite } from "@/components/ClosingInvite"
import { EditorialStatement } from "@/components/EditorialStatement"
import { HomeHero } from "@/components/HomeHero"
import { ProjectSpread } from "@/components/ProjectSpread"
import { DETAILS, PROJECTS, TERRAS_FEITEN } from "@/data/projects"
import { MERKBELOFTE, OPENING } from "@/data/site"

// De voorpagina als een kort boek: opening, de belofte, het werk, de
// maker, en één uitnodiging. Elke spread heeft een eigen ritme.
export default function Home() {
  const [vijver, terras] = PROJECTS
  return (
    <>
      <HomeHero />

      <EditorialStatement label="GRØNN Studio" uitspraak={MERKBELOFTE.replace("tuin ", "tuin\n")}>
        <p>{OPENING.zin}</p>
      </EditorialStatement>

      <div className="flex flex-col gap-[var(--ruimte-sectie)]">
        <ProjectSpread project={vijver} index={0} ritme="breed" detail={DETAILS.kogelkranen} />
        <ProjectSpread project={terras} index={1} ritme="staand" beeld={DETAILS.terraspad} feiten={TERRAS_FEITEN} />
      </div>

      <AboutFragment />

      <ClosingInvite />
    </>
  )
}
