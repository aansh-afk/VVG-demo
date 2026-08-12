import Link from "next/link";
import { getLocale } from "@/lib/auth";
import { tr } from "@/lib/i18n";

export default async function SiteFooter() {
  const locale = await getLocale();
  const T = tr(locale);

  const columns: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: locale === "ar" ? "المنصة" : "Platform",
      links: [
        { href: "/events", label: T("nav_events") },
        { href: "/activity", label: T("nav_activity") },
        { href: "/opportunities", label: T("nav_opportunities") },
        { href: "/members", label: T("nav_members") },
      ],
    },
    {
      title: locale === "ar" ? "التعاونية" : "The cooperative",
      links: [
        { href: "/about", label: T("nav_about") },
        { href: "/board", label: T("nav_board") },
        { href: "/membership", label: T("nav_membership") },
        { href: "/contact", label: T("nav_contact") },
      ],
    },
    {
      title: locale === "ar" ? "المراجع" : "Reference",
      links: [
        { href: "/associations", label: T("nav_associations") },
        { href: "/info-centre", label: T("nav_info") },
      ],
    },
  ];

  return (
    <footer className="mt-16 border-t border-brand-900/10 bg-brand-900 text-white/75">
      <div className="container-x grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-500 text-sm font-bold text-brand-900"
            >
              W
            </span>
            <span className="text-sm font-semibold text-white">{T("brandShort")}</span>
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">{T("tagline")}</p>
          <p className="mt-4 text-xs text-white/45">
            {locale === "ar"
              ? "جميع المراسلات والموافقات تجري داخل المنصة."
              : "All correspondence and approvals happen inside the platform."}
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-white/50">
              {col.title}
            </h3>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-white/45">
          <span>
            © 2026 {T("brand")}.{" "}
            {locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </span>
          <span>
            {locale === "ar"
              ? "نسخة العرض التوضيحي — البيانات المؤسسية بانتظار اعتماد المجلس."
              : "Demonstration build — institutional data pending board sign-off."}
          </span>
        </div>
      </div>
    </footer>
  );
}
