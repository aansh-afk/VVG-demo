import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/auth";
import { bi, tr } from "@/lib/i18n";
import { db } from "@/lib/queries";
import { Avatar, Banner } from "@/components/ui";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const ar = locale === "ar";

  // The officers are the published points of contact for the cooperative.
  const officers = d.board.filter((m) => m.tier <= 2).sort((a, b) => a.tier - b.tier || a.order - b.order);

  return (
    <>
      <header className="border-b border-brand-900/10 bg-white">
        <div className="container-x py-12">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{T("nav_contact")}</h1>
          <p className="prose-body mt-3 max-w-2xl">
            {ar
              ? "تواصل مع المسؤول المختص مباشرةً، أو أنشئ حساباً لتصل رسالتك ومعاملتك عبر البوابة حيث تُسجَّل وتُتابَع."
              : "Reach the right officer directly, or open an account so your message and your request travel through the portal where they are recorded and tracked."}
          </p>
        </div>
      </header>

      <div className="container-x grid gap-8 py-10 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-900/50">
            {ar ? "جهات الاتصال" : "Points of contact"}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {officers.map((m) => (
              <li key={m.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <Avatar initials={m.initials} tone={m.tone} size="md" />
                  <div className="min-w-0">
                    <Link
                      href={`/board/${m.slug}`}
                      className="block truncate text-sm font-semibold text-brand-900 hover:text-brand-700"
                    >
                      {ar ? m.nameAr : m.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-brand-900/55">{bi(locale, m.title)}</p>
                    <a
                      href={`mailto:${m.email}`}
                      className="mt-2 block break-all text-xs font-semibold text-brand-700 hover:text-brand-900"
                    >
                      {m.email}
                    </a>
                    {m.phone && <p className="text-xs text-brand-900/50">{m.phone}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <Banner tone="info">
              {ar
                ? "الأسماء وبيانات التواصل المعروضة تجريبية بانتظار البيانات الرسمية للتعاونية."
                : "The names and contact details shown are demonstration records pending the cooperative's official data."}
            </Banner>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="card p-6">
            <h2 className="text-base font-semibold">{ar ? "الأمانة العامة" : "The secretariat"}</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="label">{ar ? "البريد العام" : "General enquiries"}</dt>
                <dd>
                  <a
                    href="mailto:info@wasl-global.org"
                    className="font-medium text-brand-700 hover:text-brand-900"
                  >
                    info@wasl-global.org
                  </a>
                </dd>
              </div>
              <div>
                <dt className="label">{ar ? "الفعاليات" : "Events"}</dt>
                <dd>
                  <a
                    href="mailto:events@wasl-global.org"
                    className="font-medium text-brand-700 hover:text-brand-900"
                  >
                    events@wasl-global.org
                  </a>
                </dd>
              </div>
              <div>
                <dt className="label">{ar ? "العضوية" : "Membership"}</dt>
                <dd>
                  <a
                    href="mailto:membership@wasl-global.org"
                    className="font-medium text-brand-700 hover:text-brand-900"
                  >
                    membership@wasl-global.org
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="text-base font-semibold">
              {ar ? "المسار المفضّل" : "The preferred route"}
            </h2>
            <p className="prose-body mt-2 text-sm">
              {ar
                ? "تُتابَع الرسائل المرسلة عبر البوابة وتُسجَّل ضمن سجل التعاونية. أما البريد الإلكتروني فيبقى قناة تعريفية فقط."
                : "Messages sent through the portal are tracked and recorded in the cooperative's log. Email remains an introduction channel only."}
            </p>
            <div className="mt-4 flex gap-2">
              <Link href="/sign-up" className="btn-primary btn-sm flex-1">
                {T("nav_signup")}
              </Link>
              <Link href="/sign-in" className="btn-ghost btn-sm flex-1">
                {T("nav_signin")}
              </Link>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-base font-semibold">{T("nav_info")}</h2>
            <p className="prose-body mt-2 text-sm">
              {ar
                ? "للجهات التنظيمية والغرف التجارية والجمعيات الشريكة، راجع مركز المعلومات."
                : "For regulators, chambers and partner associations, see the information centre."}
            </p>
            <Link href="/info-centre" className="btn-ghost btn-sm mt-4 w-full">
              {T("nav_info")} →
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}
