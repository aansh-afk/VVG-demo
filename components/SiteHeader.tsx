import Link from "next/link";
import { currentUser, getLocale } from "@/lib/auth";
import { tr } from "@/lib/i18n";
import LocaleToggle from "./LocaleToggle";
import MobileNav from "./MobileNav";

export default async function SiteHeader() {
  const locale = await getLocale();
  const T = tr(locale);
  const user = await currentUser();

  const links = [
    { href: "/events", label: T("nav_events") },
    { href: "/activity", label: T("nav_activity") },
    { href: "/opportunities", label: T("nav_opportunities") },
    { href: "/members", label: T("nav_members") },
    { href: "/board", label: T("nav_board") },
    { href: "/associations", label: T("nav_associations") },
    { href: "/info-centre", label: T("nav_info") },
    { href: "/membership", label: T("nav_membership") },
  ];

  return (
    <header className="relative bg-brand-900 text-white">
      <div className="container-x flex h-16 items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-gold-300 to-gold-500 text-sm font-bold text-brand-900"
          >
            W
          </span>
          <span className="hidden whitespace-nowrap text-sm font-semibold leading-tight sm:block">
            {T("brandShort")}
          </span>
        </Link>

        {/* The English labels are long, so the full bar only appears at xl;
            below that everything collapses into the sheet menu. */}
        <nav className="ms-auto hidden items-center gap-0.5 xl:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-lg px-2 py-2 text-[13px] font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2 xl:ms-0">
          <LocaleToggle locale={locale} />
          {user ? (
            <Link href="/portal" className="btn-gold btn-sm hidden whitespace-nowrap sm:inline-flex">
              {T("nav_portal")}
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-white/85 hover:text-white sm:inline-block"
              >
                {T("nav_signin")}
              </Link>
              <Link href="/sign-up" className="btn-gold btn-sm hidden whitespace-nowrap sm:inline-flex">
                {T("nav_signup")}
              </Link>
            </>
          )}
          <MobileNav
            links={links}
            signInLabel={T("nav_signin")}
            joinLabel={T("nav_signup")}
            portalLabel={T("nav_portal")}
            signedIn={Boolean(user)}
          />
        </div>
      </div>
    </header>
  );
}
