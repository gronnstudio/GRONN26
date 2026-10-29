import "server-only"
import { cookies } from "next/headers"
import { KOEKJE, isEigenaar } from "@/lib/eigenaar"

// De tweede deur (docs/security/authorization.md): src/proxy.ts houdt
// /dashboard dicht, en elke server-actie en API-route die klantgegevens leest
// of wijzigt vraagt het hier nog eens na. Een server-actie is een gewone
// POST die iedereen kan sturen, dus verbergen in de interface is geen
// beveiliging. Er is nu één rol, eigenaar; medewerkers en klanten komen pas
// met Postgres (ADR 0001) en krijgen dan hier hun controle.

export type Rol = "eigenaar"

export async function rol(): Promise<Rol | null> {
  return (await isEigenaar((await cookies()).get(KOEKJE)?.value)) ? "eigenaar" : null
}

export async function eisEigenaar() {
  if ((await rol()) !== "eigenaar") throw new Error("Niet ingelogd")
}
