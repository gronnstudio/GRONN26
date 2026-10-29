import type { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Editor authentication: Google sign-in, allowed ONLY for the studio's
// own account. JWT sessions (no database). The allowlist is the entire
// authorization model — one owner, one email.
const ALLOWED_EMAIL = (
  process.env.EDITOR_ALLOWED_EMAIL ?? "hello@gronn.studio"
).toLowerCase()

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/editor" },
  callbacks: {
    signIn({ profile }) {
      return profile?.email?.toLowerCase() === ALLOWED_EMAIL
    },
  },
}

/**
 * Is this request the studio owner?
 *
 * NOT "is anyone signed in". The name matters more than it looks: every
 * call site reads `if (!session) return 401`, which is exactly what a
 * plain signed-in check looks like, and there are nine of them. The day
 * a second class of user exists, widening one helper would silently turn
 * eight ownership checks into presence checks with no visible change at
 * any call site — and the things behind them are the studio's invoices
 * and photographs of clients' houses.
 *
 * So client sessions get their own helper and their own routes. This one
 * only ever answers for Nick.
 */
export async function getOwnerSession() {
  const session = await getServerSession(authOptions)
  if (session?.user?.email?.toLowerCase() !== ALLOWED_EMAIL) return null
  return session
}
