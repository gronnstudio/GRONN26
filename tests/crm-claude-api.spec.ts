import { test, expect } from "./fixtures"

// /api/crm/claude staat dicht zonder de geheime sleutel.
test("CRM-route voor Claude weigert zonder sleutel", async ({ request }) => {
  expect((await request.get("/api/crm/claude")).status()).toBe(401)
  expect((await request.post("/api/crm/claude", { data: {}, headers: { authorization: "Bearer fout" } })).status()).toBe(401)
})
