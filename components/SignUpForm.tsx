"use client";

import { useActionState } from "react";
import { signUp, type ActionState } from "@/app/actions";
import SubmitButton from "./SubmitButton";
import VoiceField from "./VoiceField";
import { Banner } from "./ui";

const TYPES: [string, string, string][] = [
  ["franchisor", "Franchisor — I offer franchises", "مانح امتياز — أمنح الامتياز"],
  ["franchisee", "Franchisee / investor — I am looking for a brand", "ممنوح امتياز / مستثمر — أبحث عن علامة"],
  ["supplier", "Supplier — equipment, fit-out, logistics", "مورّد — معدات وتجهيزات وخدمات لوجستية"],
  ["service_partner", "Service partner — advisory, legal, marketing", "شريك خدمات — استشارات وقانون وتسويق"],
  ["chamber_partner", "Institutional partner — chamber or authority", "شريك مؤسسي — غرفة تجارية أو جهة"],
];

export default function SignUpForm({
  locale,
  labels,
}: {
  locale: "en" | "ar";
  labels: Record<string, string>;
}) {
  const [state, action] = useActionState<ActionState, FormData>(signUp, null);
  const ar = locale === "ar";

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold text-brand-900">
          {ar ? "بياناتك" : "About you"}
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="fullName">
              {labels.fullName} <span className="text-red-600">*</span>
            </label>
            <input id="fullName" name="fullName" required className="field" />
          </div>
          <div>
            <label className="label" htmlFor="fullNameAr">
              {ar ? "الاسم بالعربية" : "Name in Arabic"}
            </label>
            <input id="fullNameAr" name="fullNameAr" className="field" />
          </div>
          <div>
            <label className="label" htmlFor="jobTitle">
              {labels.jobTitle}
            </label>
            <input id="jobTitle" name="jobTitle" className="field" />
          </div>
          <div>
            <label className="label" htmlFor="phone">
              {labels.phone}
            </label>
            <input id="phone" name="phone" className="field" dir="ltr" />
          </div>
          <div>
            <label className="label" htmlFor="email">
              {labels.email} <span className="text-red-600">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="field"
              dir="ltr"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              {labels.password} <span className="text-red-600">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="field"
              dir="ltr"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold text-brand-900">
          {ar ? "بيانات المنشأة" : "Your organisation"}
        </legend>

        <div>
          <label className="label" htmlFor="type">
            {labels.type}
          </label>
          <select id="type" name="type" className="field" defaultValue="franchisee">
            {TYPES.map(([value, en, arLabel]) => (
              <option key={value} value={value}>
                {ar ? arLabel : en}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="orgName">
              {labels.orgName} <span className="text-red-600">*</span>
            </label>
            <input id="orgName" name="orgName" required className="field" />
          </div>
          <div>
            <label className="label" htmlFor="orgNameAr">
              {labels.orgNameAr}
            </label>
            <input id="orgNameAr" name="orgNameAr" className="field" />
          </div>
          <div>
            <label className="label" htmlFor="country">
              {labels.country}
            </label>
            <input
              id="country"
              name="country"
              className="field"
              defaultValue={ar ? "المملكة العربية السعودية" : "Saudi Arabia"}
            />
          </div>
          <div>
            <label className="label" htmlFor="city">
              {labels.city}
            </label>
            <input id="city" name="city" className="field" />
          </div>
          <div>
            <label className="label" htmlFor="sector">
              {labels.sector}
            </label>
            <input
              id="sector"
              name="sector"
              className="field"
              placeholder={ar ? "مثال: الأغذية والمشروبات" : "e.g. Food & Beverage"}
            />
          </div>
          <div>
            <label className="label" htmlFor="website">
              {ar ? "الموقع الإلكتروني" : "Website"}
            </label>
            <input id="website" name="website" className="field" dir="ltr" placeholder="https://" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="brands">
            {ar ? "العلامات التجارية (مفصولة بفواصل)" : "Brands (comma separated)"}
          </label>
          <input id="brands" name="brands" className="field" />
        </div>

        {/* Dictation on the long free-text field — this is where it earns its place. */}
        <VoiceField
          name="about"
          label={labels.about}
          rows={4}
          voiceLang={ar ? "ar-SA" : "en-US"}
          placeholder={
            ar
              ? "صف نشاط منشأتك وحجمها وما الذي تسعى إليه من العضوية…"
              : "Describe what your organisation does, its size, and what you want from membership…"
          }
        />
      </fieldset>

      {state?.error && <Banner tone="error">{state.error}</Banner>}

      <div className="space-y-3">
        <SubmitButton className="btn-primary w-full">{labels.submit}</SubmitButton>
        <p className="text-xs leading-relaxed text-brand-900/55">{labels.pendingNote}</p>
      </div>
    </form>
  );
}
