# VVG Franchisee Marketing Cooperative Portal — Study, Analysis and Plan

Version 1.0 · 12 August 2026
Protocol followed: **Study → Analyse → Plan → Build → Save → Push → Deploy → Live**

---

## 1. Study

### 1.1 What was read

- The founder's brief for this project: *"a franchisee marketing cooperative…
  the same kind of portal, but **instead of the embassies we put events** …
  and here we must have complete live activities … also the complete dashboard,
  admin dashboard, the super admin dashboard."*
- The full reference brief carried over from the sister project (WASL), which
  set the quality bar: a real MVP with front end and back end, not an aesthetic
  mock-up; board photographs that open into full profiles; every stakeholder
  able to connect and send approvals **through the system, not by email**;
  member companies uploading their own data; cross-border franchise matchmaking
  (a Saudi brand offering a franchise into Malaysia or Singapore, and the
  Malaysian company being able to see it); a worldwide directory of franchise
  associations with addresses; an information centre with the right contact
  person and email for each body; bilingual English/native Arabic; voice notes
  everywhere feeding an AI email generator; ERP-grade dashboards.
- The uploaded `WASLGlobal.zip`, including the earlier `Franchise_Cooperative_Portal`
  build (≈1,400 lines, six pages, Convex-backed) and its researched World
  Franchise Council dataset.
- The reference platform the founder benchmarks against: <https://cms-osp.nttgroups.com>.

### 1.2 Requirements extracted

| # | Requirement | Where it landed |
|---|---|---|
| 1 | Events & activities replace the embassy module as the headline | `/events`, `/events/[slug]`, registration + approval flow |
| 2 | Complete live activities | `/activity` — append-only public stream, also embedded in the hero and both dashboards |
| 3 | Board hierarchy; photo → full profile | `/board` (chairman → officers → members), `/board/[slug]` full profile with bio, mandate, committees, contact |
| 4 | Complete admin **and** super admin dashboards | `/portal` role-aware, `/portal/admin/*`, `/portal/approvals` |
| 5 | Everything through the system, no email approvals | Approvals queue is the system of record; in-platform messaging |
| 6 | Members upload their own company/product data | `/portal/organization`, published to `/members/[slug]` on verification |
| 7 | Cross-border franchise matchmaking | `/opportunities` + `/portal/opportunities` (publish, express interest, receive enquiries) |
| 8 | Worldwide franchise associations with addresses | `/associations` — 47 bodies, searchable, each with a Maps link |
| 9 | Information centre with named contact points | `/info-centre` — regulators, chambers, partner associations, support bodies |
| 10 | Bilingual EN/AR, native Arabic, full RTL | Cookie-driven locale, `dir="rtl"` server-rendered, authored Arabic throughout |
| 11 | Voice note → AI bilingual email | `/portal/compose` + 🎤 on every long free-text field site-wide |
| 12 | Mobile-first | Responsive grid throughout; nav collapses to a sheet menu |

---

## 2. Analysis

### 2.1 What the earlier build got right, and what it did not

The previous `Franchise_Cooperative_Portal` had the right *shape* — Convex
schema, board table, WFC dataset, deterministic AI email engine — but it was
thin against the brief: six pages, no event module at all, no admin console
beyond a single dashboard page, no approvals engine, no member profiles, no
audit trail. It also had never run, because it could not: every path to a live
deployment went through provisioning a Convex account interactively.

**That is the single most important finding.** Across the previous sessions the
work repeatedly reached "built and pushed" and then stopped at "founder must now
run `npx convex dev` and log in". The blocker was never the code.

### 2.2 The architectural decision

This portal is built with **no required external service**:

| Concern | Previous | Now |
|---|---|---|
| Backend | Convex (account required) | Next.js server actions — nothing to provision |
| Auth | `@convex-dev/auth` | scrypt + signed HTTP-only session cookies, in-repo |
| Data | Convex tables | One JSON document behind three interchangeable drivers |
| Deploy | Convex + Vercel, two logins | Import the repo into Vercel. That is the whole procedure. |

The storage driver is chosen automatically at boot:

- **`postgres`** when `DATABASE_URL` is set — durable, shared across instances.
  Any provider (Vercel Postgres, Neon, Supabase, RDS); the one table is created
  automatically.
- **`file`** when the filesystem is writable — durable across restarts on any
  Node host.
- **`memory`** on a read-only filesystem — fully functional, resets on recycle.

So the portal is usable in one command today, and becomes production-durable by
pasting one environment variable. The super admin's System page states plainly
which driver is live and what its limits are.

The honest limit: a single-document store is right at cooperative scale
(thousands of records) and is deliberately not built for millions of rows. If the
member register ever outgrows it, `lib/db.ts` is the only file that changes.

### 2.3 Data-integrity rules applied

- **Board profiles** are seeded as realistic but clearly-labelled demonstration
  records (`isDemo`), with a banner on both the hierarchy and every profile page.
  The structure is complete and ready to receive the cooperative's real names,
  photographs, biographies and emails.
- **Information centre** entries carry only each body's official public link and
  are flagged `verified: false` with a standing "verify before publishing"
  notice, because the named contact points have not been confirmed by the team.
- **Associations** are researched data from the World Franchise Council members
  directory and carry their source string and access date on every record.
- **Membership pricing** is flagged as an assumption pending board ratification.
- **Member organisations, events and opportunities** in the seed are illustrative
  and use `.example` domains so they can never be mistaken for real contacts.

### 2.4 The AI approach

Bilingual draft generation is deterministic and template-driven — no API key, no
external call, no per-message cost, and the formal register that Saudi
institutional correspondence expects. This matches the founder's reference
platform, which uses pattern-based generation rather than an LLM. `generateDraft`
in `lib/ai.ts` is the single seam: swapping in an LLM later means replacing one
function body, with no change to the composer UI or the stored draft shape.

Voice input uses the browser's on-device Web Speech API (`ar-SA` / `en-US`), so
dictation never leaves the device. Where a browser lacks it, the microphone
button hides itself and the field stays an ordinary textarea.

---

## 3. Plan (executed in this order)

| # | Step | Status |
|---|---|---|
| 1 | Study the brief, the zip, and the previous build | done |
| 2 | This document + the standing protocol in `CLAUDE.md` | done |
| 3 | Scaffold: Next.js 15 + TypeScript + Tailwind, storage engine, auth, i18n | done |
| 4 | Domain model and self-seeding dataset | done |
| 5 | Public site: home, events, live activity, board hierarchy + profiles, members, opportunities, associations, information centre, membership, about, contact | done |
| 6 | Portal: member console, approvals engine, messaging, AI composer | done |
| 7 | Admin and super-admin dashboards: events, member verification, users & roles, audit trail, system | done |
| 8 | Verify: type-check, production build, browser-driven end-to-end suite | done — 21/21 |
| 9 | Push to `claude/franchisee-marketing-portal-ngrd74`, open a draft PR | done |
| 10 | Deploy to Vercel and make live | **needs the founder's Vercel account** — see `DEPLOYMENT.md`; the build is import-and-go with no configuration |

---

## 4. Open decisions for the founder

1. **Brand.** "VVG Franchise Cooperative" is used throughout as a working name,
   with the Arabic rendered as «تعاونية في في جي للامتياز التجاري». Confirm the
   real name, its Arabic form, the logo and the domain. It is set in one place:
   the `brand` / `brandShort` entries in `lib/i18n.ts`.
2. **Board data.** Real names, photographs, biographies, mandates, committee
   memberships and public emails, to replace the demonstration records.
3. **Information centre.** Which bodies to feature at launch, and the confirmed
   contact person and email for each, so the `verified` flag can be set.
4. **Membership fees.** The five tiers and their prices are working assumptions.
5. **Storage.** Whether to add a Postgres `DATABASE_URL` at launch (recommended
   for a live multi-user portal) or run on the file driver initially.
6. **Arabic review.** All Arabic here is authored, not machine-translated, but it
   should still pass the cooperative's own Arabic editor before launch.

---

## 5. Sources

- World Franchise Council — members directory: <https://worldfranchisecouncil.net/members/>
  (47 bodies captured: the WFC itself, 3 regional federations, 43 national
  associations; accessed 12 August 2026, mirrored to `data/associations.json`)
- International Franchise Association — franchise associations worldwide:
  <https://www.franchise.org/franchise-associations-worldwide/>
- Saudi Franchise Law (2019), Ministry of Commerce: <https://mc.gov.sa>
- Monsha'at franchise programmes: <https://www.monshaat.gov.sa>
- Reference platform: <https://cms-osp.nttgroups.com>
