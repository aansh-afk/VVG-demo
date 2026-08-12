import Link from "next/link";
import { getLocale } from "@/lib/auth";
import { bi, formatMoney, tr } from "@/lib/i18n";
import { db, publishedOpportunities, seatsTaken, upcomingEvents, verifiedOrgs } from "@/lib/queries";
import { recentActivity } from "@/lib/activity";
import ActivityFeed from "@/components/ActivityFeed";
import EventCard from "@/components/EventCard";
import { Avatar, SectionHeading, Stat } from "@/components/ui";

export default async function HomePage() {
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const now = Date.now();

  const events = upcomingEvents(d, now).slice(0, 3);
  const opps = publishedOpportunities(d).slice(0, 3);
  const members = verifiedOrgs(d);
  const feed = recentActivity(d, { visibility: "public", limit: 7 });
  const leadership = d.board.filter((b) => b.tier <= 2).sort((a, b) => a.tier - b.tier || a.order - b.order);

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(60%_120%_at_80%_-10%,rgba(212,175,55,.28),transparent),radial-gradient(50%_100%_at_0%_100%,rgba(31,115,89,.55),transparent)]"
        />
        <div className="container-x relative grid gap-10 py-16 lg:grid-cols-[1.15fr_1fr] lg:py-24">
          <div className="animate-fade-up">
            <span className="pill bg-white/10 text-gold-300">{T("home_hero_kicker")}</span>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              {T("home_hero_title")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75">
              {T("home_hero_body")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/sign-up" className="btn-gold">
                {T("home_cta_join")}
              </Link>
              <Link href="/events" className="btn border border-white/25 text-white hover:bg-white/10">
                {T("home_cta_events")}
              </Link>
            </div>
          </div>

          {/* Live feed sits in the hero — the activity stream is the point of the portal. */}
          <div className="card animate-fade-up overflow-hidden bg-white/95 p-5 backdrop-blur">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" aria-hidden />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-900">
                {T("home_live")}
              </h2>
              <Link
                href="/activity"
                className="ms-auto text-xs font-semibold text-brand-700 hover:text-brand-900"
              >
                {T("read_more")} →
              </Link>
            </div>
            <ActivityFeed entries={feed} locale={locale} now={now} dense />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- stats */}
      <section className="container-x -mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat value={members.length} label={T("home_stats_members")} />
        <Stat value={d.events.length} label={T("home_stats_events")} />
        <Stat value={publishedOpportunities(d).length} label={T("home_stats_opportunities")} />
        <Stat value={d.associations.length} label={T("home_stats_associations")} />
      </section>

      {/* ---------------------------------------------------------- events */}
      <section className="container-x py-14">
        <SectionHeading
          title={T("home_upcoming")}
          subtitle={T("events_sub")}
          action={
            <Link href="/events" className="btn-ghost btn-sm">
              {T("nav_events")} →
            </Link>
          }
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <EventCard key={e.id} event={e} locale={locale} seatsTaken={seatsTaken(d, e.id)} />
          ))}
        </div>
      </section>

      {/* --------------------------------------------------- opportunities */}
      <section className="bg-white py-14">
        <div className="container-x">
          <SectionHeading
            title={T("home_opportunities")}
            subtitle={T("opp_sub")}
            action={
              <Link href="/opportunities" className="btn-ghost btn-sm">
                {T("nav_opportunities")} →
              </Link>
            }
          />
          <div className="grid gap-5 md:grid-cols-3">
            {opps.map((o) => {
              const org = d.organizations.find((x) => x.id === o.organizationId);
              return (
                <Link
                  key={o.id}
                  href={`/opportunities/${o.slug}`}
                  className="card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar initials={org?.logoInitials ?? "??"} size="sm" tone="from-brand-600 to-brand-800" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-brand-900">{o.brandName}</div>
                      <div className="truncate text-xs text-brand-900/50">{o.sector}</div>
                    </div>
                  </div>
                  <p className="prose-body mt-3 line-clamp-3 flex-1 text-sm">{bi(locale, o.summary)}</p>
                  <dl className="mt-4 space-y-1.5 border-t border-brand-900/8 pt-3 text-xs">
                    <div className="flex justify-between gap-3">
                      <dt className="text-brand-900/50">{T("opp_targets")}</dt>
                      <dd className="truncate font-medium text-brand-800">
                        {o.targetCountries.join(", ")}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-brand-900/50">{T("opp_investment")}</dt>
                      <dd className="font-medium text-brand-800">
                        {formatMoney(locale, o.investmentFromSar)}+
                      </dd>
                    </div>
                  </dl>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ governance */}
      <section className="container-x py-14">
        <SectionHeading
          title={T("home_governance")}
          subtitle={T("home_governance_sub")}
          action={
            <Link href="/board" className="btn-ghost btn-sm">
              {T("nav_board")} →
            </Link>
          }
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {leadership.map((m) => (
            <Link
              key={m.id}
              href={`/board/${m.slug}`}
              className="card group flex flex-col items-center p-6 text-center transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Avatar initials={m.initials} tone={m.tone} size="lg" />
              <div className="mt-4 text-sm font-semibold text-brand-900 group-hover:text-brand-700">
                {locale === "ar" ? m.nameAr : m.name}
              </div>
              <div className="mt-1 text-xs text-brand-900/55">{bi(locale, m.title)}</div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
