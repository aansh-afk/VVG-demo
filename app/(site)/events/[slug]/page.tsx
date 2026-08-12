import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { currentUser, getLocale } from "@/lib/auth";
import { bi, formatDate, formatMoney, t, tr } from "@/lib/i18n";
import { db, mapsUrl, seatsTaken } from "@/lib/queries";
import { Banner, Crumb, StatusPill } from "@/components/ui";
import RegisterForm from "@/components/RegisterForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = await db();
  const ev = d.events.find((e) => e.slug === slug);
  return { title: ev ? ev.title.en : "Event" };
}

const FORMAT_KEY = {
  in_person: "events_format_in_person",
  virtual: "events_format_virtual",
  hybrid: "events_format_hybrid",
} as const;

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const user = await currentUser();

  const ev = d.events.find((e) => e.slug === slug);
  if (!ev) notFound();

  const taken = seatsTaken(d, ev.id);
  const remaining = Math.max(0, ev.capacity - taken);
  const myReg = user
    ? d.registrations.find((r) => r.eventId === ev.id && r.userId === user.id && r.status !== "declined")
    : undefined;
  const organiser = ev.organiserOrgId
    ? d.organizations.find((o) => o.id === ev.organiserOrgId)
    : undefined;
  const isPast = ev.endsAt < Date.now() || ev.status === "completed";

  return (
    <>
      <div className={`bg-gradient-to-br ${ev.coverTone}`}>
        <div className="container-x py-14 text-white">
          <div className="[&_a]:text-white/80 [&_a:hover]:text-white">
            <Crumb href="/events">{T("nav_events")}</Crumb>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-black/25 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur">
              {ev.category}
            </span>
            <StatusPill status={ev.status} locale={locale} />
          </div>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            {bi(locale, ev.title)}
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">{bi(locale, ev.summary)}</p>
        </div>
      </div>

      <div className="container-x grid gap-8 py-12 lg:grid-cols-[1.6fr_1fr]">
        <article className="space-y-8">
          <section className="card p-6">
            <h2 className="text-lg font-semibold">
              {locale === "ar" ? "عن الفعالية" : "About this event"}
            </h2>
            <p className="prose-body bidi-auto mt-3 whitespace-pre-line">{bi(locale, ev.description)}</p>
          </section>

          {ev.agenda.length > 0 && (
            <section className="card p-6">
              <h2 className="text-lg font-semibold">{T("events_agenda")}</h2>
              <ol className="mt-4 space-y-0">
                {ev.agenda.map((a, i) => (
                  <li
                    key={i}
                    className={`flex gap-4 py-3 ${i > 0 ? "border-t border-brand-900/8" : ""}`}
                  >
                    <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-brand-700">
                      {a.time}
                    </span>
                    <span className="text-sm text-brand-900/80">{bi(locale, a.item)}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </article>

        <aside className="space-y-6">
          <section className="card p-6">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="label">{locale === "ar" ? "التاريخ" : "Date"}</dt>
                <dd className="font-medium text-brand-900">
                  {formatDate(locale, ev.startsAt, true)}
                </dd>
                <dd className="text-xs text-brand-900/50">
                  {locale === "ar" ? "حتى" : "until"} {formatDate(locale, ev.endsAt, true)} UTC
                </dd>
              </div>
              <div>
                <dt className="label">{T("events_venue")}</dt>
                <dd className="font-medium text-brand-900">{bi(locale, ev.venue)}</dd>
                <dd className="text-xs text-brand-900/50">
                  {ev.city}
                  {ev.country && ev.country !== "—" ? `, ${ev.country}` : ""} ·{" "}
                  {t(locale, FORMAT_KEY[ev.format])}
                </dd>
                {ev.mapQuery && (
                  <dd className="mt-1">
                    <a
                      href={mapsUrl(ev.mapQuery)}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs font-semibold text-brand-700 hover:text-brand-900"
                    >
                      {T("assoc_open_map")} ↗
                    </a>
                  </dd>
                )}
              </div>
              <div>
                <dt className="label">{T("events_seats")}</dt>
                <dd className="font-medium text-brand-900">
                  {taken} / {ev.capacity}
                </dd>
                <dd className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-brand-900/8">
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{ width: `${Math.min(100, Math.round((taken / Math.max(1, ev.capacity)) * 100))}%` }}
                  />
                </dd>
              </div>
              <div>
                <dt className="label">{locale === "ar" ? "الرسوم" : "Fee"}</dt>
                <dd className="font-medium text-brand-900">
                  {ev.feeSar === 0 ? T("events_free") : formatMoney(locale, ev.feeSar)}
                </dd>
              </div>
              {organiser && (
                <div>
                  <dt className="label">{locale === "ar" ? "المنظّم" : "Organiser"}</dt>
                  <dd>
                    <Link
                      href={`/members/${organiser.slug}`}
                      className="font-medium text-brand-700 hover:text-brand-900"
                    >
                      {locale === "ar" ? organiser.nameAr : organiser.name}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="text-base font-semibold">{T("events_register")}</h2>
            {isPast ? (
              <p className="mt-3 text-sm text-brand-900/55">
                {locale === "ar" ? "انتهت هذه الفعالية." : "This event has finished."}
              </p>
            ) : myReg ? (
              <div className="mt-3 space-y-2">
                <Banner tone="success">
                  {T("events_registered")} — {myReg.seats}{" "}
                  {locale === "ar" ? "مقعد" : myReg.seats === 1 ? "seat" : "seats"}
                </Banner>
                <div className="flex items-center gap-2 text-xs text-brand-900/55">
                  <StatusPill status={myReg.status} locale={locale} />
                  <Link href="/portal" className="font-semibold text-brand-700 hover:text-brand-900">
                    {T("nav_portal")} →
                  </Link>
                </div>
              </div>
            ) : !user ? (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-brand-900/60">
                  {locale === "ar"
                    ? "سجّل الدخول للتسجيل في فعاليات التعاونية."
                    : "Sign in to register for cooperative events."}
                </p>
                <div className="flex gap-2">
                  <Link href="/sign-in" className="btn-primary btn-sm flex-1">
                    {T("nav_signin")}
                  </Link>
                  <Link href="/sign-up" className="btn-ghost btn-sm flex-1">
                    {T("nav_signup")}
                  </Link>
                </div>
              </div>
            ) : remaining === 0 ? (
              <div className="mt-3">
                <Banner tone="warn">
                  {locale === "ar"
                    ? "اكتمل العدد — سيُدرج تسجيلك في قائمة الانتظار."
                    : "At capacity — new registrations join the waiting list."}
                </Banner>
                <div className="mt-4">
                  <RegisterForm
                    eventId={ev.id}
                    locale={locale}
                    labels={{
                      register: T("events_register"),
                      seats: T("events_seats"),
                      note: locale === "ar" ? "ملاحظة للمنظّم" : "Note to the organiser",
                      hint: T("events_register_note"),
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <RegisterForm
                  eventId={ev.id}
                  locale={locale}
                  labels={{
                    register: T("events_register"),
                    seats: T("events_seats"),
                    note: locale === "ar" ? "ملاحظة للمنظّم" : "Note to the organiser",
                    hint: T("events_register_note"),
                  }}
                />
              </div>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
