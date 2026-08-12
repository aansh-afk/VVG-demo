"use client";

import { useActionState } from "react";
import { saveOpportunity, type ActionState } from "@/app/actions";
import SubmitButton from "./SubmitButton";
import VoiceField from "./VoiceField";
import { Banner } from "./ui";

export default function OpportunityForm({
  locale,
  disabled,
  disabledReason,
}: {
  locale: "en" | "ar";
  disabled: boolean;
  disabledReason?: string;
}) {
  const [state, action] = useActionState<ActionState, FormData>(saveOpportunity, null);
  const ar = locale === "ar";

  if (disabled) return <Banner tone="warn">{disabledReason}</Banner>;

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="brandName">
            {ar ? "اسم العلامة" : "Brand name"} <span className="text-red-600">*</span>
          </label>
          <input id="brandName" name="brandName" required className="field" />
        </div>
        <div>
          <label className="label" htmlFor="sector">
            {ar ? "القطاع" : "Sector"}
          </label>
          <input id="sector" name="sector" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="model">
            {ar ? "نموذج الامتياز" : "Franchise model"}
          </label>
          <select id="model" name="model" className="field" defaultValue="Master franchise">
            <option value="Master franchise">{ar ? "امتياز رئيسي" : "Master franchise"}</option>
            <option value="Area development">{ar ? "تطوير مناطق" : "Area development"}</option>
            <option value="Single-unit">{ar ? "فرع واحد" : "Single unit"}</option>
            <option value="Joint venture">{ar ? "مشروع مشترك" : "Joint venture"}</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="homeCountry">
            {ar ? "دولة المنشأ" : "Home country"}
          </label>
          <input id="homeCountry" name="homeCountry" className="field" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="targetCountries">
            {ar ? "الأسواق المستهدفة (مفصولة بفواصل)" : "Target markets (comma separated)"}
          </label>
          <input
            id="targetCountries"
            name="targetCountries"
            className="field"
            placeholder={ar ? "ماليزيا، سنغافورة، إندونيسيا" : "Malaysia, Singapore, Indonesia"}
          />
        </div>
        <div>
          <label className="label" htmlFor="investmentFrom">
            {ar ? "الاستثمار من (ريال)" : "Investment from (SAR)"}
          </label>
          <input
            id="investmentFrom"
            name="investmentFrom"
            type="number"
            min={0}
            className="field"
            dir="ltr"
          />
        </div>
        <div>
          <label className="label" htmlFor="investmentTo">
            {ar ? "إلى (ريال)" : "to (SAR)"}
          </label>
          <input
            id="investmentTo"
            name="investmentTo"
            type="number"
            min={0}
            className="field"
            dir="ltr"
          />
        </div>
        <div>
          <label className="label" htmlFor="royalty">
            {ar ? "نسبة الإتاوة %" : "Royalty %"}
          </label>
          <input
            id="royalty"
            name="royalty"
            type="number"
            min={0}
            max={50}
            step="0.5"
            className="field"
            dir="ltr"
          />
        </div>
      </div>

      <VoiceField
        name="summaryEn"
        label={ar ? "ملخص الفرصة (إنجليزي)" : "Opportunity summary (English)"}
        rows={4}
        voiceLang="en-US"
      />
      <VoiceField
        name="summaryAr"
        label={ar ? "ملخص الفرصة (عربي)" : "Opportunity summary (Arabic)"}
        rows={4}
        voiceLang="ar-SA"
      />
      <VoiceField
        name="requirementsEn"
        label={ar ? "متطلبات الممنوح (إنجليزي)" : "Franchisee requirements (English)"}
        rows={3}
        voiceLang="en-US"
      />
      <VoiceField
        name="supportEn"
        label={ar ? "الدعم المقدَّم (إنجليزي)" : "Support provided (English)"}
        rows={3}
        voiceLang="en-US"
      />

      {state?.error && <Banner tone="error">{state.error}</Banner>}
      {state?.ok && <Banner tone="success">{state.ok}</Banner>}

      <div className="flex flex-wrap gap-3">
        <button type="submit" name="intent" value="draft" className="btn-ghost">
          {ar ? "حفظ كمسودة" : "Save as draft"}
        </button>
        <SubmitButton className="btn-primary" name="intent" value="submit">
          {ar ? "إرسال للاعتماد" : "Submit for approval"}
        </SubmitButton>
      </div>
      <p className="text-xs text-brand-900/50">
        {ar
          ? "تُنشر الفرصة على الموقع العام فور اعتمادها من المشرف العام."
          : "The opportunity goes live on the public site as soon as the super admin approves it."}
      </p>
    </form>
  );
}
