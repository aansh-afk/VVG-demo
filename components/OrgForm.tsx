"use client";

import { useActionState } from "react";
import { updateProfile, type ActionState } from "@/app/actions";
import SubmitButton from "./SubmitButton";
import VoiceField from "./VoiceField";
import { Banner } from "./ui";

export default function OrgForm({
  locale,
  user,
  org,
  labels,
}: {
  locale: "en" | "ar";
  user: {
    fullName: string;
    fullNameAr?: string;
    jobTitle?: string;
    phone?: string;
  };
  org?: {
    name: string;
    nameAr: string;
    sector: string;
    city?: string;
    country: string;
    website?: string;
    aboutEn: string;
    aboutAr: string;
    brands: string[];
    outletCount?: number;
  };
  labels: Record<string, string>;
}) {
  const [state, action] = useActionState<ActionState, FormData>(updateProfile, null);
  const ar = locale === "ar";

  return (
    <form action={action} className="space-y-8">
      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-semibold text-brand-900">
          {ar ? "بياناتك الشخصية" : "Your details"}
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="fullName">
              {labels.fullName}
            </label>
            <input id="fullName" name="fullName" className="field" defaultValue={user.fullName} />
          </div>
          <div>
            <label className="label" htmlFor="fullNameAr">
              {ar ? "الاسم بالعربية" : "Name in Arabic"}
            </label>
            <input
              id="fullNameAr"
              name="fullNameAr"
              className="field"
              defaultValue={user.fullNameAr ?? ""}
            />
          </div>
          <div>
            <label className="label" htmlFor="jobTitle">
              {labels.jobTitle}
            </label>
            <input id="jobTitle" name="jobTitle" className="field" defaultValue={user.jobTitle ?? ""} />
          </div>
          <div>
            <label className="label" htmlFor="phone">
              {labels.phone}
            </label>
            <input id="phone" name="phone" className="field" dir="ltr" defaultValue={user.phone ?? ""} />
          </div>
        </div>
      </fieldset>

      {org && (
        <fieldset className="space-y-4">
          <legend className="mb-2 text-sm font-semibold text-brand-900">
            {ar ? "بيانات المنشأة" : "Organisation details"}
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="orgName">
                {labels.orgName}
              </label>
              <input id="orgName" name="orgName" className="field" defaultValue={org.name} />
            </div>
            <div>
              <label className="label" htmlFor="orgNameAr">
                {labels.orgNameAr}
              </label>
              <input id="orgNameAr" name="orgNameAr" className="field" defaultValue={org.nameAr} />
            </div>
            <div>
              <label className="label" htmlFor="sector">
                {labels.sector}
              </label>
              <input id="sector" name="sector" className="field" defaultValue={org.sector} />
            </div>
            <div>
              <label className="label" htmlFor="website">
                {ar ? "الموقع الإلكتروني" : "Website"}
              </label>
              <input
                id="website"
                name="website"
                className="field"
                dir="ltr"
                defaultValue={org.website ?? ""}
              />
            </div>
            <div>
              <label className="label" htmlFor="city">
                {labels.city}
              </label>
              <input id="city" name="city" className="field" defaultValue={org.city ?? ""} />
            </div>
            <div>
              <label className="label" htmlFor="country">
                {labels.country}
              </label>
              <input id="country" name="country" className="field" defaultValue={org.country} />
            </div>
            <div>
              <label className="label" htmlFor="brands">
                {ar ? "العلامات التجارية (مفصولة بفواصل)" : "Brands (comma separated)"}
              </label>
              <input
                id="brands"
                name="brands"
                className="field"
                defaultValue={org.brands.join(", ")}
              />
            </div>
            <div>
              <label className="label" htmlFor="outletCount">
                {ar ? "عدد الفروع" : "Outlet count"}
              </label>
              <input
                id="outletCount"
                name="outletCount"
                type="number"
                min={0}
                className="field"
                defaultValue={org.outletCount ?? ""}
              />
            </div>
          </div>

          <VoiceField
            name="aboutEn"
            label={ar ? "النبذة بالإنجليزية" : "Overview (English)"}
            rows={4}
            defaultValue={org.aboutEn}
            voiceLang="en-US"
          />
          <VoiceField
            name="aboutAr"
            label={ar ? "النبذة بالعربية" : "Overview (Arabic)"}
            rows={4}
            defaultValue={org.aboutAr}
            voiceLang="ar-SA"
          />
        </fieldset>
      )}

      {state?.error && <Banner tone="error">{state.error}</Banner>}
      {state?.ok && <Banner tone="success">{state.ok}</Banner>}

      <SubmitButton className="btn-primary">{labels.save}</SubmitButton>
    </form>
  );
}
