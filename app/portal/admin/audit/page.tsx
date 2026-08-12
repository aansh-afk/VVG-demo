import { atLeast, getLocale, pageRole } from "@/lib/auth";
import { tr } from "@/lib/i18n";
import { db } from "@/lib/queries";
import { recentActivity } from "@/lib/activity";
import ActivityFeed from "@/components/ActivityFeed";
import { Banner } from "@/components/ui";

/**
 * The audit trail. This is the same append-only log that feeds the public
 * activity stream — staff simply see the internal entries as well.
 */
export default async function AuditPage() {
  const user = await pageRole("admin");

  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const now = Date.now();
  const ar = locale === "ar";

  const entries = recentActivity(d, { visibility: "all", limit: 300 });
  const internal = entries.filter((e) => e.visibility === "internal").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{T("portal_admin_audit")}</h1>
        <p className="prose-body mt-1 text-sm">
          {ar
            ? "سجل لا يقبل التعديل يوثّق كل إجراء في المنصة، بمن قام به ومتى."
            : "An append-only record of every action in the platform, with who took it and when."}
        </p>
      </div>

      <Banner tone="info">
        {ar
          ? `${entries.length} قيد معروض، منها ${internal} قيداً داخلياً لا يظهر في البث العام.`
          : `${entries.length} entries shown, of which ${internal} are internal and never appear on the public stream.`}
      </Banner>

      <div className="card p-6">
        <ActivityFeed entries={entries} locale={locale} now={now} />
      </div>
    </div>
  );
}
