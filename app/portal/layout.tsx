import Link from "next/link";
import { redirect } from "next/navigation";
import { atLeast, currentUser, getLocale } from "@/lib/auth";
import { tr } from "@/lib/i18n";
import { db, pendingApprovals } from "@/lib/queries";
import { signOut } from "@/app/actions";
import LocaleToggle from "@/components/LocaleToggle";
import { Avatar, Pill } from "@/components/ui";

/**
 * Portal shell. Everything under /portal requires a session; the navigation
 * itself is assembled from the caller's role, and every action re-checks that
 * role server-side.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const org = d.organizations.find((o) => o.id === user.organizationId);
  const queue = atLeast(user, "admin") ? pendingApprovals(d).length : 0;

  const memberLinks = [
    { href: "/portal", label: T("portal_overview"), icon: "▦" },
    { href: "/portal/organization", label: T("portal_org"), icon: "🏢" },
    { href: "/portal/events", label: T("portal_my_events"), icon: "📅" },
    { href: "/portal/opportunities", label: T("portal_my_opps"), icon: "🌍" },
    { href: "/portal/messages", label: T("portal_messages"), icon: "💬" },
    { href: "/portal/compose", label: T("portal_compose"), icon: "🎤" },
  ];

  const adminLinks = atLeast(user, "admin")
    ? [
        { href: "/portal/approvals", label: T("portal_approvals"), icon: "✅", badge: queue },
        { href: "/portal/admin/events", label: T("portal_admin_events"), icon: "🗓️" },
        { href: "/portal/admin/members", label: T("portal_admin_members"), icon: "🏛️" },
        { href: "/portal/admin/audit", label: T("portal_admin_audit"), icon: "📜" },
      ]
    : [];

  const superLinks = atLeast(user, "super_admin")
    ? [
        { href: "/portal/admin/users", label: T("portal_admin_users"), icon: "👤" },
        { href: "/portal/admin/system", label: T("portal_admin_system"), icon: "⚙️" },
      ]
    : [];

  const roleLabel =
    user.role === "super_admin"
      ? locale === "ar"
        ? "المشرف العام"
        : "Super admin"
      : user.role === "admin"
        ? locale === "ar"
          ? "مدير"
          : "Administrator"
        : locale === "ar"
          ? "عضو"
          : "Member";

  return (
    <div className="min-h-screen bg-brand-50/50">
      <header className="sticky top-0 z-30 bg-brand-900 text-white">
        <div className="container-x flex h-14 items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span
              aria-hidden
              className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-gold-300 to-gold-500 text-[11px] font-bold text-brand-900"
            >
              W
            </span>
            <span className="hidden text-xs font-semibold sm:block">{T("portal_title")}</span>
          </Link>
          <div className="ms-auto flex items-center gap-2">
            <LocaleToggle locale={locale} />
            <Link
              href="/"
              className="hidden rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:text-white sm:block"
            >
              {T("nav_home")}
            </Link>
            <form action={signOut}>
              <button className="rounded-lg border border-white/25 px-2.5 py-1.5 text-xs font-semibold text-white/90 hover:border-gold-400">
                {T("nav_signout")}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="container-x grid gap-6 py-6 lg:grid-cols-[248px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <Avatar
                initials={user.fullName.split(/\s+/).slice(0, 2).map((w) => w[0]).join("")}
                size="sm"
                tone="from-gold-500 to-brand-700"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-brand-900">
                  {locale === "ar" && user.fullNameAr ? user.fullNameAr : user.fullName}
                </div>
                <div className="truncate text-xs text-brand-900/50">{user.jobTitle ?? ""}</div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Pill tone={user.role === "member" ? "grey" : "gold"}>{roleLabel}</Pill>
              {org && (
                <Pill tone={org.verification === "verified" ? "green" : "amber"}>
                  {org.verification === "verified"
                    ? locale === "ar"
                      ? "موثّق"
                      : "Verified"
                    : locale === "ar"
                      ? "قيد التوثيق"
                      : "Pending"}
                </Pill>
              )}
            </div>
          </div>

          <nav className="card mt-4 overflow-hidden p-2">
            {memberLinks.map((l) => (
              <NavItem key={l.href} {...l} />
            ))}

            {adminLinks.length > 0 && (
              <>
                <div className="mt-3 px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-brand-900/40">
                  {T("portal_admin")}
                </div>
                {adminLinks.map((l) => (
                  <NavItem key={l.href} {...l} />
                ))}
              </>
            )}

            {superLinks.length > 0 && (
              <>
                <div className="mt-3 px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-wider text-brand-900/40">
                  {locale === "ar" ? "المشرف العام" : "Super admin"}
                </div>
                {superLinks.map((l) => (
                  <NavItem key={l.href} {...l} />
                ))}
              </>
            )}
          </nav>
        </aside>

        <main id="main" className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon,
  badge,
}: {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-brand-900/75 transition hover:bg-brand-50 hover:text-brand-900"
    >
      <span aria-hidden className="w-4 text-center text-xs">
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {badge != null && badge > 0 && (
        <span className="rounded-full bg-gold-400 px-1.5 py-0.5 text-[10px] font-bold text-brand-900">
          {badge}
        </span>
      )}
    </Link>
  );
}
