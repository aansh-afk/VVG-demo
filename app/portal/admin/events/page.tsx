import Link from "next/link";
import { atLeast, getLocale, pageRole } from "@/lib/auth";
import { bi, formatDate, formatMoney, tr } from "@/lib/i18n";
import { db, seatsTaken } from "@/lib/queries";
import EventForm from "@/components/EventForm";
import EventStatusControls from "@/components/EventStatusControls";
import { Empty, StatusPill } from "@/components/ui";

export default async function AdminEventsPage() {
  const user = await pageRole("admin");

  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const ar = locale === "ar";

  const events = [...d.events].sort((a, b) => b.startsAt - a.startsAt);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{T("portal_admin_events")}</h1>
        <p className="prose-body mt-1 text-sm">
          {ar
            ? "أنشئ الفعاليات وتابع الإشغال وغيّر حالتها. النشر يمر عبر اعتماد المشرف العام."
            : "Create events, watch occupancy and move them through their states. Publication routes through the super admin for approval."}
        </p>
      </div>

      <section className="card overflow-hidden">
        <h2 className="border-b border-brand-900/8 bg-brand-50/60 px-5 py-3 text-sm font-semibold">
          {ar ? `جميع الفعاليات (${events.length})` : `All events (${events.length})`}
        </h2>
        {events.length === 0 ? (
          <div className="p-5">
            <Empty>{T("none_yet")}</Empty>
          </div>
        ) : (
          <ul className="divide-y divide-brand-900/8">
            {events.map((e) => {
              const taken = seatsTaken(d, e.id);
              const pendingRegs = d.registrations.filter(
                (r) => r.eventId === e.id && r.status === "pending"
              ).length;
              return (
                <li key={e.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <span
                      aria-hidden
                      className={`h-10 w-1.5 shrink-0 rounded-full bg-gradient-to-b ${e.coverTone}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/events/${e.slug}`}
                          className="truncate text-sm font-medium text-brand-900 hover:text-brand-700"
                        >
                          {bi(locale, e.title)}
                        </Link>
                        <StatusPill status={e.status} locale={locale} />
                        {pendingRegs > 0 && (
                          <span className="rounded-full bg-gold-400 px-2 py-0.5 text-[10px] font-bold text-brand-900">
                            {pendingRegs} {ar ? "طلب" : "requests"}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-brand-900/50">
                        {e.category} · {formatDate(locale, e.startsAt, true)} · {e.city} ·{" "}
                        {taken}/{e.capacity} {ar ? "مقعد" : "seats"} ·{" "}
                        {e.feeSar === 0 ? T("events_free") : formatMoney(locale, e.feeSar)}
                      </div>
                      <div className="mt-2.5">
                        <EventStatusControls eventId={e.id} current={e.status} locale={locale} />
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="card p-6">
        <h2 className="mb-4 text-base font-semibold">
          {ar ? "فعالية جديدة" : "New event"}
        </h2>
        <EventForm locale={locale} />
      </section>
    </div>
  );
}
