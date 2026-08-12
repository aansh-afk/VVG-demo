import Link from "next/link";
import { atLeast, getLocale, pageUser } from "@/lib/auth";
import { bi, formatDate, tr } from "@/lib/i18n";
import { db, pendingApprovals, seatsTaken, upcomingEvents } from "@/lib/queries";
import { recentActivity } from "@/lib/activity";
import ActivityFeed from "@/components/ActivityFeed";
import { Banner, Empty, StatusPill } from "@/components/ui";

/** Role-aware landing page: the same route serves member, admin and super admin. */
export default async function PortalHome() {
  const user = await pageUser();
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const now = Date.now();
  const ar = locale === "ar";

  const org = d.organizations.find((o) => o.id === user.organizationId);
  const staff = atLeast(user, "admin");

  const myRegs = d.registrations.filter((r) => r.userId === user.id);
  const myOpps = org ? d.opportunities.filter((o) => o.organizationId === org.id) : [];
  const myInterestsReceived = org
    ? d.interests.filter((i) => myOpps.some((o) => o.id === i.opportunityId))
    : [];
  const queue = pendingApprovals(d);
  const upcoming = upcomingEvents(d, now).slice(0, 4);

  const tiles = staff
    ? [
        [queue.length, ar ? "موافقات معلّقة" : "Pending approvals", "/portal/approvals"],
        [
          d.organizations.filter((o) => o.verification === "pending").length,
          ar ? "أعضاء بانتظار التوثيق" : "Members awaiting verification",
          "/portal/admin/members",
        ],
        [
          d.events.filter((e) => e.status === "published" || e.status === "live").length,
          ar ? "فعاليات منشورة" : "Published events",
          "/portal/admin/events",
        ],
        [d.activity.length, ar ? "قيود في السجل" : "Log entries", "/portal/admin/audit"],
      ]
    : [
        [myRegs.length, ar ? "تسجيلاتي" : "My registrations", "/portal/events"],
        [myOpps.length, ar ? "فرصي" : "My opportunities", "/portal/opportunities"],
        [myInterestsReceived.length, ar ? "اهتمامات واردة" : "Enquiries received", "/portal/opportunities"],
        [d.messages.length, ar ? "رسائل القناة" : "Channel messages", "/portal/messages"],
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {ar ? "أهلاً" : "Welcome"}, {ar && user.fullNameAr ? user.fullNameAr : user.fullName}
        </h1>
        <p className="prose-body mt-1 text-sm">
          {org
            ? `${ar ? org.nameAr : org.name} · ${org.sector}`
            : ar
              ? "حساب إداري في أمانة التعاونية."
              : "A staff account in the cooperative's secretariat."}
        </p>
      </div>

      {org && org.verification === "pending" && (
        <Banner tone="warn">
          {ar
            ? "منشأتك قيد التوثيق لدى المشرف العام. يمكنك التصفح والتسجيل في الفعاليات الآن، ويُفتح نشر الفرص فور اعتماد التوثيق."
            : "Your organisation is awaiting verification by the super admin. You can browse and register for events now; publishing opportunities unlocks as soon as verification is approved."}
        </Banner>
      )}
      {org && org.verification === "rejected" && (
        <Banner tone="error">
          {ar
            ? "لم يُعتمد طلب التوثيق. تواصل مع الأمانة العامة عبر قناة الرسائل."
            : "The verification request was not approved. Contact the secretariat through the message channel."}
        </Banner>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(([value, label, href]) => (
          <Link
            key={String(label)}
            href={String(href)}
            className="card p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="text-3xl font-semibold tracking-tight text-brand-800">{value}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-900/50">
              {label}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">
              {staff ? T("portal_approvals") : T("portal_my_events")}
            </h2>
            <Link
              href={staff ? "/portal/approvals" : "/portal/events"}
              className="text-xs font-semibold text-brand-700 hover:text-brand-900"
            >
              {T("read_more")} →
            </Link>
          </div>

          {staff ? (
            queue.length === 0 ? (
              <Empty>{ar ? "لا توجد موافقات معلّقة." : "The approvals queue is clear."}</Empty>
            ) : (
              <ul className="space-y-0">
                {queue.slice(0, 6).map((a, i) => (
                  <li
                    key={a.id}
                    className={`flex items-start gap-3 py-3 ${i > 0 ? "border-t border-brand-900/8" : ""}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-brand-900">
                        {bi(locale, a.title)}
                      </div>
                      <div className="truncate text-xs text-brand-900/50">{a.detail}</div>
                    </div>
                    <span className="shrink-0 text-xs text-brand-900/40">
                      {formatDate(locale, a.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )
          ) : myRegs.length === 0 ? (
            <Empty>
              {ar ? "لم تسجّل في أي فعالية بعد." : "You have not registered for an event yet."}
            </Empty>
          ) : (
            <ul className="space-y-0">
              {myRegs.slice(0, 6).map((r, i) => {
                const ev = d.events.find((e) => e.id === r.eventId);
                return (
                  <li
                    key={r.id}
                    className={`flex items-center gap-3 py-3 ${i > 0 ? "border-t border-brand-900/8" : ""}`}
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={ev ? `/events/${ev.slug}` : "/events"}
                        className="block truncate text-sm font-medium text-brand-900 hover:text-brand-700"
                      >
                        {ev ? bi(locale, ev.title) : "—"}
                      </Link>
                      <div className="text-xs text-brand-900/50">
                        {ev ? formatDate(locale, ev.startsAt) : ""} · {r.seats}{" "}
                        {ar ? "مقعد" : r.seats === 1 ? "seat" : "seats"}
                      </div>
                    </div>
                    <StatusPill status={r.status} locale={locale} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">{T("nav_activity")}</h2>
            <Link href="/activity" className="text-xs font-semibold text-brand-700 hover:text-brand-900">
              {T("read_more")} →
            </Link>
          </div>
          <ActivityFeed
            entries={recentActivity(d, { visibility: staff ? "all" : "public", limit: 8 })}
            locale={locale}
            now={now}
            dense
          />
        </section>
      </div>

      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">{T("home_upcoming")}</h2>
          <Link href="/events" className="text-xs font-semibold text-brand-700 hover:text-brand-900">
            {T("nav_events")} →
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <Empty>{T("none_yet")}</Empty>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {upcoming.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/events/${e.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-brand-900/8 p-3 transition hover:border-brand-600 hover:bg-brand-50/60"
                >
                  <span
                    aria-hidden
                    className={`h-10 w-1.5 shrink-0 rounded-full bg-gradient-to-b ${e.coverTone}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-brand-900">
                      {bi(locale, e.title)}
                    </span>
                    <span className="block text-xs text-brand-900/50">
                      {formatDate(locale, e.startsAt)} · {e.city} ·{" "}
                      {seatsTaken(d, e.id)}/{e.capacity}
                    </span>
                  </span>
                  <StatusPill status={e.status} locale={locale} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
