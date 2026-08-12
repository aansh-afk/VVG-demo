"use client";

import { useTransition } from "react";
import { setEventStatus } from "@/app/actions";

const OPTIONS: [string, string, string][] = [
  ["draft", "Draft", "مسودة"],
  ["published", "Publish", "نشر"],
  ["live", "Go live", "بدء البث"],
  ["completed", "Complete", "إنهاء"],
  ["cancelled", "Cancel", "إلغاء"],
];

export default function EventStatusControls({
  eventId,
  current,
  locale,
}: {
  eventId: string;
  current: string;
  locale: "en" | "ar";
}) {
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-1.5">
      {OPTIONS.filter(([value]) => value !== current).map(([value, en, ar]) => (
        <button
          key={value}
          type="button"
          disabled={pending}
          onClick={() => start(() => void setEventStatus(eventId, value))}
          className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-50 ${
            value === "cancelled"
              ? "border-red-200 text-red-700 hover:bg-red-50"
              : "border-brand-900/12 text-brand-800 hover:border-brand-600 hover:bg-brand-50"
          }`}
        >
          {locale === "ar" ? ar : en}
        </button>
      ))}
    </div>
  );
}
