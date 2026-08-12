"use client";

import { useTransition } from "react";
import { setOrgVerification } from "@/app/actions";

const OPTIONS: [string, string, string][] = [
  ["verified", "Verify", "توثيق"],
  ["pending", "Return to pending", "إعادة للمراجعة"],
  ["rejected", "Reject", "رفض"],
  ["suspended", "Suspend", "إيقاف"],
];

/** Super-admin-only override of a member's verification state. */
export default function OrgVerificationControls({
  orgId,
  current,
  locale,
}: {
  orgId: string;
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
          onClick={() => start(() => void setOrgVerification(orgId, value as any))}
          className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-50 ${
            value === "rejected" || value === "suspended"
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
