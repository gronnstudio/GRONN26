"use client"

import { DeepIntake } from "@/components/intake/deep-intake"
import { PageHero } from "@/components/page-hero"
import { trailFor } from "@/lib/nav"

// The deep intake sits under /contact rather than beside it: it is the
// same conversation as the four-step form, at a different length, and
// the breadcrumb should say so.
export function IntakePageContent() {
  return (
    <>
      <PageHero
        label={{ en: "Before the first line", nl: "Voordat er één lijn getekend wordt" }}
        lines={[
          { en: "Everything the", nl: "Alles wat het" },
          { en: "design needs to know", nl: "ontwerp moet weten" },
        ]}
        intro={{
          en: "One form. Fill in what you know, skip what you do not, and upload photographs — of the garden as it is, of material already lying there, and of images that speak to you. What is here already is what we do not have to work out on site.",
          nl: "Eén formulier. Vul in wat je weet, sla over wat je niet weet, en upload foto's — van de tuin zoals hij nu is, van materiaal dat er al ligt, en van beelden die je aanspreken. Wat hier al staat, hoeven we op locatie niet meer uit te zoeken.",
        }}
        trail={trailFor("contact", {
          label: { en: "Design intake", nl: "Intake tuinontwerp" },
          path: "/contact/intake",
        })}
      />
      <DeepIntake />
    </>
  )
}
