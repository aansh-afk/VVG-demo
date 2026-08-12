"use client";

import { useActionState } from "react";
import { registerForEvent, type ActionState } from "@/app/actions";
import SubmitButton from "./SubmitButton";
import VoiceField from "./VoiceField";
import { Banner } from "./ui";

export default function RegisterForm({
  eventId,
  locale,
  labels,
}: {
  eventId: string;
  locale: "en" | "ar";
  labels: { register: string; seats: string; note: string; hint: string };
}) {
  const [state, action] = useActionState<ActionState, FormData>(registerForEvent, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="eventId" value={eventId} />

      <div>
        <label className="label" htmlFor="seats">
          {labels.seats}
        </label>
        <input
          id="seats"
          name="seats"
          type="number"
          min={1}
          max={10}
          defaultValue={1}
          className="field"
        />
      </div>

      <VoiceField
        name="note"
        label={labels.note}
        rows={3}
        voiceLang={locale === "ar" ? "ar-SA" : "en-US"}
        placeholder={
          locale === "ar"
            ? "أي متطلبات خاصة أو أسماء المرافقين…"
            : "Any special requirements or the names of colleagues attending…"
        }
      />

      {state?.error && <Banner tone="error">{state.error}</Banner>}
      {state?.ok && <Banner tone="success">{state.ok}</Banner>}

      <SubmitButton className="btn-primary w-full">{labels.register}</SubmitButton>
      <p className="text-xs text-brand-900/50">{labels.hint}</p>
    </form>
  );
}
