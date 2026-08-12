import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { currentUser, getLocale } from "@/lib/auth";
import { bi, formatDate, formatMoney, tr } from "@/lib/i18n";
import { db } from "@/lib/queries";
import { Avatar, Banner, Crumb, Pill } from "@/components/ui";
import InterestForm from "@/components/InterestForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = await db();
  const o = d.opportunities.find((x) => x.slug === slug);
  return { title: o ? `${o.brandName} — franchise opportunity` : "Opportunity" };
}

export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const user = await currentUser();

  const o = d.opportunities.find((x) => x.slug === slug && x.status === "published");
  if (!o) notFound();

  const org = d.organizations.find((x) => x.id === o.organizationId);
  const already = user ? d.interests.some((i) => i.opportunityId === o.id && i.userId === user.id) : false;

  return (
    <>
      <div className="border-b border-brand-900/10 bg-white">
        <div className="container-x py-6">
          <Crumb href="/opportunities">{T("opp_title")}</Crumb>
        </div>
      </div>

      <header className="bg-white">
        <div className="container-x flex flex-wrap items-start gap-6 pb-10">
          <Avatar initials={org?.logoInitials ?? "??"} size="lg" tone="from-brand-600 to-brand-800" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <Pill tone="gold">{o.model}</Pill>
              <Pill tone="grey">{o.sector}</Pill>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{o.brandName}</h1>
            {org && (
              <p className="mt-1 text-sm text-brand-900/55">
                {locale === "ar" ? "من" : "by"}{" "}
                <Link href={`/members/${org.slug}`} className="font-medium text-brand-700 hover:text-brand-900">
                  {locale === "ar" ? org.nameAr : org.name}
                </Link>{" "}
                · {o.homeCountry}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="container-x grid gap-8 py-12 lg:grid-cols-[1.6fr_1fr]">
        <article className="space-y-8">
          <section className="card p-7">
            <h2 className="text-lg font-semibold">{locale === "ar" ? "الفرصة" : "The opportunity"}</h2>
            <p className="prose-body bidi-auto mt-3">{bi(locale, o.summary)}</p>
          </section>

          <section className="card p-7">
            <h2 className="text-lg font-semibold">{T("opp_requirements")}</h2>
            <p className="prose-body bidi-auto mt-3">{bi(locale, o.requirements)}</p>
          </section>

          <section className="card p-7">
            <h2 className="text-lg font-semibold">{T("opp_support")}</h2>
            <p className="prose-body bidi-auto mt-3">{bi(locale, o.support)}</p>
          </section>
        </article>

        <aside className="space-y-6">
          <section className="card p-6">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="label">{T("opp_investment")}</dt>
                <dd className="font-semibold text-brand-900">
                  {formatMoney(locale, o.investmentFromSar)} – {formatMoney(locale, o.investmentToSar)}
                </dd>
              </div>
              {o.royaltyPct != null && (
                <div>
                  <dt className="label">{T("opp_royalty")}</dt>
                  <dd className="font-semibold text-brand-900">{o.royaltyPct}%</dd>
                </div>
              )}
              <div>
                <dt className="label">{T("opp_targets")}</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {o.targetCountries.map((c) => (
                    <Pill key={c} tone="green">
                      {c}
                    </Pill>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="label">{locale === "ar" ? "تاريخ النشر" : "Published"}</dt>
                <dd className="text-brand-900/70">
                  {formatDate(locale, o.decidedAt ?? o.createdAt)}
                </dd>
              </div>
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="text-base font-semibold">{T("opp_express")}</h2>
            {!user ? (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-brand-900/60">
                  {locale === "ar"
                    ? "سجّل الدخول للتواصل مع صاحب العلامة داخل المنصة."
                    : "Sign in to contact the brand inside the platform."}
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
            ) : already ? (
              <div className="mt-3">
                <Banner tone="success">
                  {locale === "ar"
                    ? "تم تسجيل اهتمامك — تابع الرد في بوابة الأعضاء."
                    : "Your interest is registered — follow the reply in the member portal."}
                </Banner>
                <Link href="/portal" className="btn-ghost btn-sm mt-3 w-full">
                  {T("nav_portal")} →
                </Link>
              </div>
            ) : (
              <div className="mt-4">
                <InterestForm
                  opportunityId={o.id}
                  locale={locale}
                  labels={{
                    submit: T("opp_express"),
                    message: locale === "ar" ? "رسالتك" : "Your message",
                    hint: T("opp_express_note"),
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
