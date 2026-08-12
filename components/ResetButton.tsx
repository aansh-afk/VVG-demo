"use client";

import { useState, useTransition } from "react";
import { resetDemoData } from "@/app/actions";

/**
 * Destructive: wipes all portal data and rebuilds the seed. Two-step by design,
 * and it signs everyone out because the seeded accounts are recreated.
 */
export default function ResetButton({
  labels,
}: {
  labels: { reset: string; confirm: string; cancel: string; warning: string };
}) {
  const [armed, setArmed] = useState(false);
  const [pending, start] = useTransition();

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className="btn btn-sm border border-red-200 bg-white text-red-700 hover:bg-red-50"
      >
        {labels.reset}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-red-800">{labels.warning}</p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => start(() => void resetDemoData())}
          className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
        >
          {labels.confirm}
        </button>
        <button type="button" onClick={() => setArmed(false)} className="btn-ghost btn-sm">
          {labels.cancel}
        </button>
      </div>
    </div>
  );
}
