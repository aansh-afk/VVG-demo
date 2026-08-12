import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/auth";
import { bi, formatMoney, tr } from "@/lib/i18n";
import { db, publishedOpportunities } from "@/lib/queries";
import { Avatar, Empty, Pill } from "@/components/ui";

export const metadata: Metadata = { title: "Franchise Opportunities" };

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ market?: string; q?: string }>;
}) {
  const { market = "all", q = "" } = await searchParams;
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();

  const all = publishedOpportunities(d);
  const markets = Array.from(new Set(all.flatMap((o) => o.targetCountries))).sort();
  const needle = q.trim().toLowerCase();

  const list = all.filter((o) => {
    if (market !== "all" && !o.targetCountries.includes(market)) return false;
    if (!needle) return true;
    return [o.brandName, o.sector, o.model, o.homeCountry, ...o.targetCountries]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  return (
    <>
      <header className="border-b border-brand-900/10 bg-white">
        <div className="container-x py-12">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{T("opp_title")}</h1>
          <p className="prose-body mt-3 max-w-2xl">{T("opp_sub")}</p>
        </div>
      </header>

      <div className="container-x py-10">
        <form className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            <Link
              href="/opportunities"
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                market === "all"
                  ? "bg-brand-700 text-white"
                  : "border border-brand-900/12 bg-white text-brand-800 hover:border-brand-600"
              }`}
            >
              {T("filter_all")}
            </Link>
            {markets.map((m) => (
              <Link
                key={m}
                href={`/opportunities?market=${encodeURIComponent(m)}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  market === m
                    ? "bg-brand-700 text-white"
                    : "border border-brand-900/12 bg-white text-brand-800 hover:border-brand-600"
                }`}
              >
                {m}
              </Link>
            ))}
          </div>
          <div className="ms-auto flex items-center gap-2">
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
            {list.map((o) => {
              const org = d.organizations.find((x) => x.id === o.organizationId);
              return (
                <Link
                  key={o.id}
                  href={`/opportunities/${o.slug}`}
                  className="card group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      initials={org?.logoInitials ?? "??"}
                      size="md"
                      tone="from-brand-600 to-brand-800"
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-sm font-semibold text-brand-900 group-hover:text-brand-700">
                        {o.brandName}
                      </h2>
                      <p className="truncate text-xs text-brand-900/50">
                        {org ? (locale === "ar" ? org.nameAr : org.name) : ""}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Pill tone="gold">{o.model}</Pill>
                        <Pill tone="grey">{o.sector}</Pill>
                      </div>
                    </div>
                  </div>

                  <p className="prose-body mt-3 line-clamp-3 flex-1 text-sm">{bi(locale, o.summary)}</p>

                  <dl className="mt-4 space-y-1.5 border-t border-brand-900/8 pt-3 text-xs">
                    <div className="flex justify-between gap-3">
                      <dt className="text-brand-900/50">{T("opp_targets")}</dt>
                      <dd className="truncate text-end font-medium text-brand-800">
                        {o.targetCountries.join(", ")}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-brand-900/50">{T("opp_investment")}</dt>
                      <dd className="font-medium text-brand-800">
                        {formatMoney(locale, o.investmentFromSar)} –{" "}
                        {formatMoney(locale, o.investmentToSar)}
                      </dd>
                    </div>
                    {o.royaltyPct != null && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-brand-900/50">{T("opp_royalty")}</dt>
                        <dd className="font-medium text-brand-800">{o.royaltyPct}%</dd>
                      </div>
                    )}
                  </dl>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
