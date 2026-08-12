"use client";

import { useActionState } from "react";
import { generateMessage, type ActionState } from "@/app/actions";
import SubmitButton from "./SubmitButton";
import VoiceField from "./VoiceField";
import { Banner } from "./ui";

export default function ComposerForm({
  locale,
  purposes,
  labels,
}: {
  locale: "en" | "ar";
  purposes: { value: string; label: string }[];
  labels: {
    purpose: string;
    recipient: string;
    input: string;
    generate: string;
    hint: string;
  };
}) {
  const [state, action] = useActionState<ActionState, FormData>(generateMessage, null);
  const ar = locale === "ar";

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="purpose">
            {labels.purpose}
          </label>
          <select id="purpose" name="purpose" className="field" defaultValue="inquiry">
            {purposes.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="recipientName">
            {labels.recipient}
          </label>
          <input
            id="recipientName"
            name="recipientName"
            className="field"
            placeholder={ar ? "سعادة الأستاذ…" : "Dr / Mr / Ms…"}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="recipientEmail">
          {ar ? "بريد المرسل إليه (اختياري)" : "Recipient email (optional)"}
        </label>
        <input
          id="recipientEmail"
          name="recipientEmail"
          type="email"
          className="field"
          dir="ltr"
        />
      </div>

      <VoiceField
        name="transcript"
        label={labels.input}
        rows={7}
        required
        voiceLang={ar ? "ar-SA" : "en-US"}
        hint={labels.hint}
        placeholder={
          ar
            ? "اضغط الميكروفون وتحدّث بالعربية أو الإنجليزية — أو اكتب هنا مباشرة…"
            : "Press the microphone and speak in Arabic or English — or just type here…"
        }
      />

      {state?.error && <Banner tone="error">{state.error}</Banner>}
      {state?.ok && <Banner tone="success">{state.ok}</Banner>}

      <SubmitButton className="btn-primary w-full sm:w-auto">{labels.generate}</SubmitButton>
    </form>
  );
}
