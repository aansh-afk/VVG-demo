import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLocale } from "@/lib/auth";
import { bi, formatDate, formatMoney, tr } from "@/lib/i18n";
import { db, mapsUrl } from "@/lib/queries";
import { Avatar, Crumb, Pill, StatusPill } from "@/components/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = await db();
  const org = d.organizations.find((o) => o.slug === slug);
  return { title: org ? org.name : "Member" };
}

export default async function MemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();

  const org = d.organizations.find((o) => o.slug === slug);
  if (!org || org.verification !== "verified") notFound();

  const opps = d.opportunities.filter(
    (o) => o.organizationId === org.id && o.status === "published"
  );
  const contacts = d.users.filter((u) => u.organizationId === org.id && u.active);
  const plan = d.plans.find((p) => p.key === org.membershipPlan);

  return (
    <>
      <div className="border-b border-brand-900/10 bg-white">
        <div className="container-x py-6">
          <Crumb href="/members">{T("members_title")}</Crumb>
        </div>
      </div>

      <header className="bg-white">
        <div className="container-x flex flex-wrap items-start gap-6 pb-10">
          <Avatar initials={org.logoInitials} size="lg" tone="from-brand-600 to-brand-800" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={org.verification} locale={locale} />
              {plan && <Pill tone="gold">{bi(locale, plan.name)}</Pill>}
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {locale === "ar" ? org.nameAr : org.name}
            </h1>
            <p className="mt-1 text-sm text-brand-900/55">
              {org.sector} · {org.city ? `${org.city}, ` : ""}
              {org.country}
              {org.foundedYear ? ` · ${locale === "ar" ? "تأسست" : "founded"} ${org.foundedYear}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            {org.website && (
              <a
                href={org.website}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-ghost btn-sm"
              >
                {T("assoc_visit")} ↗
              </a>
            )}
            <a
              href={mapsUrl(`${org.name} ${org.city ?? ""} ${org.country}`)}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-ghost btn-sm"
            >
              {T("assoc_open_map")} ↗
            </a>
          </div>
        </div>
      </header>

      <div className="container-x grid gap-8 py-12 lg:grid-cols-[1.6fr_1fr]">
        <article className="space-y-8">
          <section className="card p-7">
            <h2 className="text-lg font-semibold">{locale === "ar" ? "نبذة" : "Overview"}</h2>
            <p className="prose-body bidi-auto mt-3">{bi(locale, org.about)}</p>
            {org.brands.length > 0 && (
              <div className="mt-5">
                <h3 className="label">{T("member_brands")}</h3>
                <div className="flex flex-wrap gap-2">
                  {org.brands.map((b) => (
                    <Pill key={b} tone="green">
                      {b}
                    </Pill>
                  ))}
                </div>
              </div>
            )}
          </section>

          {opps.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold">{T("opp_title")}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {opps.map((o) => (
                  <Link
                    key={o.id}
                    href={`/opportunities/${o.slug}`}
                    className="card p-5 transition hover:shadow-lg"
                  >
                    <div className="text-sm font-semibold text-brand-900">{o.brandName}</div>
                    <div className="mt-1 text-xs text-brand-900/50">
                      {o.model} · {o.targetCountries.join(", ")}
                    </div>
                    <p className="prose-body mt-2 line-clamp-2 text-sm">{bi(locale, o.summary)}</p>
                    <div className="mt-3 text-xs font-semibold text-brand-700">
                      {formatMoney(locale, o.investmentFromSar)}+
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="space-y-6">
          <section className="card p-6">
            <h2 className="label">{locale === "ar" ? "التواصل" : "Contact"}</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={`mailto:${org.contactEmail}`}
                  className="break-all font-medium text-brand-700 hover:text-brand-900"
                >
                  {org.contactEmail}
                </a>
              </li>
              {org.contactPhone && <li className="text-brand-900/70">{org.contactPhone}</li>}
              <li className="text-xs text-brand-900/45">
                {T("member_since")} {formatDate(locale, org.createdAt)}
              </li>
            </ul>
            <Link href="/portal/messages" className="btn-primary btn-sm mt-4 w-full">
              {locale === "ar" ? "مراسلة داخل المنصة" : "Message inside the platform"}
            </Link>
          </section>

          {contacts.length > 0 && (
            <section className="card p-6">
              <h2 className="label">{locale === "ar" ? "المسؤولون" : "Representatives"}</h2>
              <ul className="space-y-3">
                {contacts.map((c) => (
                  <li key={c.id} className="flex items-center gap-3">
                    <Avatar
                      initials={c.fullName.split(/\s+/).slice(0, 2).map((w) => w[0]).join("")}
                      size="sm"
                      tone="from-gold-500 to-brand-700"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-brand-900">
                        {locale === "ar" && c.fullNameAr ? c.fullNameAr : c.fullName}
                      </span>
                      <span className="block truncate text-xs text-brand-900/50">
                        {c.jobTitle ?? ""}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
