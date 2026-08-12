import Link from "next/link";
import { getLocale, pageUser } from "@/lib/auth";
import { bi, formatDate, formatMoney, tr } from "@/lib/i18n";
import { db, upcomingEvents } from "@/lib/queries";
import { Empty, StatusPill } from "@/components/ui";

/** A member's own registrations, plus what else they could still book. */
export default async function MyEventsPage() {
  const user = await pageUser();
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const now = Date.now();
  const ar = locale === "ar";

  const regs = d.registrations
    .filter((r) => r.userId === user.id)
    .sort((a, b) => b.createdAt - a.createdAt);
  const registeredIds = new Set(regs.map((r) => r.eventId));
  const open = upcomingEvents(d, now).filter((e) => !registeredIds.has(e.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{T("portal_my_events")}</h1>
        <p className="prose-body mt-1 text-sm">
          {ar
            ? "تسجيلاتك وحالتها في قائمة موافقات المنظّم."
            : "Your registrations and where they stand in the organiser's approval queue."}
        </p>
      </div>

      <section className="card overflow-hidden">
        <h2 className="border-b border-brand-900/8 bg-brand-50/60 px-5 py-3 text-sm font-semibold">
          {ar ? "تسجيلاتي" : "My registrations"}
        </h2>
        {regs.length === 0 ? (
          <div className="p-5">
            <Empty>{ar ? "لا توجد تسجيلات." : "No registrations yet."}</Empty>
          </div>
        ) : (
          <ul className="divide-y divide-brand-900/8">
            {regs.map((r) => {
              const ev = d.events.find((e) => e.id === r.eventId);
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={ev ? `/events/${ev.slug}` : "/events"}
                      className="block truncate text-sm font-medium text-brand-900 hover:text-brand-700"
                    >
                      {ev ? bi(locale, ev.title) : "—"}
                    </Link>
                    <div className="text-xs text-brand-900/50">
                      {ev ? `${formatDate(locale, ev.startsAt)} · ${ev.city}` : ""} · {r.seats}{" "}
                      {ar ? "مقعد" : r.seats === 1 ? "seat" : "seats"}
                      {r.note ? ` · ${r.note}` : ""}
                    </div>
                  </div>
                  <StatusPill status={r.status} locale={locale} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="card overflow-hidden">
        <h2 className="border-b border-brand-900/8 bg-brand-50/60 px-5 py-3 text-sm font-semibold">
          {ar ? "متاح للتسجيل" : "Open for registration"}
        </h2>
        {open.length === 0 ? (
          <div className="p-5">
            <Empty>{T("none_yet")}</Empty>
          </div>
        ) : (
          <ul className="divide-y divide-brand-900/8">
            {open.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <span
                  aria-hidden
                  className={`h-9 w-1.5 shrink-0 rounded-full bg-gradient-to-b ${e.coverTone}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-brand-900">
                    {bi(locale, e.title)}
                  </div>
                  <div className="text-xs text-brand-900/50">
                    {formatDate(locale, e.startsAt)} · {e.city} ·{" "}
                    {e.feeSar === 0 ? T("events_free") : formatMoney(locale, e.feeSar)}
                  </div>
                </div>
                <Link href={`/events/${e.slug}`} className="btn-ghost btn-sm">
                  {T("events_register")}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
