import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getLocale } from "@/lib/auth";
import { dir, t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: {
    default: "VVG Franchise Cooperative — Member Portal",
    template: "%s · VVG Franchise Cooperative",
  },
  description:
    "The franchisee marketing cooperative portal: events and live activities, governance, cross-border franchise opportunities, member directory and in-platform approvals. Bilingual English / Arabic.",
};

export const viewport: Viewport = {
  themeColor: "#0f4838",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir={dir(locale)}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-lg focus:bg-brand-800 focus:px-4 focus:py-2 focus:text-white"
        >
          {locale === "ar" ? "تخطَّ إلى المحتوى" : "Skip to content"}
        </a>
        {children}
        <span className="sr-only">{t(locale, "brand")}</span>
      </body>
    </html>
  );
}
