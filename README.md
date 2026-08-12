# WASL Global Franchisee Marketing Cooperative Portal

A bilingual (English / Arabic) member portal for a franchise marketing
cooperative: events and live activities, governance with public board profiles,
cross-border franchise opportunities, a worldwide franchise-association
directory, in-platform approvals and messaging, and a voice-driven bilingual
correspondence composer.

It is a working application, front end and back end — not a mock-up.

```bash
npm install
npm run dev          # http://localhost:3000
```

There is nothing else to configure. No account to create, no database to
provision, no API key. The portal seeds itself on first boot with a complete,
realistic dataset and is immediately usable.

---

## Signing in

The seeded accounts are also listed on the sign-in page itself.

| Role | Email | Password |
|---|---|---|
| Super admin | `admin@wasl-global.org` | `ChangeMe!2026` |
| Administrator | `events.admin@wasl-global.org` | `Demo!2026` |
| Member | `saad-al-nasser@najd-hospitality-group.example` | `Demo!2026` |

Change `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` before going live, and remove
the demonstration-accounts panel from `app/(site)/sign-in/page.tsx`.

---

## What is in it

### Public site

| Route | What it does |
|---|---|
| `/` | Hero with the live activity stream, headline statistics, upcoming events, latest opportunities, board |
| `/events`, `/events/[slug]` | The events programme — happening now, upcoming, past. Detail pages carry the agenda, venue with a Maps link, live seat occupancy, and registration |
| `/activity` | The complete live activity feed. Staff additionally see internal entries |
| `/board`, `/board/[slug]` | Governance hierarchy — chairmanship, executive officers, board members. Every portrait opens a full public profile: biography, mandate, committees, contact |
| `/members`, `/members/[slug]` | Verified member directory, filterable by type and searchable. Profiles carry brands, outlets, published opportunities and representatives |
| `/opportunities`, `/opportunities/[slug]` | Cross-border franchise offers, filterable by target market. Signed-in members can express interest, delivered inside the portal |
| `/associations` | 47 franchise associations worldwide — the World Franchise Council, its regional federations and 43 national bodies, each with address, phone, officers, website and a Maps link |
| `/info-centre` | Regulators, chambers, partner associations and support bodies, each with its named contact point |
| `/membership` | The five membership tiers and how joining works |
| `/about`, `/contact` | The cooperative and its published points of contact |

### Member portal (`/portal`)

Overview, my organisation (the data that becomes the public member profile), my
events and registrations, my opportunities and the enquiries they attract, the
cooperative-wide message channel, and the AI message composer.

### Administration (`/portal/admin/*`)

- **Approvals** — the system of record. Approving here is what actually verifies
  a member, publishes an event or opportunity, or confirms a seat. Every decision
  is stored with its author, timestamp and note.
- **Event management** — create events and move them through draft → pending →
  published → live → completed, with occupancy and outstanding requests visible.
- **Members & verification** — the member register and each organisation's state.
- **Audit trail** — the append-only log, internal entries included.
- **Users & roles** *(super admin)* — promote, demote, suspend, reinstate.
- **System** *(super admin)* — which storage driver is live, data volume, reset.

### Cross-cutting

- **Bilingual.** One toggle flips the entire site, including `dir="rtl"`, applied
  server-side so there is no left-to-right flash. All Arabic is authored, not
  machine-translated.
- **Voice input.** Every long free-text field has a 🎤 button with an Arabic /
  English toggle, using the browser's on-device speech recognition. Where a
  browser lacks it, the button hides and the field still works.
- **AI composer.** Dictate or type in either language; get a formal draft in
  both, saved to your history. Deterministic and template-driven — no API key,
  no external call. `generateDraft` in `lib/ai.ts` is the single seam if you
  later want an LLM behind it.

---

## Architecture

```
app/
  (site)/          public pages, sharing the site header and footer
  portal/          authenticated portal; layout builds the nav from the caller's role
  actions.ts       every write in the application, each re-checking its role
components/        UI, including VoiceInput / VoiceField used across both areas
lib/
  models.ts        the domain model
  db.ts            the storage engine — postgres | file | memory
  seed.ts          the first-boot dataset
  auth.ts          scrypt hashing, signed session cookies, role checks
  i18n.ts          the bilingual dictionary and formatters
  ai.ts            bilingual draft generation
  activity.ts      the append-only log
data/              researched World Franchise Council directory
tests/e2e.js       browser-driven verification of the real flows
```

### Storage

The whole portal state is one JSON document written through one of three drivers,
chosen automatically at boot:

- **`postgres`** — when `DATABASE_URL` is set. Durable and shared across
  instances. Any provider works; the single table is created automatically.
  **This is the production configuration.**
- **`file`** — no `DATABASE_URL` but a writable filesystem. Persists to
  `.data/db.json`; durable across restarts on any Node host.
- **`memory`** — read-only filesystem. Fully functional, resets on recycle.

The super admin's System page always states which one is live.

This shape is right at cooperative scale — thousands of records — and is
deliberately not built for millions of rows. `lib/db.ts` is the only file that
would change.

### Authentication

Sessions are signed HTTP-only cookies; passwords are scrypt-hashed with a
per-password salt. Roles are `member` → `admin` → `super_admin`. The UI hides
what you cannot do, but the check that matters happens in `app/actions.ts`, on
the server, on every write.

---

## Verifying it

```bash
npm run typecheck
npm run build
npm start                      # in one terminal
npm run test:e2e               # in another
```

`tests/e2e.js` drives a real browser: it signs in as each role, takes an actual
approval decision and checks the side effect landed, generates a bilingual draft,
posts to the member channel, registers for an event, confirms a member cannot
reach super-admin routes, and flips the site into Arabic/RTL. Any uncaught client
error or 4xx response fails the run.

No credentials are hardcoded in the suite: against a seeded instance it reads
them from the demonstration-accounts panel on the sign-in page. Once you remove
that panel, supply them instead:

```bash
E2E_SUPER_ADMIN_EMAIL=… E2E_SUPER_ADMIN_PASSWORD=… \
E2E_MEMBER_EMAIL=… E2E_MEMBER_PASSWORD=… npm run test:e2e
```

---

## Configuration

Every variable is optional — see `.env.example`.

| Variable | Effect if unset |
|---|---|
| `SESSION_SECRET` | A key is generated per boot; sessions drop on restart |
| `DATABASE_URL` | Falls back to the file driver, then to memory |
| `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` | Defaults above are used |
| `NEXT_PUBLIC_SITE_URL` | Links in generated drafts use localhost |

---

## Deploying

See [`DEPLOYMENT.md`](./DEPLOYMENT.md). The short version: import the repository
into Vercel and press deploy. There is no build configuration to add.

## Background

[`docs/00_Study_Analysis_and_Plan.md`](./docs/00_Study_Analysis_and_Plan.md)
records the brief, the analysis, the architectural decision and the open
questions for the board. [`CLAUDE.md`](./CLAUDE.md) holds the standing working
protocol for this repository.
