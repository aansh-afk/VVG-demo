"use client";

import { useActionState } from "react";
import { saveEvent, type ActionState } from "@/app/actions";
import SubmitButton from "./SubmitButton";
import VoiceField from "./VoiceField";
import { Banner } from "./ui";

export default function EventForm({ locale }: { locale: "en" | "ar" }) {
  const [state, action] = useActionState<ActionState, FormData>(saveEvent, null);
  const ar = locale === "ar";

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="titleEn">
            {ar ? "العنوان (إنجليزي)" : "Title (English)"} <span className="text-red-600">*</span>
          </label>
          <input id="titleEn" name="titleEn" required className="field" />
        </div>
        <div>
          <label className="label" htmlFor="titleAr">
            {ar ? "العنوان (عربي)" : "Title (Arabic)"}
          </label>
          <input id="titleAr" name="titleAr" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="category">
            {ar ? "التصنيف" : "Category"}
          </label>
          <input
            id="category"
            name="category"
            className="field"
            placeholder={ar ? "ملتقى، ورشة، بعثة تجارية…" : "Forum, workshop, trade mission…"}
          />
        </div>
        <div>
          <label className="label" htmlFor="format">
            {ar ? "نمط الحضور" : "Format"}
          </label>
          <select id="format" name="format" className="field" defaultValue="in_person">
            <option value="in_person">{ar ? "حضورياً" : "In person"}</option>
            <option value="virtual">{ar ? "عن بُعد" : "Virtual"}</option>
            <option value="hybrid">{ar ? "حضورياً وعن بُعد" : "Hybrid"}</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="startsAt">
            {ar ? "تاريخ ووقت البدء" : "Start date and time"}
          </label>
          <input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            className="field"
            dir="ltr"
          />
        </div>
        <div>
          <label className="label" htmlFor="durationHours">
            {ar ? "المدة (ساعات)" : "Duration (hours)"}
          </label>
          <input
            id="durationHours"
            name="durationHours"
            type="number"
            min={1}
            defaultValue={8}
            className="field"
            dir="ltr"
          />
        </div>
        <div>
          <label className="label" htmlFor="venueEn">
            {ar ? "المكان (إنجليزي)" : "Venue (English)"}
          </label>
          <input id="venueEn" name="venueEn" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="venueAr">
            {ar ? "المكان (عربي)" : "Venue (Arabic)"}
          </label>
          <input id="venueAr" name="venueAr" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="city">
            {ar ? "المدينة" : "City"}
          </label>
          <input id="city" name="city" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="country">
            {ar ? "الدولة" : "Country"}
          </label>
          <input id="country" name="country" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="capacity">
            {ar ? "السعة" : "Capacity"}
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={50}
            className="field"
            dir="ltr"
          />
        </div>
        <div>
          <label className="label" htmlFor="feeSar">
            {ar ? "الرسوم (ريال، 0 = مجاناً)" : "Fee (SAR, 0 = free)"}
          </label>
          <input
            id="feeSar"
            name="feeSar"
            type="number"
            min={0}
            defaultValue={0}
            className="field"
            dir="ltr"
          />
        </div>
      </div>

      <VoiceField
        name="summaryEn"
        label={ar ? "الملخص (إنجليزي)" : "Summary (English)"}
        rows={2}
        voiceLang="en-US"
      />
      <VoiceField
        name="summaryAr"
        label={ar ? "الملخص (عربي)" : "Summary (Arabic)"}
        rows={2}
        voiceLang="ar-SA"
      />
      <VoiceField
        name="descriptionEn"
        label={ar ? "الوصف (إنجليزي)" : "Description (English)"}
        rows={5}
        voiceLang="en-US"
      />
      <VoiceField
        name="descriptionAr"
        label={ar ? "الوصف (عربي)" : "Description (Arabic)"}
        rows={5}
        voiceLang="ar-SA"
      />

      {state?.error && <Banner tone="error">{state.error}</Banner>}
      {state?.ok && <Banner tone="success">{state.ok}</Banner>}

      <SubmitButton className="btn-primary">
        {ar ? "إنشاء كمسودة" : "Create as draft"}
      </SubmitButton>
    </form>
  );
}
