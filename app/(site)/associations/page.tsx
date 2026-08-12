import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/auth";
import { tr } from "@/lib/i18n";
import { db, mapsUrl } from "@/lib/queries";
import { Association } from "@/lib/models";
import { Empty, Pill } from "@/components/ui";

export const metadata: Metadata = { title: "Global Franchise Associations" };

function Row({ a, locale }: { a: Association; locale: "en" | "ar" }) {
  return (
    <li className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-brand-900">{a.name}</h3>
          <p className="mt-0.5 text-xs text-brand-900/50">{a.country}</p>
        </div>
        <Pill tone={a.scope === "Global" ? "gold" : a.scope === "Regional" ? "green" : "grey"}>
          {a.scope}
        </Pill>
      </div>

      {a.address && <p className="mt-3 text-sm leading-relaxed text-brand-900/70">{a.address}</p>}

      {a.officers && a.officers.length > 0 && (
        <div className="mt-3">
          <h4 className="label mb-1">{locale === "ar" ? "المسؤولون" : "Officers"}</h4>
          <ul className="space-y-0.5 text-xs text-brand-900/70">
            {a.officers.map((o, i) => (
              <li key={i}>
                <span className="font-medium text-brand-900">{o.name}</span> — {o.role}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3 border-t border-brand-900/8 pt-3 text-xs font-semibold">
        {a.website && (
          <a
            href={a.website}
            target="_blank"
            rel="noreferrer noopener"
            className="text-brand-700 hover:text-brand-900"
          >
            {locale === "ar" ? "زيارة الموقع" : "Website"} ↗
          </a>
        )}
        {a.address && (
          <a
            href={mapsUrl(`${a.name} ${a.address}`)}
            target="_blank"
            rel="noreferrer noopener"
            className="text-brand-700 hover:text-brand-900"
          >
            {locale === "ar" ? "فتح في الخرائط" : "Open in Maps"} ↗
          </a>
        )}
        {a.phone && <span className="text-brand-900/55">{a.phone}</span>}
      </div>
    </li>
  );
}

export default async function AssociationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();

  const needle = q.trim().toLowerCase();
  const match = (a: Association) =>
    !needle ||
    [a.name, a.country, a.address ?? "", ...(a.officers ?? []).map((o) => o.name)]
      .join(" ")
      .toLowerCase()
      .includes(needle);

  const global = d.associations.filter((a) => a.scope === "Global" && match(a));
  const regional = d.associations.filter((a) => a.scope === "Regional" && match(a));
  const national = d.associations
    .filter((a) => a.scope === "National" && match(a))
    .sort((a, b) => a.country.localeCompare(b.country));

  const total = global.length + regional.length + national.length;
  const source = d.associations[0]?.source;

  return (
    <>
      <header className="border-b border-brand-900/10 bg-white">
        <div className="container-x py-12">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{T("assoc_title")}</h1>
          <p className="prose-body mt-3 max-w-2xl">{T("assoc_sub")}</p>
          <form className="mt-6 flex max-w-md gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder={
                locale === "ar" ? "ابحث بالدولة أو الجمعية أو المسؤول…" : "Search by country, association or officer…"
              }
              className="field"
              aria-label={T("search")}
            />
            <button className="btn-primary btn-sm">{T("search")}</button>
          </form>
          <p className="mt-3 text-xs text-brand-900/45">
            {total} {locale === "ar" ? "جهة" : "entries"}
            {needle ? ` · "${q}"` : ""}
          </p>
        </div>
      </header>

      <div className="container-x space-y-10 py-10">
        {total === 0 && <Empty>{T("none_yet")}</Empty>}

        {global.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-900/50">
              {locale === "ar" ? "المظلة العالمية" : "Global umbrella"}
            </h2>
            <ul className="grid gap-4 md:grid-cols-2">
              {global.map((a) => (
                <Row key={a.id} a={a} locale={locale} />
              ))}
            </ul>
          </section>
        )}

        {regional.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-900/50">
              {locale === "ar" ? "الاتحادات الإقليمية" : "Regional federations"}
            </h2>
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {regional.map((a) => (
                <Row key={a.id} a={a} locale={locale} />
              ))}
            </ul>
          </section>
        )}

        {national.length > 0 && (
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-900/50">
              {locale === "ar" ? "الجمعيات الوطنية" : "National associations"} ({national.length})
            </h2>
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {national.map((a) => (
                <Row key={a.id} a={a} locale={locale} />
              ))}
            </ul>
          </section>
        )}

        {source && (
          <p className="border-t border-brand-900/8 pt-6 text-xs leading-relaxed text-brand-900/45">
            <strong className="font-semibold">{locale === "ar" ? "المصدر:" : "Source:"}</strong>{" "}
            {source}{" "}
            <Link href="/info-centre" className="font-semibold text-brand-700 hover:text-brand-900">
              {T("nav_info")} →
            </Link>
          </p>
        )}
      </div>
    </>
  );
}
