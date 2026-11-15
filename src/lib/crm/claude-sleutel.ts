import "server-only"
import { timingSafeEqual } from "node:crypto"

/** Heeft dit verzoek de geheime sleutel CRM_CLAUDE_TOKEN (minstens 32 tekens)? Zonder variabele: nee. */
export function claudeMag(req: Request) {
  const sleutel = process.env.CRM_CLAUDE_TOKEN ?? ""
  const kop = req.headers.get("authorization") ?? ""
  const gegeven = kop.startsWith("Bearer ") ? kop.slice(7) : ""
  if (sleutel.length < 32 || gegeven.length !== sleutel.length) return false
  return timingSafeEqual(Buffer.from(gegeven), Buffer.from(sleutel))
}
