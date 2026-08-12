# Standing protocol (permanent — applies to every request in this repository)

Set by Eng. Mohammad Shakil. Follow this sequence for **every** incoming message,
without being asked:

1. **Study** — read the complete message *and* the whole project folder in depth.
2. **Analyse** — filter, gap-check, and assess against what already exists here.
3. **Plan** — produce a clear build plan before touching anything.
4. **Build** — complete, working deliverables. Front end *and* back end. Never an
   aesthetic mock-up; always a real MVP that runs.
5. **Save** — everything into this project folder.
6. **Push to git** — branch `claude/franchisee-marketing-portal-ngrd74`, repo
   `aansh-afk/VVG-demo`. Open a draft pull request.
7. **Deploy** — prepare everything deploy-ready and deploy where credentials allow.
8. **Make live** — verify the deployment actually works before reporting done.

## Standing preferences

- **Bilingual English + native-quality Arabic.** Arabic is authored, proofread
  Modern Standard Arabic in the Saudi institutional register — never machine
  translation. Full RTL support on every page.
- **Mobile-first**, responsive throughout.
- **Voice input** (🎤) on free-text fields, Arabic or English, feeding an AI
  message/email generator that returns a professional draft in *both* languages.
- **Everything in-platform.** Member communication and approvals are the system
  of record inside the portal. Email is a notification layer at most — never the
  place a decision is taken.
- **Real authentication and role-based dashboards**: super admin → admin →
  member, each with its own console, plus an append-only audit trail.
- **Prove it works.** Type-check, build, run, and exercise the real flows in a
  browser before reporting completion. `npm run test:e2e` exists for this.

## This project

**VVG Franchisee Marketing Cooperative Portal** — a franchise marketing
cooperative. Board hierarchy with clickable public profiles, an events and live
activities programme (this cooperative's headline module), cross-border franchise
opportunities, a worldwide franchise-association directory, an information centre
of regulators and chambers, in-platform approvals and messaging, and an AI
voice→bilingual-correspondence composer.

Reference platform the founder works from: <https://cms-osp.nttgroups.com>
Sister project: WASL (وصل) — Saudi event coordination platform, same patterns.

## Architecture note (read before changing the stack)

This portal deliberately has **no external service dependency**. No Convex, no
auth provider, no mandatory database account. It boots, seeds itself and runs on
`npm run dev` or a bare `vercel deploy` with zero configuration, and becomes
production-durable by setting one `DATABASE_URL`. That property was chosen
because provisioning third-party accounts was the recurring thing that blocked
this project from going live. Do not reintroduce a required external service
without a deliberate decision.
