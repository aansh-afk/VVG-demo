"use client";

import { useActionState } from "react";
import { expressInterest, type ActionState } from "@/app/actions";
import SubmitButton from "./SubmitButton";
import VoiceField from "./VoiceField";
import { Banner } from "./ui";

export default function InterestForm({
  opportunityId,
  locale,
  labels,
}: {
  opportunityId: string;
  locale: "en" | "ar";
  labels: { submit: string; message: string; hint: string };
}) {
  const [state, action] = useActionState<ActionState, FormData>(expressInterest, null);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="opportunityId" value={opportunityId} />
      <VoiceField
        name="message"
        label={labels.message}
        rows={5}
        required
        voiceLang={locale === "ar" ? "ar-SA" : "en-US"}
        placeholder={
          locale === "ar"
            ? "عرّف بمنشأتك وخبرتك التشغيلية والأسواق التي تستهدفها…"
            : "Introduce your organisation, your operating experience and the territory you want…"
        }
      />
      {state?.error && <Banner tone="error">{state.error}</Banner>}
      {state?.ok && <Banner tone="success">{state.ok}</Banner>}
      <SubmitButton className="btn-primary w-full">{labels.submit}</SubmitButton>
      <p className="text-xs text-brand-900/50">{labels.hint}</p>
    </form>
  );
}
