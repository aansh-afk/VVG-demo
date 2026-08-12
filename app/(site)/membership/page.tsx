import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/auth";
import { bi, tr } from "@/lib/i18n";
import { db } from "@/lib/queries";
import { Banner } from "@/components/ui";

export const metadata: Metadata = { title: "Membership" };

export default async function MembershipPage() {
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const plans = [...d.plans].sort((a, b) => a.priceYearlySar - b.priceYearlySar);

  return (
    <>
      <header className="border-b border-brand-900/10 bg-white">
        <div className="container-x py-12">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{T("plans_title")}</h1>
          <p className="prose-body mt-3 max-w-2xl">{T("plans_sub")}</p>
        </div>
      </header>

      <div className="container-x py-10">
        {plans.some((p) => p.isAssumption) && (
          <div className="mb-8">
            <Banner tone="warn">{T("plans_assumption")}</Banner>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`card flex flex-col p-6 ${
                p.highlight ? "ring-2 ring-gold-400" : ""
              }`}
            >
              {p.highlight && (
                <span className="mb-3 inline-flex w-fit rounded-full bg-gold-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-900">
                  {locale === "ar" ? "الأكثر طلباً" : "Most common"}
                </span>
              )}
              <h2 className="text-base font-semibold text-brand-900">{bi(locale, p.name)}</h2>
              <p className="mt-1 text-xs leading-relaxed text-brand-900/50">
                {bi(locale, p.audience)}
              </p>

              <div className="mt-5">
                <span className="text-3xl font-semibold tracking-tight text-brand-800">
                  {p.priceYearlySar === 0
                    ? locale === "ar"
                      ? "مجاناً"
                      : "Free"
                    : p.priceYearlySar.toLocaleString("en-US")}
                </span>
                {p.priceYearlySar > 0 && (
                  <span className="ms-1.5 text-xs text-brand-900/50">{T("plans_per_year")}</span>
                )}
              </div>

              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map((f, i) => (
                  <li key={i} className="flex gap-2 text-sm text-brand-900/75">
                    <span aria-hidden className="mt-0.5 text-brand-600">
                      ✓
                    </span>
                    <span>{bi(locale, f)}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sign-up"
                className={`mt-6 w-full ${p.highlight ? "btn-gold" : "btn-ghost"}`}
              >
                {T("home_cta_join")}
              </Link>
            </div>
          ))}
        </div>

        <section className="card mt-10 p-7">
          <h2 className="text-lg font-semibold">
            {locale === "ar" ? "كيف تتم العضوية" : "How membership works"}
          </h2>
          <ol className="mt-4 grid gap-5 sm:grid-cols-3">
            {[
              [
                locale === "ar" ? "١. التقديم" : "1. Apply",
                locale === "ar"
                  ? "أنشئ حساباً وسجّل بيانات منشأتك. يمكنك الدخول فوراً."
                  : "Create an account and register your organisation. You can sign in immediately.",
              ],
              [
                locale === "ar" ? "٢. التوثيق" : "2. Verification",
                locale === "ar"
                  ? "يراجع المشرف العام الطلب داخل البوابة — لا موافقات عبر البريد."
                  : "The super admin reviews the application inside the portal — no email approvals.",
              ],
              [
                locale === "ar" ? "٣. التفعيل" : "3. Activation",
                locale === "ar"
                  ? "بعد التوثيق يمكنك النشر والتسجيل في الفعاليات والمراسلة داخل المنصة."
                  : "Once verified you can publish, register for events and message inside the platform.",
              ],
            ].map(([title, body]) => (
              <li key={title}>
                <h3 className="text-sm font-semibold text-brand-900">{title}</h3>
                <p className="prose-body mt-1.5 text-sm">{body}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
