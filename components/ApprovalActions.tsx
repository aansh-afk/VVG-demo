"use client";

import { useState, useTransition } from "react";
import { decideApproval } from "@/app/actions";

/**
 * Approve / reject with an optional note. The note is stored with the decision
 * so the audit trail records not just what was decided but why.
 */
export default function ApprovalActions({
  approvalId,
  labels,
}: {
  approvalId: string;
  labels: { approve: string; reject: string; note: string };
}) {
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();

  const decide = (decision: "approved" | "rejected") =>
    start(() => void decideApproval(approvalId, decision, note));

  return (
    <div className="mt-3 space-y-2">
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={labels.note}
        className="field py-2 text-xs"
        aria-label={labels.note}
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => decide("approved")}
          className="btn-primary btn-sm flex-1"
        >
          {labels.approve}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => decide("rejected")}
          className="btn btn-sm flex-1 border border-red-200 bg-white text-red-700 hover:bg-red-50"
        >
          {labels.reject}
        </button>
      </div>
    </div>
  );
}
