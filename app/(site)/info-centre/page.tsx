import type { Metadata } from "next";
import { getLocale } from "@/lib/auth";
import { bi, t, tr } from "@/lib/i18n";
import { db, mapsUrl } from "@/lib/queries";
import { InfoKind } from "@/lib/models";
import { Banner, Pill } from "@/components/ui";

export const metadata: Metadata = { title: "Information Centre" };

const ORDER: InfoKind[] = ["government", "chamber", "association_partner", "support"];
const HEADING = {
  government: "info_kind_government",
  chamber: "info_kind_chamber",
  association_partner: "info_kind_association_partner",
  support: "info_kind_support",
} as const;

/**
 * The information centre: who to contact, at which body, for what — with the
 * link and the named contact point on the card so nobody has to go hunting.
 */
export default async function InfoCentrePage() {
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();

  return (
    <>
      <header className="border-b border-brand-900/10 bg-white">
        <div className="container-x py-12">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{T("info_title")}</h1>
          <p className="prose-body mt-3 max-w-2xl">{T("info_sub")}</p>
        </div>
      </header>

      <div className="container-x space-y-10 py-10">
        <Banner tone="warn">{T("verify_before_publishing")}</Banner>

        {ORDER.map((kind) => {
          const entries = d.infoEntries.filter((e) => e.kind === kind);
          if (entries.length === 0) return null;
          return (
            <section key={kind}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-900/50">
                {t(locale, HEADING[kind])}
              </h2>
              <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {entries.map((e) => (
                  <li key={e.id} className="card flex flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold leading-snug text-brand-900">
                        {bi(locale, e.name)}
                      </h3>
                      {!e.verified && (
                        <Pill tone="amber">{locale === "ar" ? "للتحقق" : "verify"}</Pill>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-brand-900/50">
                      {e.city ? `${e.city}, ` : ""}
                      {e.country}
                    </p>
                    <p className="prose-body mt-3 flex-1 text-sm">{bi(locale, e.notes)}</p>

                    {(e.contactPerson || e.contactEmail) && (
                      <div className="mt-4 rounded-xl bg-brand-50 px-3 py-2.5">
                        <div className="label mb-0.5">{T("info_contact_person")}</div>
                        {e.contactPerson && (
                          <div className="text-xs font-medium text-brand-900">{e.contactPerson}</div>
                        )}
                        {e.contactEmail && (
                          <a
                            href={`mailto:${e.contactEmail}`}
                            className="break-all text-xs font-semibold text-brand-700 hover:text-brand-900"
                          >
                            {e.contactEmail}
                          </a>
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-3 border-t border-brand-900/8 pt-3 text-xs font-semibold">
                      {e.website && (
                        <a
                          href={e.website}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-brand-700 hover:text-brand-900"
                        >
                          {T("assoc_visit")} ↗
                        </a>
                      )}
                      <a
                        href={mapsUrl(`${e.name.en} ${e.city ?? ""} ${e.country}`)}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-brand-700 hover:text-brand-900"
                      >
                        {T("assoc_open_map")} ↗
                      </a>
                      {e.phone && <span className="text-brand-900/55">{e.phone}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
