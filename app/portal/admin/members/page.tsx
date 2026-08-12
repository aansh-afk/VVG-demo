import Link from "next/link";
import { atLeast, getLocale, pageRole } from "@/lib/auth";
import { bi, formatDate, tr } from "@/lib/i18n";
import { db } from "@/lib/queries";
import OrgVerificationControls from "@/components/OrgVerificationControls";
import { Avatar, Banner, Empty, StatusPill } from "@/components/ui";

export default async function AdminMembersPage() {
  const user = await pageRole("admin");

  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const ar = locale === "ar";
  const canDecide = atLeast(user, "super_admin");

  const groups: [string, string, typeof d.organizations][] = [
    [
      ar ? "بانتظار التوثيق" : "Awaiting verification",
      "pending",
      d.organizations.filter((o) => o.verification === "pending"),
    ],
    [
      ar ? "موثّقة" : "Verified",
      "verified",
      d.organizations.filter((o) => o.verification === "verified"),
    ],
    [
      ar ? "مرفوضة أو موقوفة" : "Rejected or suspended",
      "other",
      d.organizations.filter((o) => o.verification === "rejected" || o.verification === "suspended"),
    ],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{T("portal_admin_members")}</h1>
        <p className="prose-body mt-1 text-sm">
          {ar
            ? "سجل الأعضاء وحالة توثيق كل منشأة. التوثيق يفتح للعضو نشر الفرص والظهور في الدليل العام."
            : "The member register and each organisation's verification state. Verification is what unlocks publishing and public listing."}
        </p>
      </div>

      {!canDecide && (
        <Banner tone="info">
          {ar
            ? "التوثيق قرار للمشرف العام. يمكنك مراجعة السجل هنا، أو اعتماد الطلبات عبر قائمة الموافقات."
            : "Verification is a super admin decision. You can review the register here, or act on requests through the approvals queue."}
        </Banner>
      )}

      {groups.map(([title, key, list]) => (
        <section key={key} className="card overflow-hidden">
          <h2 className="border-b border-brand-900/8 bg-brand-50/60 px-5 py-3 text-sm font-semibold">
            {title} ({list.length})
          </h2>
          {list.length === 0 ? (
            <div className="p-5">
              <Empty>{T("none_yet")}</Empty>
            </div>
          ) : (
            <ul className="divide-y divide-brand-900/8">
              {list.map((o) => {
                const reps = d.users.filter((u) => u.organizationId === o.id);
                return (
                  <li key={o.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
                    <Avatar initials={o.logoInitials} size="sm" tone="from-brand-600 to-brand-800" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {o.verification === "verified" ? (
                          <Link
                            href={`/members/${o.slug}`}
                            className="truncate text-sm font-semibold text-brand-900 hover:text-brand-700"
                          >
                            {ar ? o.nameAr : o.name}
                          </Link>
                        ) : (
                          <span className="truncate text-sm font-semibold text-brand-900">
                            {ar ? o.nameAr : o.name}
                          </span>
                        )}
                        <StatusPill status={o.verification} locale={locale} />
                      </div>
                      <div className="mt-0.5 text-xs text-brand-900/50">
                        {o.type.replace("_", " ")} · {o.sector} · {o.city ? `${o.city}, ` : ""}
                        {o.country} · {ar ? "منذ" : "since"} {formatDate(locale, o.createdAt)}
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-xs text-brand-900/55">
                        {bi(locale, o.about)}
                      </p>
                      {reps.length > 0 && (
                        <div className="mt-1.5 text-xs text-brand-900/45" dir="ltr">
                          {reps.map((r) => r.email).join(" · ")}
                        </div>
                      )}
                      {canDecide && (
                        <div className="mt-2.5">
                          <OrgVerificationControls
                            orgId={o.id}
                            current={o.verification}
                            locale={locale}
                          />
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
