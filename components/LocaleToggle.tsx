"use client";

import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { switchLocale } from "@/app/actions";
import { Locale } from "@/lib/models";

/**
 * Flips the whole site between English and Arabic. The choice is stored in a
 * cookie and read on the server, so `dir="rtl"` is applied during the first
 * render rather than flashing left-to-right first.
 */
export default function LocaleToggle({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const next: Locale = locale === "ar" ? "en" : "ar";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => void switchLocale(next, pathname))}
      className="rounded-lg border border-white/25 px-2.5 py-1.5 text-xs font-semibold text-white/90 transition hover:border-gold-400 hover:text-white disabled:opacity-50"
      title={next === "ar" ? "التبديل إلى العربية" : "Switch to English"}
    >
      {next === "ar" ? "العربية" : "English"}
    </button>
  );
}
