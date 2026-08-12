"use client";

import { useActionState } from "react";
import { postMessage, type ActionState } from "@/app/actions";
import SubmitButton from "./SubmitButton";
import VoiceField from "./VoiceField";
import { Banner } from "./ui";

export default function MessageForm({
  locale,
  labels,
}: {
  locale: "en" | "ar";
  labels: { field: string; submit: string };
}) {
  const [state, action] = useActionState<ActionState, FormData>(postMessage, null);

  return (
    <form action={action} className="space-y-3">
      <VoiceField
        name="body"
        label={labels.field}
        rows={3}
        required
        voiceLang={locale === "ar" ? "ar-SA" : "en-US"}
        placeholder={
          locale === "ar" ? "اكتب أو أملِ رسالتك للقناة…" : "Type or dictate a message to the channel…"
        }
      />
      {state?.error && <Banner tone="error">{state.error}</Banner>}
      <SubmitButton className="btn-primary">{labels.submit}</SubmitButton>
    </form>
  );
}
