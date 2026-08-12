"use client";

import { useTransition } from "react";
import { setUserActive, setUserRole } from "@/app/actions";
import { Role } from "@/lib/models";

const ROLES: [Role, string, string][] = [
  ["member", "Member", "عضو"],
  ["admin", "Administrator", "مدير"],
  ["super_admin", "Super admin", "مشرف عام"],
];

export default function UserControls({
  userId,
  role,
  active,
  isSelf,
  locale,
}: {
  userId: string;
  role: Role;
  active: boolean;
  isSelf: boolean;
  locale: "en" | "ar";
}) {
  const [pending, start] = useTransition();
  const ar = locale === "ar";

  // A super admin cannot demote or suspend their own account — that is the one
  // way to lock everybody out of the portal.
  if (isSelf) {
    return (
      <span className="text-[11px] italic text-brand-900/40">
        {ar ? "حسابك الحالي" : "your own account"}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <select
        value={role}
        disabled={pending}
        onChange={(e) => start(() => void setUserRole(userId, e.target.value as Role))}
        className="rounded-lg border border-brand-900/12 bg-white px-2 py-1 text-[11px] font-semibold text-brand-800 disabled:opacity-50"
        aria-label={ar ? "الصلاحية" : "Role"}
      >
        {ROLES.map(([value, en, arLabel]) => (
          <option key={value} value={value}>
            {ar ? arLabel : en}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => void setUserActive(userId, !active))}
        className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition disabled:opacity-50 ${
          active
            ? "border-red-200 text-red-700 hover:bg-red-50"
            : "border-brand-900/12 text-brand-800 hover:border-brand-600 hover:bg-brand-50"
        }`}
      >
        {active ? (ar ? "إيقاف" : "Suspend") : ar ? "إعادة التفعيل" : "Reinstate"}
      </button>
    </div>
  );
}
