"use client";

import { useFormStatus } from "react-dom";

/** Submit button that disables itself and shows progress while the action runs. */
export default function SubmitButton({
  children,
  pendingLabel,
  className = "btn-primary",
  name,
  value,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  /** Set both to distinguish which button submitted a multi-action form. */
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} name={name} value={value}>
      {pending ? pendingLabel ?? "Working…" : children}
    </button>
  );
}
