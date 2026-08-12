import type { Metadata } from "next";
import { getLocale } from "@/lib/auth";
import { tr } from "@/lib/i18n";
import { db, pastEvents, seatsTaken, upcomingEvents } from "@/lib/queries";
import EventCard from "@/components/EventCard";
import { Empty, SectionHeading } from "@/components/ui";

export const metadata: Metadata = { title: "Events & Activities" };

export default async function EventsPage() {
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const now = Date.now();

  const upcoming = upcomingEvents(d, now);
  const live = upcoming.filter((e) => e.status === "live" || (e.startsAt <= now && e.endsAt >= now));
  const scheduled = upcoming.filter((e) => !live.includes(e));
  const past = pastEvents(d, now);

  return (
    <>
      <header className="border-b border-brand-900/10 bg-white">
        <div className="container-x py-12">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{T("events_title")}</h1>
          <p className="prose-body mt-3 max-w-2xl">{T("events_sub")}</p>
        </div>
      </header>

      <div className="container-x space-y-14 py-12">
        {live.length > 0 && (
          <section>
            <SectionHeading title={T("events_live_now")} />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {live.map((e) => (
                <EventCard key={e.id} event={e} locale={locale} seatsTaken={seatsTaken(d, e.id)} />
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionHeading title={T("events_upcoming")} />
          {scheduled.length === 0 ? (
            <Empty>{T("none_yet")}</Empty>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {scheduled.map((e) => (
                <EventCard key={e.id} event={e} locale={locale} seatsTaken={seatsTaken(d, e.id)} />
              ))}
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section>
            <SectionHeading title={T("events_past")} />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {past.map((e) => (
                <EventCard key={e.id} event={e} locale={locale} seatsTaken={seatsTaken(d, e.id)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
