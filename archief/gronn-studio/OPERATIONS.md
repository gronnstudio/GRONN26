# GRØNN Studio — Operations Manual

Everything needed to run, fix and hand over this website. Readable from a
phone via GitHub. Keep it updated when infrastructure changes.

**Live site:** https://gronn.studio · **Repo:** github.com/gronnstudio/gronn-studio (private)

---

## 1. Open actions

Things waiting on Nick. Tick them off here as they're done.

- [x] **Add SPF record** — done, verified resolving publicly
- [x] **Generate + add DKIM** — done, verified resolving publicly.
      *Remember to click "Start authentication" in Google Admin if not yet done.*
- [ ] **Add DMARC** at `p=none`, now that SPF/DKIM are live (see §5)
- [x] **Activate the contact form** — done 19 Jul 2026; direct browser
      submissions deliver to the inbox (see §6 for the transport note).
- [ ] **Set `SLACK_WEBHOOK_URL` in Vercel** so a submitted intake rings a
      channel. **This is a doorbell, not storage** — since the intake
      archive landed, every submission is written to Blob and readable at
      `/dashboard/intakes` whether or not this is configured, so nothing is
      lost by leaving it unset. Without it the studio is told by email
      instead. Create a Slack app, add an Incoming Webhook to the channel
      you want, paste the URL into the project's environment variables. No
      DNS, no new paid service. The webhook URL is a secret and is only ever
      read server-side (`src/app/api/intake/route.ts`); it must never be put
      in a `NEXT_PUBLIC_` variable, which would ship it in the browser bundle
      and let anyone post into the channel.
- [ ] **Submit sitemap** `https://gronn.studio/sitemap.xml` in Google Search
      Console (domain already verified via TXT record)
- [ ] **Legal review** of `/voorwaarden` — it is a draft, not vetted terms
- [ ] **Cancel old Hostinger hosting** if still active (nothing depends on
      it: mail is Google Workspace, site is Vercel)
- [x] **Vercel plan — DONE 26 Aug 2026: upgraded to Pro.** Hobby is
      licensed for non-commercial use only and this site advertises a paid
      service, so the old plan was a licence violation, not just a limit.
      Pro also raises build minutes, bandwidth and function duration, and
      unlocks deployment-protection options for previews.
- [ ] **Cookie notice is ON ICE** (owner's call, 26 Aug 2026). The banner no
      longer mounts; `src/components/cookie-notice.tsx` is untouched, so it
      is one import and one line to restore. Fine for now — the site sets no
      tracking cookies, the stored preferences are strictly functional, and
      Speed Insights is anonymised and cookieless. **Put it back before**
      shipping a chat widget (every shared-inbox option is a third-party
      processor), analytics with a visitor identifier, a marketing pixel, or
      an embed that sets its own cookies.
- [ ] **The rotating stamp should open the live chat** (owner, 26 Aug
      2026). `src/components/stamp.tsx`, bottom-right of the hero. Three
      things to resolve first, so they do not surface as surprises:
      (1) it carries brand words — "ROOTED IN NATURE · GRØNN STUDIO" — and
      no verb, so design rule 1 needs something on it that says "chat";
      (2) it exists only on the home page, and an entry point on one page
      is not an entry point; (3) it is `hidden md:block`, invisible on
      phones, which is the device most visitors arrive on. Blocked on the
      chat decision itself (shared inbox, option C) which still needs its
      own plan.
- [ ] **Add a backup domain-contact email** at TransIP (currently
      hello@gronn.studio — unreachable during a DNS outage, which is exactly
      when the warning would be sent)
- [ ] **Real project photography + content** — all projects, journal entries
      and imagery are placeholders (see §7)
- [ ] **Klantportaal aanzetten** — de code staat en bouwt; wat resteert is
      configuratie, stap voor stap in §5b. **De valkuil die het portaal
      op 1 sep 2026 stil hield:** `NEXT_PUBLIC_SUPABASE_URL` en
      `NEXT_PUBLIC_SUPABASE_ANON_KEY` waren in Vercel als *Sensitive*
      gemarkeerd. Een Sensitive-variabele komt niet bij de build, en
      `NEXT_PUBLIC_*` wordt juist tijdens de build in de JavaScript
      gebakken — dus zag de browser niets en meldde het inlogscherm "nog
      niet aangesloten" over een project dat er wel degelijk was. Die twee
      moeten **gewoon** zijn; alleen `SUPABASE_SERVICE_ROLE_KEY` hoort
      Sensitive te zijn. En na elke wijziging: opnieuw uitrollen, anders
      draagt het bestaande pakket nog de oude waarden.
- [x] **Resend als SMTP voor Supabase** — ingesteld 1 sep 2026 (host
      `smtp.resend.com`, poort 465, gebruikersnaam letterlijk `resend`,
      wachtwoord de API-key). Supabase' eigen mail is door henzelf als
      testvoorziening bestempeld en doet enkele berichten per uur, wat te
      weinig is voor een portaal waar registratie op een bevestigingsmail
      wacht. **Nog te controleren:** het domein `gronn.studio` moet in
      Resend geverifieerd zijn (Domains → DNS-records), anders weigert
      Resend te verzenden en meldt Supabase alleen "failed to send".

---

## 2. The stack — what runs where

| Service | Role | Account | Cost |
|---|---|---|---|
| **TransIP** | Domain registrar for gronn.studio | — | ~€15–25/yr, auto-renews 12 Jul 2027 |
| **Cloudflare** | DNS zone (authoritative records) | — | Free |
| **Vercel** | Hosting, builds, SSL, CDN | team `gronn` | Pro (since 26 Aug 2026) |
| **GitHub** | Code + version history | `gronnstudio` | Free (private) |
| **Google Workspace** | Mail for hello@gronn.studio | — | Existing |
| **FormSubmit** | Delivers contact-form submissions to inbox | none needed | Free |
| **Vercel Blob** | Stores editor content + uploaded photos (store `gronn-content`, private) | team `gronn` | Included in Pro (was Hobby quota until 26 Aug 2026) |
| **Google Cloud** | OAuth client for the editor sign-in (project `gronn-503016`) | hello@gronn.studio | Free |
| **Supabase** | Client accounts + the client/project/subscription database (project `daymxmkicegpfbumarhi`, eu-west-2) | hello@gronn.studio | Free plan |
| **Resend** | SMTP for Supabase's confirmation and password-reset mail | hello@gronn.studio | Free tier |
| **Sanity** | removed from codebase 1 Aug 2026 (git history preserves the integration); Sanity account/project `j10z1n29` untouched — owner may still revoke it | hello@gronn.studio | Free plan, unused |

**No web hosting package is needed.** Vercel *is* the hosting — there is no
server to rent, upload to, or maintain.

---

## 3. Deploy & rollback

- **Deploy:** push to `main` → Vercel builds → live at gronn.studio.
  Any other branch → preview deployment with its own URL.
- **Manual deploy:** `npx vercel deploy --prod --yes` from the repo.
- **Instant rollback:** `npx vercel rollback` (re-points production at the
  previous deployment in seconds, no rebuild).
- **Revert a change in code:** `git revert <commit>` then push.
- Always `npm run build` before pushing — a failed build blocks the deploy.

---

## 4. DNS — the exact records

Zone lives at **Cloudflare**; TransIP only delegates to it. If the site or
mail ever breaks, compare against this table first.

| Type | Name | Value | Proxy |
|---|---|---|---|
| A | `@` | `76.76.21.21` | **DNS only** (grey cloud) |
| CNAME | `www` | `cname.vercel-dns.com` | **DNS only** |
| CNAME | `links` | `cname.vercel-dns.com` | **DNS only** — de bento-linkpagina (links.gronn.studio → `/links`, zie `src/proxy.ts`); 27 sep 2026, eigenaar zet hem in Cloudflare |
| MX | `@` | `SMTP.GOOGLE.COM` (priority 1) | — |
| TXT | `@` | `google-site-verification=msRj4jAFVU5XbkWvwLVq3uwo5CHIkGa4GcSgdzG3nIQ` | — |

**Nameservers at TransIP must be:**
```
daniella.ns.cloudflare.com
memphis.ns.cloudflare.com
```

⚠️ **Never enable Cloudflare's orange-cloud proxy on the A/CNAME records** —
Vercel handles SSL and CDN; proxying on top causes redirect loops and
certificate errors.

⚠️ **Never switch on "TransIP-instellingen"** in the TransIP DNS panel — it
overrides the Cloudflare delegation and takes the site *and mail* offline.

---

## 5. Email authentication (to add)

Google Workspace mail works, but nothing proves it's really you — so mail
lands in spam and the domain is spoofable. Add these at Cloudflare:

**SPF** — TXT, name `@`:
```
v=spf1 include:_spf.google.com ~all
```

**DKIM** — generate first at admin.google.com → *Apps → Google Workspace →
Gmail → Authenticate email* → select gronn.studio → **Generate new record**
(2048-bit). Add the resulting TXT record (name `google._domainkey`, value
`v=DKIM1; k=rsa; p=…`) at Cloudflare, then click **Start authentication**
back in Google Admin.

**DMARC** — TXT, name `_dmarc`, only *after* SPF and DKIM verify:
```
v=DMARC1; p=none; rua=mailto:hello@gronn.studio
```
Leave at `p=none` for a few weeks, confirm legitimate mail passes, then
tighten to `p=quarantine` and eventually `p=reject`. Tightening too early
blocks your own email.

---

## 5b. Het klantportaal aanzetten (Supabase)

De code staat er en bouwt; wat hieronder staat is configuratie in
Supabase en Vercel, niet in de repository. Zonder deze stappen rendert
het portaal netjes een uitgelogde staat en gebeurt er verder niets —
dat is opzettelijk, want CI draait ook zonder database.

1. **Draai de migratie.** `supabase/migrations/0001_client_dossier.sql`
   maakt de vier tabellen en zet RLS aan. Controleer na afloop in de
   Table Editor dat "RLS enabled" bij alle vier staat. Staat het uit,
   dan is elke rij voor iedereen leesbaar.

2. **Controleer de omgevingsvariabelen in Vercel.** Drie zijn nodig:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` en
   `SUPABASE_SERVICE_ROLE_KEY`. De eerste twee horen publiek te zijn —
   daar zijn de policies op geschreven. De derde omzeilt élke policy en
   mag nooit een `NEXT_PUBLIC_`-prefix krijgen; `tests/e2e/secrets.spec.ts`
   bewaakt dat.

   **Twee dingen die hier stil misgaan, en op 1 sep 2026 misgingen:**

   - Markeer de twee publieke variabelen **niet als Sensitive/Secret**.
     Een Sensitive-variabele komt niet bij de build, en `NEXT_PUBLIC_*`
     wordt juist tijdens de build in de JavaScript gebakken. Het gevolg
     is een browser die de sleutels nooit ziet, terwijl in Vercel alles
     ingevuld lijkt te staan. Alleen de service-role-sleutel hoort
     Sensitive te zijn.
   - **Rol opnieuw uit na elke wijziging.** Een bestaande deploy draagt
     de waarden van de build waarin hij gemaakt is; ze daarna instellen
     verandert niets aan dát pakket.

   Sinds PR #110 zegt het inlogscherm welk van de twee gevallen het is:
   ziet de server het project wel (die leest de service-role-sleutel, de
   enige die nergens in gebakken wordt) en de browser niet, dan luidt de
   melding "rol de site opnieuw uit" in plaats van "neem contact op met
   de studio" — wat de eigenaar naar zichzelf toe stuurde.

3. **Zet de redirect-URL's** onder Authentication → URL Configuration.
   Zonder deze weigert Supabase de link in de bevestigings- en
   herstelmail:
   - Site URL: `https://gronn.studio`
   - Redirect URLs: `https://gronn.studio/api/clients/auth/callback`
     (en de preview-domeinen die je wilt kunnen testen)

4. **Zet Resend als SMTP** onder Authentication → Emails → SMTP
   Settings. Supabase' eigen mail is door henzelf als testvoorziening
   bestempeld en doet enkele berichten per uur — te weinig voor een
   portaal waar registratie op een bevestigingsmail wacht. Host
   `smtp.resend.com`, poort 465, gebruikersnaam letterlijk `resend`,
   wachtwoord de Resend API-key, afzender `noreply@gronn.studio`. Het
   domein moet eerst in Resend geverifieerd zijn, anders weigert Resend
   te verzenden en meldt Supabase alleen "failed to send".

5. **Laat e-mailbevestiging AAN staan** (Authentication → Providers →
   Email → "Confirm email"). Dit is geen voorkeur maar een beveiliging:
   `/api/clients/link` koppelt een account alleen aan een dossier als
   `email_confirmed_at` gezet is. Staat bevestiging uit, dan zet Supabase
   dat veld meteen, en kan iemand die het adres van een klant intypt
   diens dossier claimen.

6. **Maak het eerste dossier vanuit het paneel**, niet in de database.
   `/dashboard/intakes` → een aanvraag openen → "Maak dossier van deze
   aanvraag". Registreren maakt nooit zelf een dossier; dat is met opzet
   zo, anders bepaalt een formulier wie klant is.

7. **Test het één keer helemaal**: registreer met een adres dat op een
   dossier staat, bevestig de mail, log in, en kijk of `/clients/portaal`
   de tuin toont. Doe het daarna nog eens met een onbekend adres — dat
   hoort "nog geen dossier aan dit adres gekoppeld" te zeggen en verder
   niets te lekken.

---

## 6. Runbook — when things break

**Site unreachable / certificate error**
1. Check `https://gronn-studio.vercel.app` — if that works, it's DNS, not the app.
2. `nslookup -type=NS gronn.studio 1.1.1.1` → must list the Cloudflare nameservers.
3. `nslookup gronn.studio 1.1.1.1` → must return `76.76.21.21`.
4. If wrong: fix nameservers at TransIP (§4). Propagation 15–60 min.
   *This happened on 19 Jul 2026, after transferring the domain from
   Hostinger to TransIP — a transfer resets nameservers to the registrar's
   defaults. Fixed by re-entering the Cloudflare nameservers at TransIP;
   site and mail were fully restored the same day, nothing was lost.*

**Mail not arriving**
1. `nslookup -type=MX gronn.studio 1.1.1.1` → must be `SMTP.GOOGLE.COM`.
2. If it shows anything else, DNS delegation is broken — see above.

**Deploy failed**
1. Check the build log in the Vercel dashboard or run `npm run build` locally.
2. Roll back with `npx vercel rollback` while fixing.

**Form submissions not arriving**
1. Confirm FormSubmit activation is still valid (activated 19 Jul 2026).
2. Test: submit the form on `/contact`; on failure it falls back to opening
   a mail draft, which is the visible symptom.
3. Architecture note: submissions go **directly from the visitor's browser**
   to formsubmit.co — a server-side relay is impossible because FormSubmit
   403-blocks datacenter IPs (verified 19 Jul 2026; the /api/contact relay
   was removed for that reason). If FormSubmit ever degrades, the planned
   replacement is Resend + Turnstile behind a route handler (Conversion &
   Operations milestone).

---

## 7. Content status — what is real vs placeholder

**Placeholder (fiction, written to demonstrate structure):**
- All 6 projects in `src/lib/data/projects.ts`
- All 6 journal articles in `src/lib/data/journal.ts`
- All photography (picsum stock under a green wash)
- Studio/founder text on `/studio`

**Real:**
- Business identity in `src/lib/business.ts` (address, KVK, BTW, IBAN, contact)
- Brand assets in `public/` (logo, brandmark, intro background, OG card)
- Services descriptions in `src/lib/data/services.ts`
- Legal pages — privacy accurate; terms are a **draft**

Replacing placeholders with real projects is the single highest-value
improvement to the site.

---

## 8. Where things live in the code

| What | Where |
|---|---|
| Business identity (one source of truth) | `src/lib/business.ts` |
| Projects / journal / services content | `src/lib/data/` |
| Theme tokens + colours | `src/app/globals.css` |
| Translations helper (EN/NL) | `src/lib/i18n.ts`, `src/components/language-provider.tsx` |
| Contact form + delivery | `src/components/contact/intake-form.tsx`, `src/app/api/contact/route.ts` |
| Project conventions for AI agents | `CLAUDE.md` |

---

## 9. Contact form — verification record (19 Jul 2026)

| Evidence | Result |
|---|---|
| Deployment | `dpl_GhkPVcVvu9wDiwK1E8EguKjyn4An`, live 23:19 CEST (PR #5); transport shipped in PR #4 |
| Test submission | 21:08 UTC via browser-origin fetch from production `/contact` |
| Network response | `success: "true"` from formsubmit.co |
| Inbox delivery | ✅ Confirmed by owner (screenshot) — arrived within minutes, all fields present (name, email, full message body incl. project type, situation, location, outcome) |
| Reply-to targets visitor address | ⚠ Not yet click-verified (test used hello@ as visitor address, so indistinguishable) — verify on the first real enquiry |
| Personal data in logs | ✅ None possible: no server endpoint exists; zero console logging in codebase; Vercel logs show request lines only. **Note:** FormSubmit (the external processor) necessarily receives the form fields — named in `/privacy`. |
| UI success state via visible production UI | ⏳ Outstanding — walk the 4-step form once manually |
| Failure fallback (no email sent) | ⏳ Outstanding — stub fetch to reject, confirm mailto draft + fallback message |

**Transport status: INTERIM.** Browser-direct FormSubmit exposes the
destination mechanism and offers limited server-side abuse protection.
Target production architecture: **Resend + server-side validation + rate
limiting + Cloudflare Turnstile** (Conversion & Operations milestone;
requires owner approval — paid service + privacy update).

## 10. GitHub protection — current limitation

GitHub Free does not enforce rulesets/required checks for this private
repository. The desired `main` protections are documented but currently
procedural rather than technically enforced. Until GitHub Pro:

- Continue using branches and draft PRs; **never push directly to `main`**.
- Squash-only and auto-delete are configured (these GitHub does permit).
- Run `quality` on every PR even though it cannot block merging.
- Treat a failed or missing `quality` check as a manual merge prohibition.
- Admin bypass is emergency-only, with documented justification.

**Intended ruleset (activate when Pro is purchased):** PR required; 0
approvals (single maintainer); conversations resolved; force-push and
deletion of `main` blocked; linear history; squash-only; branch up to
date; required check: `quality`.

## 11. Editing the site — the GRØNN Editor

Text and photos are edited **directly on the live site**, no code
involved. Verified end-to-end by the owner on 20 Jul 2026.

**How to edit (also works from a phone):**
1. Go to **gronn.studio/editor** → *Sign in with Google* →
   hello@gronn.studio (only this account is accepted).
2. *Go to the site*. Editable text shows a dashed orange outline on
   hover; click it to edit **English and Dutch together**, always both.
3. Photos on project pages show *Replace photo* — pick a file, done.
4. Hit **Publish** in the toolbar (bottom right). Changes are live in
   seconds. **Backup** downloads the whole content document as JSON.
5. *Exit* signs you out; visitors never see any editor UI.

**How it works / where things live:**
- Content lives as one JSON document in the private Vercel Blob store
  `gronn-content` (path `content/site-content.json`). Photos under
  `images/`. Every publish snapshots to `backups/<timestamp>.json` —
  restore = re-publish a backup (ask an agent, or use the Backup file).
- The site reads through `src/lib/content.ts` (cache tag `content`);
  a publish revalidates the tag. If Blob is ever unreachable the site
  falls back to the committed `content/site-content.json` — worst case
  it shows the last committed content, never an error.
- Editor code: `src/editor/` (self-contained, reusable for
  Equilibrium). Auth: `src/lib/auth.ts` (next-auth v4, Google, JWT,
  one-email allowlist). Env vars in Vercel: `GOOGLE_CLIENT_ID/SECRET`,
  `NEXTAUTH_SECRET/URL`, `BLOB_STORE_ID` (auto) **and
  `BLOB_READ_WRITE_TOKEN` (NOT auto — set it by hand)**. Both are
  needed, and the reason is not obvious: `@vercel/blob` has two
  credential paths. `put`/`head`/`list` accept Vercel's OIDC identity
  together with `BLOB_STORE_ID`, which is what linking the store gives
  you. `handleUpload` — used only by `/api/intake/photo`, to mint the
  token the browser uploads a file with — has no OIDC path and needs
  the read-write token. A store linked the modern way therefore serves
  every server-side write and refuses every browser upload.
- **Sanity is NOT used** — the integration was removed from the codebase
  on 1 Aug 2026 (git history preserves it). The Sanity account/project
  `j10z1n29` was left untouched; the owner may still revoke it at
  manage.sanity.io.

**If editing breaks:**
1. Sign-in fails → check the Google OAuth client (console.cloud.google.com,
   project gronn-503016) and Vercel env vars.
2. Publish fails → Vercel dashboard → Storage → `gronn-content` exists
   and is connected; check function logs (`npx vercel logs gronn.studio`).
3. Site shows old content after publish → hard refresh; then check
   `/api/editor/content` returns the new text when signed in.
4. **Intake files fail while the enquiry itself arrives** — the log
   shows `POST /api/intake → 200` next to `POST /api/intake/photo → 400`
   → `BLOB_READ_WRITE_TOKEN` is missing (see the env vars above). The
   route now says so in as many words: look for
   `[gronn] intake upload token refused` in the function logs. Two 400s
   per file is normal in that state, not two separate failures — the
   browser tries a private write first and falls back to public.

## 12. Audit log

**30 Aug 2026 — adversarial audit of the intake path (42 agents).**
**30 findings confirmed, 6 refuted.** Seven were fixed the same day in
PR #102; the sharpest of those: the notification email that fires on a
new enquiry carried the client's full 12,000-character answer sheet to
FormSubmit whenever `SLACK_WEBHOOK_URL` is unset — which is the current
configuration. It is now a notification and nothing more.

**23 findings remain open.** The two sharpest: `bg-accent` under
`text-gronn-white` measures 1.15:1 on five palettes, Blue Hour among
them (note that `check-contrast` only audits the pairs it is told about,
and axe never reaches an authenticated route); and `/contact/intake` has
never been through the axe sweep at all.

Two defects found in the same period were repaired rather than logged as
findings, because they were destroying data: the intake reference
mismatch that silently dropped every attached file for five of nine
realistic project names (PR #98), and a path by which creating a quote
from a cold page load could overwrite the entire administration and
restart the numbering.

**19 Jul 2026 — automated ops audit (partial run).** Four audit areas were
attempted (domain, deploy, code health, compliance); the run was cut short
by a spend limit, so only the code-health area completed with adversarial
verification. One finding confirmed and fixed the same day: the contact
form's mailto fallback omitted the visitor's typed email address, so the
studio couldn't distinguish the nominated reply address from the sender's
mail account (fixed in `intake-form.tsx`). Unverified candidate findings
from the interrupted run worth revisiting in a future audit: no rate
limiting on `/api/contact`, no security headers, menu overlay lacks an
Escape-key close, keyboard operability of the living-system diagram, and
the "Utrecht, NL" hero line vs. the registered address in Stein (LB).
