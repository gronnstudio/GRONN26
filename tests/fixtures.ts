import { test as basis } from "@playwright/test"

export { expect, type Page } from "@playwright/test"

// next start maakt elke foto bij de eerste vraag opnieuw als AVIF; op een
// koude CI-runner kost dat seconden per foto en houden die verzoeken de zes
// verbindingen van de browser bezet. Dan blijven een klik naar een andere
// pagina en een tweede goto hangen (ERR_ABORTED, URL blijft "/"). In de tests
// halen we daarom het origineel uit public/: zelfde beeld, zonder het omzetten.
export const test = basis.extend<{ origineleFotos: void }>({
  origineleFotos: [
    async ({ context }, use) => {
      await context.route("**/_next/image?*", (route) => {
        const bron = new URL(route.request().url()).searchParams.get("url")
        if (!bron?.startsWith("/")) return route.continue()
        return route.continue({ url: new URL(bron, route.request().url()).href })
      })
      await use()
    },
    { auto: true },
  ],
})
