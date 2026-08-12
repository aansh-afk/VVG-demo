import Link from "next/link";
import { getLocale, pageUser } from "@/lib/auth";
import { formatDate, tr } from "@/lib/i18n";
import { db } from "@/lib/queries";
import OrgForm from "@/components/OrgForm";
import { Banner, StatusPill } from "@/components/ui";

export default async function OrganizationPage() {
  const user = await pageUser();
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const ar = locale === "ar";

  const org = d.organizations.find((o) => o.id === user.organizationId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{T("portal_org")}</h1>
          <p className="prose-body mt-1 text-sm">
            {ar
              ? "هذه البيانات هي ما يظهر في دليل الأعضاء العام بعد التوثيق."
              : "This is what appears in the public member directory once you are verified."}
          </p>
        </div>
        {org && (
          <div className="flex items-center gap-2">
            <StatusPill status={org.verification} locale={locale} />
            {org.verification === "verified" && (
              <Link href={`/members/${org.slug}`} className="btn-ghost btn-sm">
                {ar ? "عرض الصفحة العامة" : "View public page"} →
              </Link>
            )}
          </div>
        )}
      </div>

      {!org && (
        <Banner tone="info">
          {ar
            ? "حسابك حساب إداري وغير مرتبط بمنشأة عضو، لذا تظهر بياناتك الشخصية فقط."
            : "Yours is a staff account and is not linked to a member organisation, so only your personal details are shown."}
        </Banner>
      )}

      {org && org.verification === "pending" && (
        <Banner tone="warn">
          {ar
            ? `طلب التوثيق مُقدَّم بتاريخ ${formatDate(locale, org.createdAt)} وهو في قائمة موافقات المشرف العام.`
            : `Verification was requested on ${formatDate(locale, org.createdAt)} and is sitting in the super admin's approvals queue.`}
        </Banner>
      )}

      <div className="card p-6">
        <OrgForm
          locale={locale}
          user={{
            fullName: user.fullName,
            fullNameAr: user.fullNameAr,
            jobTitle: user.jobTitle,
            phone: user.phone,
          }}
          org={
            org
              ? {
                  name: org.name,
                  nameAr: org.nameAr,
                  sector: org.sector,
                  city: org.city,
                  country: org.country,
                  website: org.website,
                  aboutEn: org.about.en,
                  aboutAr: org.about.ar,
                  brands: org.brands,
                  outletCount: org.outletCount,
                }
              : undefined
          }
          labels={{
            fullName: T("auth_fullname"),
            jobTitle: T("auth_jobtitle"),
            phone: T("auth_phone"),
            orgName: T("auth_org"),
            orgNameAr: T("auth_org_ar"),
            sector: T("auth_sector"),
            city: T("auth_city"),
            country: T("auth_country"),
            save: T("save"),
          }}
        />
      </div>
    </div>
  );
}
