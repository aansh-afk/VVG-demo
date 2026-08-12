import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { currentUser, getLocale } from "@/lib/auth";
import { tr } from "@/lib/i18n";
import { db } from "@/lib/queries";
import SignInForm from "@/components/SignInForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage() {
  if (await currentUser()) redirect("/portal");

  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const ar = locale === "ar";

  // Demo credentials are surfaced on the page because this build seeds itself
  // and there is otherwise no way for a first-time visitor to get in.
  const superAdmin = d.users.find((u) => u.role === "super_admin");
  const admin = d.users.find((u) => u.role === "admin");
  const member = d.users.find((u) => u.role === "member");

  return (
    <div className="container-x grid gap-10 py-14 lg:grid-cols-2">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">{T("auth_signin_title")}</h1>
        <p className="prose-body mt-2 text-sm">
          {ar
            ? "بوابة الأعضاء: الفعاليات والموافقات والمراسلات وفرص الامتياز."
            : "The member portal: events, approvals, messaging and franchise opportunities."}
        </p>

        <div className="card mt-6 p-6">
          <SignInForm
            labels={{
              email: T("auth_email"),
              password: T("auth_password"),
              submit: T("nav_signin"),
            }}
          />
        </div>

        <p className="mt-5 text-sm text-brand-900/60">
          {T("auth_no_account")}{" "}
          <Link href="/sign-up" className="font-semibold text-brand-700 hover:text-brand-900">
            {T("nav_signup")}
          </Link>
        </p>
      </div>

      <aside className="mx-auto w-full max-w-md">
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-brand-900">
            {ar ? "حسابات العرض التوضيحي" : "Demonstration accounts"}
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-brand-900/55">
            {ar
              ? "هذه البوابة تُنشئ بياناتها تلقائياً عند أول تشغيل. استخدم الحسابات التالية لاستعراض كل مستوى صلاحية."
              : "This portal seeds itself on first boot. Use these accounts to walk through each level of authority."}
          </p>

          <dl className="mt-5 space-y-4">
            {[
              [ar ? "المشرف العام" : "Super admin", superAdmin?.email, process.env.SUPER_ADMIN_PASSWORD || "ChangeMe!2026", ar ? "كل الصلاحيات: التوثيق والموافقات والمستخدمون والنظام." : "Everything: verification, approvals, users, system."],
              [ar ? "مدير" : "Administrator", admin?.email, "Demo!2026", ar ? "إدارة الفعاليات والموافقات." : "Event management and the approvals queue."],
              [ar ? "عضو" : "Member", member?.email, "Demo!2026", ar ? "لوحة العضو: الفرص والتسجيلات والمراسلات." : "Member console: opportunities, registrations, messaging."],
            ].map(([role, email, password, note]) => (
              <div key={String(role)} className="rounded-xl bg-brand-50 p-3.5">
                <dt className="text-xs font-semibold uppercase tracking-wide text-brand-800">
                  {role}
                </dt>
                <dd className="mt-1.5 space-y-0.5 font-mono text-xs text-brand-900/75" dir="ltr">
                  <div className="break-all">{email}</div>
                  <div>{password}</div>
                </dd>
                <dd className="mt-1.5 text-xs text-brand-900/50">{note}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 border-t border-brand-900/8 pt-4 text-xs text-brand-900/45">
            {ar
              ? "قبل الإطلاق الفعلي: غيّر SUPER_ADMIN_PASSWORD وأزل هذه البطاقة."
              : "Before going live: change SUPER_ADMIN_PASSWORD and remove this panel."}
          </p>
        </div>
      </aside>
    </div>
  );
}
