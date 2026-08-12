"use client";

import Link from "next/link";
import { useState } from "react";

export default function MobileNav({
  links,
  signInLabel,
  joinLabel,
  portalLabel,
  signedIn,
}: {
  links: { href: string; label: string }[];
  signInLabel: string;
  joinLabel: string;
  portalLabel: string;
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Menu"
        className="grid h-10 w-10 place-items-center rounded-lg border border-white/25 text-white"
      >
        <span aria-hidden className="text-lg leading-none">
          {open ? "✕" : "☰"}
        </span>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-40 border-t border-white/10 bg-brand-900 shadow-xl">
          <nav className="container-x flex flex-col py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-3 flex gap-2 border-t border-white/10 pt-3">
              {signedIn ? (
                <Link href="/portal" onClick={() => setOpen(false)} className="btn-gold flex-1">
                  {portalLabel}
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setOpen(false)}
                    className="btn flex-1 border border-white/25 text-white"
                  >
                    {signInLabel}
                  </Link>
                  <Link href="/sign-up" onClick={() => setOpen(false)} className="btn-gold flex-1">
                    {joinLabel}
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
