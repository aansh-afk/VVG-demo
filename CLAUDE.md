# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Standing protocol (permanent — applies to every request in this repository)

Set by Eng. Mohammad Shakil. Follow this sequence for **every** incoming message,
without being asked:

1. **Study** — read the complete message *and* the whole project folder in depth.
2. **Analyse** — filter, gap-check, and assess against what already exists here.
3. **Plan** — produce a clear build plan before touching anything.
4. **Build** — complete, working deliverables. Front end *and* back end. Never an
   aesthetic mock-up; always a real MVP that runs.
5. **Save** — everything into this project folder.
6. **Push to git** — branch `claude/franchisee-marketing-portal-ngrd74`, repo
   `aansh-afk/WASL-Global`. Open a draft pull request.
7. **Deploy** — prepare everything deploy-ready and deploy where credentials allow.
8. **Make live** — verify the deployment actually works before reporting done.

### Standing preferences

- **Bilingual English + native-quality Arabic.** Arabic is authored, proofread
  Modern Standard Arabic in the Saudi institutional register — never machine
  translation. Full RTL on every page.
- **Mobile-first**, responsive throughout.
- **Voice input** (🎤) on free-text fields, Arabic or English, feeding a message
  generator that returns a professional draft in *both* languages.
- **Everything in-platform.** Member communication and approvals are the system
  of record inside the portal. Email is a notification layer at most — never the
  place a decision is taken.
- **Real authentication and role-based dashboards**: super admin → admin →
  member, each with its own console, plus an append-only audit trail.
- **Prove it works.** Type-check, build, run, and exercise the real flows in a
  browser before reporting completion.

Reference platform the founder works from: <https://cms-osp.nttgroups.com>.
Sister project: WASL (وصل) — Saudi event coordination platform, same patterns.

---

## Commands

```bash
npm install
npm run dev          # http://localhost:3000 — seeds itself, no configuration
npm run typecheck    # tsc --noEmit
npm run build
npm start            # production server
npm run test:e2e     # browser-driven suite; needs a server already running
```

`npm run test:e2e` runs `tests/e2e.js` — a single Playwright script, not a test
framework, so there is no per-test filter. To narrow it, comment out sections or
copy the block you care about. Useful environment variables:

- `E2E_BASE_URL` — target a deployment instead of `localhost:3000`.
- `CHROMIUM_PATH` — when Chromium lives outside Playwright's default location.
- `E2E_SUPER_ADMIN_EMAIL` / `E2E_SUPER_ADMIN_PASSWORD` / `E2E_MEMBER_EMAIL` /
  `E2E_MEMBER_PASSWORD` — required only once the demonstration-accounts panel has
  been removed from the sign-in page; otherwise the suite reads them from it.

**The suite writes.** Run it against a fresh `./.data` or a staging deployment,
and reset afterwards from `/portal/admin/system`. Delete `.data/` to re-seed —
but stop the server first: it holds the database in memory and writing to a
deleted directory fails.

---

## Architecture

### The deliberate constraint: no required external service

There is no Convex, no auth provider, no mandatory database account. The portal
boots, seeds itself and runs on `npm run dev` or a bare `vercel deploy` with zero
configuration, and becomes production-durable by setting one `DATABASE_URL`.

That property was chosen because provisioning third-party accounts was the
recurring thing that blocked this project from going live. **Do not reintroduce a
required external service without a deliberate decision.**

### Storage (`lib/db.ts`)

The entire portal state is one JSON document (`Database` in `lib/models.ts`)
written through a driver chosen automatically at boot:

| Driver | When | Durability |
|---|---|---|
| `postgres` | `DATABASE_URL` set | Durable, shared across instances. Production. |
| `file` | writable filesystem | `.data/db.json`; survives restarts, one instance only. |
| `memory` | read-only filesystem | Works fully, resets on recycle. |

`read()` returns a snapshot — never mutate it. All writes go through
`mutate(fn)`, which serialises read-modify-write cycles and persists the whole
document. Under Postgres it re-reads first so concurrent instances don't clobber
each other.

This shape suits cooperative scale (thousands of records) and is deliberately not
built for millions of rows. `lib/db.ts` is the only file that would change.

### Module state must live on `globalThis`

A production Next.js build bundles a module **separately into each route**, so
module-level `let` gives every route its own copy. Two real bugs came from this
and are fixed the same way — a single global holder:

- `lib/db.ts` — the cache, driver and write queue (`__waslDb`). Otherwise a write
  in one route is invisible in the next.
- `lib/auth.ts` — the generated fallback session key (`__waslSessionSecret`).
  Otherwise a cookie signed by one route fails to verify in another.

Keep this in mind before adding any module-level mutable state.

### Authentication and authorisation (`lib/auth.ts`)

scrypt password hashing (`lib/auth-hash.ts`, split out to avoid the
`auth → db → seed → auth` import cycle), signed HTTP-only session cookies, and
three roles: `member` → `admin` → `super_admin`.

- **Server actions** use `requireRole(role)`, which throws.
- **Server components** use `pageUser()` / `pageRole(role)`, which redirect. A
  layout's `redirect()` does *not* stop the page beneath it from rendering, so
  every page under `/portal` re-checks for itself.

The UI hides what you cannot do, but the check that matters is in
`app/actions.ts`, server-side, on every write.

### Writes all live in `app/actions.ts`

One file holds every mutation. `decideApproval` is the important one: approving
is what actually verifies a member, publishes an event or opportunity, or
confirms a seat — the side effects are in `applyDecision`. Adding an approval
kind means extending both `ApprovalKind` and that switch.

Every mutation should also call `log()` from `lib/activity.ts` inside the same
`mutate` callback, so the record and the change it describes persist together.
`visibility: "public"` entries surface on the site's live activity feed;
`"internal"` ones are the audit trail. It is one append-only log serving both.

### Bilingual rendering

Locale is a cookie read server-side (`getLocale()`), so `dir="rtl"` is applied on
the first render — there is no left-to-right flash and no route-based i18n.

- UI strings: `lib/i18n.ts`, via `tr(locale)` / `t(locale, key)`.
- Content: bilingual `Bi { en, ar }` fields on the models, read with `bi(locale, …)`.
- Dates, money and relative times use the deterministic formatters in
  `lib/i18n.ts` — not `Intl` — so server and client output match exactly. Pass
  `now` into `timeAgo` from the page rather than reading the clock in a component.
- Text a **person** authored gets the `.bidi-auto` class (`unicode-bidi:
  plaintext`) so a Latin quotation inside an Arabic block keeps its punctuation
  at the right margin. The property does not inherit — put it on the text element
  itself, not a wrapper.

### Seed data (`lib/seed.ts`)

Dates are anchored to a fixed epoch so the demo timeline is reproducible. Two
categories are deliberately labelled and the UI shows banners for them: board
members carry `isDemo`, and information-centre entries carry `verified: false`.
Seeded organisations use `.example` domains so they can never be mistaken for
real contacts. `data/associations.json` is researched World Franchise Council
data and every record keeps its source string.

### Routing

- `app/(site)/…` — public pages, sharing `SiteHeader` / `SiteFooter`.
- `app/portal/…` — authenticated; the layout builds its nav from the caller's role.
- Pages are server components; forms are client components using
  `useActionState` against the actions in `app/actions.ts`.

---

## Background

- `README.md` — what the portal does, route by route, and how to verify it.
- `DEPLOYMENT.md` — deploying, and the pre-launch checklist.
- `docs/00_Study_Analysis_and_Plan.md` — the brief, the analysis, the
  architectural decision, and the open decisions awaiting the board (brand name,
  real board data, information-centre contact points, membership fees).
