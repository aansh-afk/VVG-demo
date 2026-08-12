import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/auth";
import { bi, tr } from "@/lib/i18n";
import { db } from "@/lib/queries";
import { Avatar, Banner, Pill } from "@/components/ui";
import { BoardMember, Locale } from "@/lib/models";

export const metadata: Metadata = { title: "Board of Directors" };

/**
 * The governance hierarchy: chairman at the top, executive officers beneath,
 * then the board itself. Every portrait is a link to the member's full public
 * profile — the photograph is the entry point, not the destination.
 */
function Card({
  member,
  locale,
  size,
}: {
  member: BoardMember;
  locale: Locale;
  size: "lg" | "md";
}) {
  return (
    <Link
      href={`/board/${member.slug}`}
      className="card group flex flex-col items-center p-6 text-center transition hover:-translate-y-1 hover:shadow-lg"
    >
      <Avatar initials={member.initials} tone={member.tone} size={size === "lg" ? "xl" : "lg"} />
      <h3
        className={`mt-4 font-semibold text-brand-900 group-hover:text-brand-700 ${
          size === "lg" ? "text-lg" : "text-sm"
        }`}
      >
        {locale === "ar" ? member.nameAr : member.name}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-brand-900/60">{bi(locale, member.title)}</p>
      <span className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-brand-700 opacity-0 transition group-hover:opacity-100">
        {locale === "ar" ? "عرض الملف ←" : "View profile →"}
      </span>
    </Link>
  );
}

export default async function BoardPage() {
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();

  const byTier = (n: number) =>
    d.board.filter((m) => m.tier === n).sort((a, b) => a.order - b.order);

  const chair = byTier(1);
  const officers = byTier(2);
  const members = byTier(3);

  return (
    <>
      <header className="border-b border-brand-900/10 bg-white">
        <div className="container-x py-12">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{T("board_title")}</h1>
          <p className="prose-body mt-3 max-w-2xl">{T("board_sub")}</p>
        </div>
      </header>

      <div className="container-x space-y-12 py-12">
        {d.board.some((m) => m.isDemo) && (
          <Banner tone="warn">
            {locale === "ar"
              ? "ملفات مجلس الإدارة المعروضة تجريبية بانتظار البيانات الرسمية للتعاونية (الأسماء والصور والسير الذاتية وبيانات التواصل). وهيكل الصفحة والملفات جاهز لاستقبالها."
              : "Board profiles shown here are demonstration records pending the cooperative's official data (names, photographs, biographies and contact details). The page and profile structure is ready to receive them."}
          </Banner>
        )}

        {/* Tier 1 — chairmanship */}
        <section>
          <h2 className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-brand-900/45">
            {T("board_tier1")}
          </h2>
          <div className="mx-auto grid max-w-sm gap-5">
            {chair.map((m) => (
              <Card key={m.id} member={m} locale={locale} size="lg" />
            ))}
          </div>
          {/* Connector line down the hierarchy, hidden on small screens. */}
          <div aria-hidden className="mx-auto mt-6 hidden h-8 w-px bg-brand-900/15 sm:block" />
        </section>

        {/* Tier 2 — executive officers */}
        <section>
          <h2 className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-brand-900/45">
            {T("board_tier2")}
          </h2>
          <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-3">
            {officers.map((m) => (
              <Card key={m.id} member={m} locale={locale} size="md" />
            ))}
          </div>
          <div aria-hidden className="mx-auto mt-6 hidden h-8 w-px bg-brand-900/15 sm:block" />
        </section>

        {/* Tier 3 — board members */}
        <section>
          <h2 className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-brand-900/45">
            {T("board_tier3")}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {members.map((m) => (
              <Card key={m.id} member={m} locale={locale} size="md" />
            ))}
          </div>
        </section>

        {/* Standing committees, derived from the profiles themselves */}
        <section className="card p-6">
          <h2 className="text-lg font-semibold">{T("board_tier4")}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from(
              new Set(
                d.board.flatMap((m) =>
                  m.committees.map((c) => (locale === "ar" ? c.ar : c.en).replace(/\s*\(.*\)$/, ""))
                )
              )
            ).map((c) => (
              <Pill key={c} tone="green">
                {c}
              </Pill>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
