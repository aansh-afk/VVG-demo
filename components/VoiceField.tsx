"use client";

import { useState } from "react";
import VoiceInput from "./VoiceInput";

/**
 * A textarea (or single-line input) with a dictation button attached. Dictated
 * text is appended to whatever is already typed, so speech and keyboard can be
 * mixed freely in one field.
 */
export default function VoiceField({
  name,
  label,
  placeholder,
  rows = 5,
  required,
  defaultValue = "",
  hint,
  single = false,
  voiceLang = "ar-SA",
}: {
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  defaultValue?: string;
  hint?: string;
  single?: boolean;
  voiceLang?: "ar-SA" | "en-US";
}) {
  const [value, setValue] = useState(defaultValue);

  const append = (text: string) =>
    setValue((current) => (current ? `${current.replace(/\s+$/, "")} ${text}` : text));

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="label mb-0" htmlFor={name}>
          {label}
          {required && <span className="text-red-600"> *</span>}
        </label>
        <VoiceInput onText={append} defaultLang={voiceLang} size="sm" />
      </div>
      {single ? (
        <input
          id={name}
          name={name}
          className="field"
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : (
        <textarea
          id={name}
          name={name}
          rows={rows}
          className="field resize-y"
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      )}
      {hint && <p className="mt-1 text-xs text-brand-900/50">{hint}</p>}
    </div>
  );
}
