import type { Metadata } from "next";
import { currentUser, getLocale } from "@/lib/auth";
import { atLeast } from "@/lib/auth";
import { tr } from "@/lib/i18n";
import { db } from "@/lib/queries";
import { recentActivity } from "@/lib/activity";
import ActivityFeed from "@/components/ActivityFeed";
import { Banner } from "@/components/ui";

export const metadata: Metadata = { title: "Live Activity" };

/**
 * The public activity stream. Staff see internal entries too — the same
 * append-only log serves as the audit trail, so there is only one record.
 */
export default async function ActivityPage() {
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const user = await currentUser();
  const staff = atLeast(user, "admin");
  const now = Date.now();

  const entries = recentActivity(d, {
    visibility: staff ? "all" : "public",
    limit: 120,
  });

  return (
    <>
      <header className="border-b border-brand-900/10 bg-white">
        <div className="container-x py-12">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-600" aria-hidden />
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {T("activity_title")}
            </h1>
          </div>
          <p className="prose-body mt-3 max-w-2xl">{T("activity_sub")}</p>
        </div>
      </header>

      <div className="container-x max-w-4xl py-10">
        {staff && (
          <div className="mb-6">
            <Banner tone="info">
              {locale === "ar"
                ? "أنت تشاهد السجل الكامل بما في ذلك القيود الداخلية، لأنك من فريق الإدارة."
                : "You are seeing the complete log, including internal entries, because you are a member of staff."}
            </Banner>
          </div>
        )}
        <div className="card p-6">
          <ActivityFeed entries={entries} locale={locale} now={now} />
        </div>
      </div>
    </>
  );
}
