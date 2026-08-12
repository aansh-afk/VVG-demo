import { atLeast, getLocale, pageRole } from "@/lib/auth";
import { formatDate, tr } from "@/lib/i18n";
import { db } from "@/lib/queries";
import UserControls from "@/components/UserControls";
import { Avatar, Pill } from "@/components/ui";

export default async function AdminUsersPage() {
  const user = await pageRole("super_admin");

  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const ar = locale === "ar";

  const RANK = { super_admin: 0, admin: 1, member: 2 } as const;
  const users = [...d.users].sort(
    (a, b) => RANK[a.role] - RANK[b.role] || a.fullName.localeCompare(b.fullName)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{T("portal_admin_users")}</h1>
        <p className="prose-body mt-1 text-sm">
          {ar
            ? "كل حساب في المنصة وصلاحيته. تغيير الصلاحية أو إيقاف الحساب يُسجَّل في سجل التدقيق فوراً."
            : "Every account in the platform and its authority. Role changes and suspensions land in the audit trail immediately."}
        </p>
      </div>

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-brand-900/8 bg-brand-50/60 text-start">
                <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-brand-900/50">
                  {ar ? "الحساب" : "Account"}
                </th>
                <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-brand-900/50">
                  {ar ? "المنشأة" : "Organisation"}
                </th>
                <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-brand-900/50">
                  {ar ? "منذ" : "Since"}
                </th>
                <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-brand-900/50">
                  {ar ? "الصلاحية" : "Authority"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/8">
              {users.map((u) => {
                const org = d.organizations.find((o) => o.id === u.organizationId);
                return (
                  <tr key={u.id} className={u.active ? "" : "bg-red-50/40"}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          initials={u.fullName.split(/\s+/).slice(0, 2).map((w) => w[0]).join("")}
                          size="sm"
                          tone={
                            u.role === "member"
                              ? "from-brand-600 to-brand-800"
                              : "from-gold-500 to-brand-700"
                          }
                        />
                        <div className="min-w-0">
                          <div className="truncate font-medium text-brand-900">
                            {ar && u.fullNameAr ? u.fullNameAr : u.fullName}
                            {!u.active && (
                              <span className="ms-2">
                                <Pill tone="red">{ar ? "موقوف" : "suspended"}</Pill>
                              </span>
                            )}
                          </div>
                          <div className="truncate text-xs text-brand-900/50" dir="ltr">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-brand-900/65">
                      {org ? (ar ? org.nameAr : org.name) : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-brand-900/50">
                      {formatDate(locale, u.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <UserControls
                        userId={u.id}
                        role={u.role}
                        active={u.active}
                        isSelf={u.id === user.id}
                        locale={locale}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
