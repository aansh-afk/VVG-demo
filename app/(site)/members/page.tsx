import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/auth";
import { bi, tr } from "@/lib/i18n";
import { db, verifiedOrgs } from "@/lib/queries";
import { Avatar, Empty, Pill } from "@/components/ui";
import { MemberType } from "@/lib/models";

export const metadata: Metadata = { title: "Member Directory" };

const TYPE_LABEL: Record<MemberType, [string, string]> = {
  franchisor: ["Franchisor", "مانح امتياز"],
  franchisee: ["Franchisee / Investor", "ممنوح امتياز / مستثمر"],
  supplier: ["Supplier", "مورّد"],
  service_partner: ["Service partner", "شريك خدمات"],
  chamber_partner: ["Institutional partner", "شريك مؤسسي"],
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const { type = "all", q = "" } = await searchParams;
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();

  const all = verifiedOrgs(d);
  const needle = q.trim().toLowerCase();
  const list = all.filter((o) => {
    if (type !== "all" && o.type !== type) return false;
    if (!needle) return true;
    return [o.name, o.nameAr, o.country, o.city ?? "", o.sector, ...o.brands]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  const types: [string, string][] = [
    ["all", locale === "ar" ? "الكل" : "All"],
    ...(Object.entries(TYPE_LABEL) as [MemberType, [string, string]][]).map(
      ([k, v]) => [k, locale === "ar" ? v[1] : v[0]] as [string, string]
    ),
  ];

  return (
    <>
      <header className="border-b border-brand-900/10 bg-white">
        <div className="container-x py-12">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{T("members_title")}</h1>
          <p className="prose-body mt-3 max-w-2xl">{T("members_sub")}</p>
        </div>
      </header>

      <div className="container-x py-10">
        {/* Filters are plain links and a GET form, so the list stays shareable. */}
        <form className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {types.map(([k, label]) => (
              <Link
                key={k}
                href={`/members?type=${k}${needle ? `&q=${encodeURIComponent(q)}` : ""}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  type === k
                    ? "bg-brand-700 text-white"
                    : "border border-brand-900/12 bg-white text-brand-800 hover:border-brand-600"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="ms-auto flex items-center gap-2">
            <input type="hidden" name="type" value={type} />
            <input
              name="q"
              defaultValue={q}
              placeholder={T("search")}
              className="field w-48 py-2"
              aria-label={T("search")}
            />
            <button className="btn-ghost btn-sm">{T("search")}</button>
          </div>
        </form>

        {list.length === 0 ? (
          <Empty>{T("none_yet")}</Empty>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {list.map((o) => (
              <Link
                key={o.id}
                href={`/members/${o.slug}`}
                className="card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <Avatar initials={o.logoInitials} size="md" tone="from-brand-600 to-brand-800" />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-sm font-semibold text-brand-900 group-hover:text-brand-700">
                      {locale === "ar" ? o.nameAr : o.name}
                    </h2>
                    <p className="truncate text-xs text-brand-900/50">
                      {o.city ? `${o.city}, ` : ""}
                      {o.country}
                    </p>
                    <div className="mt-2">
                      <Pill tone="green">
                        {locale === "ar" ? TYPE_LABEL[o.type][1] : TYPE_LABEL[o.type][0]}
                      </Pill>
                    </div>
                  </div>
                </div>
                <p className="prose-body mt-3 line-clamp-3 flex-1 text-sm">{bi(locale, o.about)}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-brand-900/8 pt-3 text-xs">
                  <div>
                    <dt className="text-brand-900/45">{T("member_sector")}</dt>
                    <dd className="mt-0.5 font-medium text-brand-800">{o.sector}</dd>
                  </div>
                  {o.outletCount != null && (
                    <div>
                      <dt className="text-brand-900/45">{T("member_outlets")}</dt>
                      <dd className="mt-0.5 font-medium text-brand-800">{o.outletCount}</dd>
                    </div>
                  )}
                </dl>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
