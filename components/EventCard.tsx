import Link from "next/link";
import { CoopEvent, Locale } from "@/lib/models";
import { bi, formatDate, formatMoney, t } from "@/lib/i18n";
import { StatusPill } from "./ui";

const FORMAT_KEY = {
  in_person: "events_format_in_person",
  virtual: "events_format_virtual",
  hybrid: "events_format_hybrid",
} as const;

export default function EventCard({
  event,
  locale,
  seatsTaken,
}: {
  event: CoopEvent;
  locale: Locale;
  seatsTaken: number;
}) {
  const remaining = Math.max(0, event.capacity - seatsTaken);
  const full = Math.round((seatsTaken / Math.max(1, event.capacity)) * 100);

  return (
    <Link
      href={`/events/${event.slug}`}
      className="card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className={`relative h-32 bg-gradient-to-br ${event.coverTone}`}>
        <div className="absolute inset-0 flex items-start justify-between p-4">
          <span className="rounded-lg bg-black/25 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
            {event.category}
          </span>
          <StatusPill status={event.status} locale={locale} />
        </div>
        <div className="absolute bottom-3 start-4 text-white">
          <div className="text-xs font-medium opacity-85">
            {t(locale, FORMAT_KEY[event.format])} · {event.city}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {formatDate(locale, event.startsAt, true)}
        </div>
        <h3 className="mt-1.5 text-base font-semibold leading-snug text-brand-900 group-hover:text-brand-700">
          {bi(locale, event.title)}
        </h3>
        <p className="prose-body mt-2 line-clamp-3 flex-1 text-sm">{bi(locale, event.summary)}</p>

        <div className="mt-4 space-y-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-900/8">
            <div
              className="h-full rounded-full bg-brand-600"
              style={{ width: `${Math.min(100, full)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-brand-900/55">
            <span>
              {remaining} {t(locale, "events_seats_left")}
            </span>
            <span className="font-semibold text-brand-800">
              {event.feeSar === 0 ? t(locale, "events_free") : formatMoney(locale, event.feeSar)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
