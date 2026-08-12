import { atLeast, getLocale, pageRole } from "@/lib/auth";
import { bi, formatDate, tr } from "@/lib/i18n";
import { db, pendingApprovals } from "@/lib/queries";
import { ApprovalKind } from "@/lib/models";
import ApprovalActions from "@/components/ApprovalActions";
import { Empty, StatusPill } from "@/components/ui";

const KIND_LABEL: Record<ApprovalKind, [string, string]> = {
  organization_verification: ["Membership verification", "توثيق عضوية"],
  event_publication: ["Event publication", "نشر فعالية"],
  event_registration: ["Event registration", "تسجيل في فعالية"],
  opportunity_publication: ["Opportunity publication", "نشر فرصة"],
  membership_upgrade: ["Membership upgrade", "ترقية عضوية"],
};

/**
 * The approvals queue — the cooperative's system of record. Approving here is
 * what actually verifies a member, publishes an event or confirms a seat; the
 * side effects live in `applyDecision` in app/actions.ts.
 */
export default async function ApprovalsPage() {
  const user = await pageRole("admin");

  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const ar = locale === "ar";

  const queue = pendingApprovals(d);
  const decided = d.approvals
    .filter((a) => a.status !== "pending")
    .sort((a, b) => (b.decidedAt ?? 0) - (a.decidedAt ?? 0))
    .slice(0, 25);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{T("portal_approvals")}</h1>
        <p className="prose-body mt-1 text-sm">
          {ar
            ? "كل قرار في التعاونية يمر من هنا: توثيق الأعضاء، نشر الفعاليات والفرص، وتأكيد المقاعد. لا موافقات عبر البريد."
            : "Every decision in the cooperative passes through here: verifying members, publishing events and opportunities, confirming seats. No approvals by email."}
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-900/50">
          {ar ? `المعلّقة (${queue.length})` : `Pending (${queue.length})`}
        </h2>
        {queue.length === 0 ? (
          <Empty>{ar ? "لا توجد موافقات معلّقة." : "The queue is clear."}</Empty>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {queue.map((a) => (
              <li key={a.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
                      {ar ? KIND_LABEL[a.kind][1] : KIND_LABEL[a.kind][0]}
                    </span>
                    <h3 className="mt-1 text-sm font-semibold leading-snug text-brand-900">
                      {bi(locale, a.title)}
                    </h3>
                  </div>
                  <span className="shrink-0 text-xs text-brand-900/40">
                    {formatDate(locale, a.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-brand-900/60">{a.detail}</p>
                <p className="mt-1 text-xs text-brand-900/45">
                  {ar ? "مقدَّم من" : "Requested by"}{" "}
                  <span className="font-medium text-brand-900/70">{a.requestedByName}</span>
                </p>

                <ApprovalActions
                  approvalId={a.id}
                  labels={{
                    approve: T("approve"),
                    reject: T("reject"),
                    note: ar ? "ملاحظة القرار (اختياري)" : "Decision note (optional)",
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-900/50">
          {ar ? "قرارات سابقة" : "Decision history"}
        </h2>
        {decided.length === 0 ? (
          <Empty>{T("none_yet")}</Empty>
        ) : (
          <ul className="card divide-y divide-brand-900/8">
            {decided.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-brand-900">
                    {bi(locale, a.title)}
                  </div>
                  <div className="truncate text-xs text-brand-900/50">
                    {a.decidedByName ?? "—"} · {a.decidedAt ? formatDate(locale, a.decidedAt) : ""}
                    {a.decisionNote ? ` · ${a.decisionNote}` : ""}
                  </div>
                </div>
                <StatusPill status={a.status} locale={locale} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
