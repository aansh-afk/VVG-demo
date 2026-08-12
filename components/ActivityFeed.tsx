import Link from "next/link";
import { ActivityEntry, Locale } from "@/lib/models";
import { bi, timeAgo } from "@/lib/i18n";

const ICON: Record<string, string> = {
  event: "📅",
  registration: "🎟️",
  opportunity: "🌍",
  interest: "🤝",
  member: "🏢",
  membership: "📝",
  approval: "✅",
  board: "🏛️",
  supplier: "📦",
  assembly: "🗳️",
  user: "👤",
  system: "⚙️",
};

function iconFor(action: string): string {
  return ICON[action.split(".")[0]] ?? "•";
}

/**
 * The live activity feed. `now` is passed in from the page so the relative
 * timestamps are computed once on the server and match on the client.
 */
export default function ActivityFeed({
  entries,
  locale,
  now,
  dense = false,
}: {
  entries: ActivityEntry[];
  locale: Locale;
  now: number;
  dense?: boolean;
}) {
  if (entries.length === 0) {
    return (
      <p className="px-1 py-6 text-sm text-brand-900/50">
        {locale === "ar" ? "لا يوجد نشاط بعد." : "No activity recorded yet."}
      </p>
    );
  }

  return (
    <ol className="relative space-y-0">
      {entries.map((e, i) => {
        const body = (
          <>
            <span
              aria-hidden
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-sm ring-1 ring-brand-900/10"
            >
              {iconFor(e.action)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-brand-900/85">
                <span className="font-semibold text-brand-900">{e.actorName}</span>{" "}
                {bi(locale, e.detail)}
              </span>
              <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-wide text-brand-900/40">
                {timeAgo(locale, e.createdAt, now)}
                {e.visibility === "internal" && (
                  <span className="ms-2 text-amber-700">
                    {locale === "ar" ? "داخلي" : "internal"}
                  </span>
                )}
              </span>
            </span>
          </>
        );

        const cls = `flex items-start gap-3 border-brand-900/8 ${
          dense ? "py-2.5" : "py-3.5"
        } ${i > 0 ? "border-t" : ""}`;

        return (
          <li key={e.id}>
            {e.link ? (
              <Link href={e.link} className={`${cls} -mx-2 rounded-lg px-2 hover:bg-brand-50/70`}>
                {body}
              </Link>
            ) : (
              <div className={cls}>{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
