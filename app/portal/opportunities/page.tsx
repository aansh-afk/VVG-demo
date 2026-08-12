import Link from "next/link";
import { getLocale, pageUser } from "@/lib/auth";
import { bi, formatDate, formatMoney, tr } from "@/lib/i18n";
import { db } from "@/lib/queries";
import OpportunityForm from "@/components/OpportunityForm";
import { Empty, StatusPill } from "@/components/ui";

export default async function MyOpportunitiesPage() {
  const user = await pageUser();
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const ar = locale === "ar";

  const org = d.organizations.find((o) => o.id === user.organizationId);
  const mine = org ? d.opportunities.filter((o) => o.organizationId === org.id) : [];
  const enquiries = d.interests
    .filter((i) => mine.some((o) => o.id === i.opportunityId))
    .sort((a, b) => b.createdAt - a.createdAt);

  const blocked = !org || org.verification !== "verified";
  const blockedReason = !org
    ? ar
      ? "حسابك غير مرتبط بمنشأة عضو، لذا لا يمكن نشر الفرص من هذا الحساب."
      : "Your account is not linked to a member organisation, so opportunities cannot be published from it."
    : ar
      ? "يلزم توثيق منشأتك من المشرف العام قبل نشر فرص الامتياز."
      : "Your organisation must be verified by the super admin before you can publish franchise opportunities.";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{T("portal_my_opps")}</h1>
        <p className="prose-body mt-1 text-sm">
          {ar
            ? "انشر فرص الامتياز عبر الحدود، وتابع الاهتمامات الواردة من الأعضاء في الأسواق المستهدفة."
            : "Publish cross-border franchise opportunities and follow the enquiries they attract from members in the target markets."}
        </p>
      </div>

      <section className="card overflow-hidden">
        <h2 className="border-b border-brand-900/8 bg-brand-50/60 px-5 py-3 text-sm font-semibold">
          {ar ? "فرصي" : "My opportunities"}
        </h2>
        {mine.length === 0 ? (
          <div className="p-5">
            <Empty>{T("none_yet")}</Empty>
          </div>
        ) : (
          <ul className="divide-y divide-brand-900/8">
            {mine.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {o.status === "published" ? (
                      <Link
                        href={`/opportunities/${o.slug}`}
                        className="truncate text-sm font-medium text-brand-900 hover:text-brand-700"
                      >
                        {o.brandName}
                      </Link>
                    ) : (
                      <span className="truncate text-sm font-medium text-brand-900">
                        {o.brandName}
                      </span>
                    )}
                  </div>
                  <div className="truncate text-xs text-brand-900/50">
                    {o.model} · {o.targetCountries.join(", ")} ·{" "}
                    {formatMoney(locale, o.investmentFromSar)}–{formatMoney(locale, o.investmentToSar)}
                  </div>
                </div>
                <StatusPill status={o.status} locale={locale} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card overflow-hidden">
        <h2 className="border-b border-brand-900/8 bg-brand-50/60 px-5 py-3 text-sm font-semibold">
          {ar ? "اهتمامات واردة" : "Enquiries received"}
        </h2>
        {enquiries.length === 0 ? (
          <div className="p-5">
            <Empty>{ar ? "لا توجد اهتمامات بعد." : "No enquiries yet."}</Empty>
          </div>
        ) : (
          <ul className="divide-y divide-brand-900/8">
            {enquiries.map((i) => {
              const opp = mine.find((o) => o.id === i.opportunityId);
              const from = d.organizations.find((o) => o.id === i.organizationId);
              return (
                <li key={i.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-sm font-medium text-brand-900">
                      {from ? (ar ? from.nameAr : from.name) : ar ? "عضو" : "A member"}
                      <span className="ms-2 text-xs font-normal text-brand-900/50">
                        → {opp?.brandName}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 text-xs text-brand-900/45">
                      {formatDate(locale, i.createdAt)}
                      <StatusPill status={i.status} locale={locale} />
                    </span>
                  </div>
                  <p className="prose-body bidi-auto mt-2 text-sm">{i.message}</p>
                  {from && (
                    <div className="mt-2 flex gap-3 text-xs font-semibold">
                      <Link
                        href={`/members/${from.slug}`}
                        className="text-brand-700 hover:text-brand-900"
                      >
                        {ar ? "ملف العضو" : "Member profile"} →
                      </Link>
                      <Link href="/portal/compose" className="text-brand-700 hover:text-brand-900">
                        {ar ? "صياغة رد" : "Draft a reply"} →
                      </Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="card p-6">
        <h2 className="mb-4 text-base font-semibold">
          {ar ? "نشر فرصة جديدة" : "Publish a new opportunity"}
        </h2>
        <OpportunityForm locale={locale} disabled={blocked} disabledReason={blockedReason} />
      </section>
    </div>
  );
}
