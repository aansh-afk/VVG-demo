import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { currentUser, getLocale } from "@/lib/auth";
import { tr } from "@/lib/i18n";
import SignUpForm from "@/components/SignUpForm";

export const metadata: Metadata = { title: "Join the cooperative" };

export default async function SignUpPage() {
  if (await currentUser()) redirect("/portal");

  const locale = await getLocale();
  const T = tr(locale);

  return (
    <div className="container-x max-w-3xl py-14">
      <h1 className="text-2xl font-semibold tracking-tight">{T("auth_signup_title")}</h1>
      <p className="prose-body mt-2">{T("auth_pending_note")}</p>

      <div className="card mt-8 p-6 sm:p-8">
        <SignUpForm
          locale={locale}
          labels={{
            fullName: T("auth_fullname"),
            jobTitle: T("auth_jobtitle"),
            phone: T("auth_phone"),
            email: T("auth_email"),
            password: T("auth_password"),
            orgName: T("auth_org"),
            orgNameAr: T("auth_org_ar"),
            country: T("auth_country"),
            city: T("auth_city"),
            type: T("auth_type"),
            sector: T("auth_sector"),
            about: T("auth_about"),
            submit: T("nav_signup"),
            pendingNote: T("auth_pending_note"),
          }}
        />
      </div>

      <p className="mt-6 text-sm text-brand-900/60">
        {T("auth_have_account")}{" "}
        <Link href="/sign-in" className="font-semibold text-brand-700 hover:text-brand-900">
          {T("nav_signin")}
        </Link>
      </p>
    </div>
  );
}
