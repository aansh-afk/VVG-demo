# Deploying the portal

The whole point of this build's architecture is that deployment is one step.
There is no backend to provision, no account to create, no API key to obtain.

---

## 1. The fastest route — Vercel

1. Go to <https://vercel.com/new>.
2. Import `aansh-afk/WASL-Global` and pick the branch you want
   (`claude/franchisee-marketing-portal-ngrd74`, or `main` once it is merged).
3. Leave every setting as detected — framework Next.js, root directory `./`,
   build command `next build`. **Add nothing.**
4. Deploy.

The portal comes up and seeds itself. Sign in with the super admin credentials
from the README (or from the panel on the sign-in page).

### Then make it durable

Straight after deploying, the portal is running on the **memory** driver, because
Vercel's filesystem is read-only. Everything works, but data resets whenever an
instance recycles. The super admin's **System** page says so explicitly.

To fix that, add a Postgres database — five minutes, still inside Vercel:

1. In your Vercel project: **Storage → Create Database → Postgres**.
2. Vercel injects `POSTGRES_URL` automatically. Add one more variable so this app
   picks it up:
   **Settings → Environment Variables → Add**
   `DATABASE_URL` = the same connection string Vercel shows for the database.
3. While you are there, add:
   `SESSION_SECRET` = a long random string, so people stay signed in across
   deploys. Generate one with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` = your real credentials.
4. Redeploy.

The single table is created automatically on first connection. Confirm on
**/portal/admin/system** that the driver now reads `POSTGRES`.

Any Postgres works equally well — Neon, Supabase, RDS. Only `DATABASE_URL`
matters.

---

## 2. Any Node host (Render, Railway, a VPS, Docker)

```bash
npm ci
npm run build
npm start                     # listens on $PORT, default 3000
```

Here the **file** driver is used by default and data persists to `.data/db.json`
across restarts. Mount that directory on a volume if the host has ephemeral
disk. Setting `DATABASE_URL` still upgrades you to Postgres and is what you want
if you run more than one instance.

---

## 3. Before you go live

- [ ] Set `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` to real values, and
      change the password again after the first sign-in.
- [ ] Set `SESSION_SECRET`.
- [ ] Set `DATABASE_URL` (required on Vercel or any multi-instance host).
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the live domain.
- [ ] Remove the demonstration-accounts panel from
      `app/(site)/sign-in/page.tsx`.
- [ ] Replace the board demonstration records with the cooperative's real
      names, photographs, biographies and emails.
- [ ] Confirm the information-centre contact points and set `verified: true` on
      the entries you have checked.
- [ ] Have the cooperative's Arabic editor review the copy in `lib/i18n.ts` and
      `lib/seed.ts`.
- [ ] Confirm the membership tiers and prices with the board.

---

## 4. Verifying a deployment

Point the end-to-end suite at the live URL:

```bash
E2E_BASE_URL=https://your-deployment.vercel.app \
E2E_SUPER_ADMIN_EMAIL=… E2E_SUPER_ADMIN_PASSWORD=… \
E2E_MEMBER_EMAIL=… E2E_MEMBER_PASSWORD=… \
npm run test:e2e
```

(The credential variables are only needed once you have removed the
demonstration-accounts panel from the sign-in page — before that, the suite
reads them from the page itself.)

It signs in as each role, takes a real approval decision, generates a bilingual
draft, posts a message, registers for an event, checks role isolation and flips
the site into Arabic. Note that it *writes* — run it against a staging
deployment, or reset afterwards from **/portal/admin/system**.

---

## 5. If something looks wrong

**Everyone is signed out after a deploy.** `SESSION_SECRET` is unset, so a new
signing key was generated at boot. Set it.

**Data disappeared.** The System page will show the `MEMORY` driver. Set
`DATABASE_URL`.

**Changes made in one browser tab are not visible in another.** More than one
instance is running on the file or memory driver, each with its own copy. Set
`DATABASE_URL`.

**The microphone button is missing.** The browser has no Web Speech API — this is
normal in Firefox and some in-app browsers. The field still works as a textarea.
Chrome, Edge and Safari have it.
