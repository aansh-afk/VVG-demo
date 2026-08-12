import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLocale } from "@/lib/auth";
import { bi, tr } from "@/lib/i18n";
import { db } from "@/lib/queries";
import { Avatar, Banner, Crumb, Pill } from "@/components/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const d = await db();
  const m = d.board.find((b) => b.slug === slug);
  return { title: m ? `${m.name} — ${m.title.en}` : "Board member" };
}

export default async function BoardProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();

  const m = d.board.find((b) => b.slug === slug);
  if (!m) notFound();

  const peers = d.board
    .filter((b) => b.id !== m.id && b.tier === m.tier)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <div className="border-b border-brand-900/10 bg-white">
        <div className="container-x py-6">
          <Crumb href="/board">{T("board_title")}</Crumb>
        </div>
      </div>

      <div className="container-x grid gap-10 py-12 lg:grid-cols-[minmax(0,340px)_1fr]">
        {/* Portrait column */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="card overflow-hidden">
            <div className={`bg-gradient-to-br ${m.tone ?? "from-brand-700 to-brand-900"} p-8`}>
              <div className="mx-auto grid h-40 w-40 place-items-center rounded-3xl bg-white/15 text-5xl font-semibold text-white ring-1 ring-white/25 backdrop-blur">
                {m.initials}
              </div>
            </div>
            <div className="p-6 text-center">
              <h1 className="text-xl font-semibold text-brand-900">
                {locale === "ar" ? m.nameAr : m.name}
              </h1>
              <p className="mt-1 text-sm text-brand-900/60">{bi(locale, m.title)}</p>
              <p className="mt-1 text-xs text-brand-900/45">{m.country}</p>
            </div>

            <div className="border-t border-brand-900/8 p-6">
              <h2 className="label">{T("board_contact")}</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href={`mailto:${m.email}`}
                    className="break-all font-medium text-brand-700 hover:text-brand-900"
                  >
                    {m.email}
                  </a>
                </li>
                {m.phone && (
                  <li>
                    <a href={`tel:${m.phone.replace(/\s/g, "")}`} className="text-brand-900/70">
                      {m.phone}
                    </a>
                  </li>
                )}
                {m.linkedin && (
                  <li>
                    <a
                      href={m.linkedin}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-medium text-brand-700 hover:text-brand-900"
                    >
                      LinkedIn ↗
                    </a>
                  </li>
                )}
              </ul>
              <Link href="/portal/compose" className="btn-ghost btn-sm mt-4 w-full">
                {locale === "ar" ? "مراسلة عبر البوابة" : "Write via the portal"}
              </Link>
            </div>
          </div>
        </aside>

        {/* Profile column */}
        <article className="space-y-8">
          {m.isDemo && (
            <Banner tone="warn">
              {locale === "ar"
                ? "سجل تجريبي — هذا الملف يوضّح البنية الكاملة التي ستحمل بيانات عضو المجلس الحقيقية."
                : "Demonstration record — this profile shows the complete structure that will carry the real board member's data."}
            </Banner>
          )}

          <section className="card p-7">
            <h2 className="text-lg font-semibold">{T("board_biography")}</h2>
            <p className="prose-body mt-3">{bi(locale, m.bio)}</p>
          </section>

          <section className="card p-7">
            <h2 className="text-lg font-semibold">{T("board_mandate")}</h2>
            <p className="prose-body mt-3">{bi(locale, m.mandate)}</p>
          </section>

          <section className="card p-7">
            <h2 className="text-lg font-semibold">{T("board_committees")}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {m.committees.map((c, i) => (
                <Pill key={i} tone="green">
                  {bi(locale, c)}
                </Pill>
              ))}
            </div>
          </section>

          {peers.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-900/50">
                {locale === "ar" ? "زملاء في المستوى نفسه" : "Also at this level"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {peers.map((p) => (
                  <Link
                    key={p.id}
                    href={`/board/${p.slug}`}
                    className="card flex items-center gap-3 p-4 transition hover:shadow-lg"
                  >
                    <Avatar initials={p.initials} tone={p.tone} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-brand-900">
                        {locale === "ar" ? p.nameAr : p.name}
                      </span>
                      <span className="block truncate text-xs text-brand-900/50">
                        {bi(locale, p.title)}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </>
  );
}
