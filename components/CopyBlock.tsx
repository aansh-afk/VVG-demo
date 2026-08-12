"use client";

import { useState } from "react";

/** A generated draft with a copy-to-clipboard control. */
export default function CopyBlock({
  title,
  subject,
  body,
  dir,
  copyLabel,
  copiedLabel,
}: {
  title: string;
  subject: string;
  body: string;
  dir: "ltr" | "rtl";
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  // Subjects are "<purpose label>: <excerpt of what was dictated>". Splitting
  // them lets the excerpt be isolated from the label's direction below.
  const split = subject.indexOf(": ");
  const label = split > 0 ? subject.slice(0, split + 2) : "";
  const excerpt = split > 0 ? subject.slice(split + 2) : subject;

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is unavailable (insecure context) — the text is selectable anyway.
    }
  }

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-brand-900/8 bg-brand-50/60 px-5 py-3">
        <h3 className="text-sm font-semibold text-brand-900">{title}</h3>
        <button type="button" onClick={copy} className="btn-ghost btn-sm">
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      {/*
        `bidi-auto` (unicode-bidi: plaintext) makes each line take its direction
        from its own first strong character, so a Latin sentence quoted inside
        an Arabic draft — exactly what you get when someone dictates in English
        and reads the Arabic version — keeps its punctuation at the right end.
        It has to sit on the text elements themselves: unicode-bidi does not
        inherit from a parent.
      */}
      <div className="p-5" dir={dir}>
        <div className="text-sm font-semibold text-brand-900">
          {/*
            The subject is "<purpose label>: <excerpt of what was dictated>", so
            in an Arabic draft an Arabic label routinely introduces a Latin
            excerpt. <bdi> isolates the excerpt from the surrounding direction —
            the label keeps its colon and the excerpt reads left-to-right —
            without putting invisible control characters into the stored subject
            that would then be copied into a real email.
          */}
          {label}
          <bdi>{excerpt}</bdi>
        </div>
        <pre className="bidi-auto mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-brand-900/80">
          {body}
        </pre>
      </div>
    </section>
  );
}
