import Link from "next/link";
import { Locale } from "@/lib/models";

/* Small presentational primitives shared across the public site and portal. */

const TONES: Record<string, string> = {
  green: "bg-brand-100 text-brand-800",
  gold: "bg-gold-300/30 text-gold-600",
  grey: "bg-brand-900/8 text-brand-900/60",
  red: "bg-red-100 text-red-700",
  blue: "bg-sky-100 text-sky-800",
  amber: "bg-amber-100 text-amber-800",
};

export function Pill({
  children,
  tone = "grey",
  className = "",
}: {
  children: React.ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return <span className={`pill ${TONES[tone] ?? TONES.grey} ${className}`}>{children}</span>;
}

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  verified: "green",
  published: "green",
  approved: "green",
  confirmed: "green",
  attended: "green",
  live: "red",
  pending: "amber",
  pending_approval: "amber",
  waitlisted: "amber",
  in_review: "amber",
  new: "blue",
  draft: "grey",
  completed: "grey",
  closed: "grey",
  cancelled: "red",
  rejected: "red",
  declined: "red",
  suspended: "red",
};

const STATUS_LABEL: Record<string, [string, string]> = {
  verified: ["Verified", "موثّق"],
  pending: ["Pending", "قيد المراجعة"],
  pending_approval: ["Awaiting approval", "بانتظار الاعتماد"],
  rejected: ["Rejected", "مرفوض"],
  suspended: ["Suspended", "موقوف"],
  draft: ["Draft", "مسودة"],
  published: ["Published", "منشور"],
  live: ["Live now", "جارية الآن"],
  completed: ["Completed", "منتهية"],
  cancelled: ["Cancelled", "ملغاة"],
  closed: ["Closed", "مغلقة"],
  approved: ["Approved", "معتمد"],
  confirmed: ["Confirmed", "مؤكد"],
  waitlisted: ["Waiting list", "قائمة الانتظار"],
  declined: ["Declined", "مرفوض"],
  attended: ["Attended", "حضر"],
  new: ["New", "جديد"],
  in_review: ["In review", "قيد الدراسة"],
  accepted: ["Accepted", "مقبول"],
};

export function StatusPill({ status, locale }: { status: string; locale: Locale }) {
  const label = STATUS_LABEL[status] ?? [status, status];
  return (
    <Pill tone={STATUS_TONE[status] ?? "grey"}>
      {status === "live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" />}
      {locale === "ar" ? label[1] : label[0]}
    </Pill>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="prose-body mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="card p-5">
      <div className="text-3xl font-semibold tracking-tight text-brand-800">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-900/50">
        {label}
      </div>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="card grid place-items-center px-6 py-12 text-center text-sm text-brand-900/50">
      {children}
    </div>
  );
}

export function Avatar({
  initials,
  tone = "from-brand-700 to-brand-900",
  size = "md",
}: {
  initials: string;
  tone?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const dims = {
    sm: "h-9 w-9 text-xs",
    md: "h-14 w-14 text-base",
    lg: "h-24 w-24 text-2xl",
    xl: "h-36 w-36 text-4xl",
  }[size];
  return (
    <div
      className={`${dims} grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${tone} font-semibold text-white shadow-card`}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export function Banner({
  tone = "info",
  children,
}: {
  tone?: "info" | "warn" | "error" | "success";
  children: React.ReactNode;
}) {
  const map = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    warn: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-brand-200 bg-brand-50 text-brand-800",
  }[tone];
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${map}`} role="status">
      {children}
    </div>
  );
}

export function Crumb({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-900"
    >
      <span aria-hidden className="inline-block rtl:rotate-180">
        ←
      </span>
      {children}
    </Link>
  );
}
