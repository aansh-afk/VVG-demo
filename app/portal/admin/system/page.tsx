import { atLeast, getLocale, pageRole } from "@/lib/auth";
import { tr } from "@/lib/i18n";
import { currentDriver } from "@/lib/db";
import { db } from "@/lib/queries";
import ResetButton from "@/components/ResetButton";
import { Banner } from "@/components/ui";

export default async function SystemPage() {
  const user = await pageRole("super_admin");

  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const ar = locale === "ar";
  const driver = currentDriver();

  const counts: [string, number][] = [
    [ar ? "المستخدمون" : "Users", d.users.length],
    [ar ? "المنشآت" : "Organisations", d.organizations.length],
    [ar ? "الفعاليات" : "Events", d.events.length],
    [ar ? "التسجيلات" : "Registrations", d.registrations.length],
    [ar ? "الفرص" : "Opportunities", d.opportunities.length],
    [ar ? "الاهتمامات" : "Enquiries", d.interests.length],
    [ar ? "الموافقات" : "Approvals", d.approvals.length],
    [ar ? "الرسائل" : "Messages", d.messages.length],
    [ar ? "مسودات المراسلات" : "Drafts", d.drafts.length],
    [ar ? "قيود السجل" : "Log entries", d.activity.length],
    [ar ? "الاتحادات" : "Associations", d.associations.length],
    [ar ? "مركز المعلومات" : "Information entries", d.infoEntries.length],
  ];

  const DRIVER_NOTE = {
    postgres: [
      "Postgres — durable and shared across instances. This is the production configuration.",
      "قاعدة بيانات Postgres — تخزين دائم ومشترك بين النسخ. وهذا هو الإعداد المناسب للتشغيل الفعلي.",
    ],
    file: [
      "Local file (.data/db.json) — durable across restarts on this host, but not shared between instances. Set DATABASE_URL to move to Postgres.",
      "ملف محلي (.data/db.json) — يبقى بعد إعادة التشغيل على هذا الخادم، لكنه غير مشترك بين النسخ. اضبط DATABASE_URL للانتقال إلى Postgres.",
    ],
    memory: [
      "In memory — the filesystem is read-only, so data resets whenever this instance recycles. Set DATABASE_URL to make it durable.",
      "في الذاكرة — نظام الملفات للقراءة فقط، لذا تُفقد البيانات عند إعادة تشغيل النسخة. اضبط DATABASE_URL لجعل التخزين دائماً.",
    ],
  }[driver];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{T("portal_admin_system")}</h1>
        <p className="prose-body mt-1 text-sm">
          {ar ? "حالة التخزين وحجم البيانات وأدوات إعادة الضبط." : "Storage state, data volume and reset tooling."}
        </p>
      </div>

      <section className="card p-6">
        <h2 className="text-base font-semibold">{ar ? "محرّك التخزين" : "Storage driver"}</h2>
        <p className="mt-2 font-mono text-sm font-semibold uppercase text-brand-700">{driver}</p>
        <p className="prose-body mt-2 text-sm">{ar ? DRIVER_NOTE[1] : DRIVER_NOTE[0]}</p>
        {driver === "memory" && (
          <div className="mt-4">
            <Banner tone="warn">
              {ar
                ? "التخزين مؤقت حالياً. أضف متغير DATABASE_URL في إعدادات الاستضافة قبل الإطلاق الفعلي."
                : "Storage is ephemeral right now. Add a DATABASE_URL environment variable in your hosting settings before going live."}
            </Banner>
          </div>
        )}
      </section>

      <section className="card p-6">
        <h2 className="mb-4 text-base font-semibold">{ar ? "حجم البيانات" : "Data volume"}</h2>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {counts.map(([label, n]) => (
            <div key={label} className="rounded-xl bg-brand-50 px-3.5 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-brand-900/50">
                {label}
              </dt>
              <dd className="mt-0.5 text-xl font-semibold text-brand-800">{n}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card border-red-200 p-6">
        <h2 className="text-base font-semibold text-red-800">
          {ar ? "إعادة ضبط البيانات" : "Reset the data"}
        </h2>
        <p className="prose-body mt-2 text-sm">
          {ar
            ? "يمسح كل شيء ويعيد بناء البيانات الأولية: الأعضاء والفعاليات والفرص والحسابات التجريبية. تُلغى جميع الجلسات بما فيها جلستك."
            : "Wipes everything and rebuilds the seed: members, events, opportunities and the demonstration accounts. All sessions are dropped, including yours."}
        </p>
        <div className="mt-4">
          <ResetButton
            labels={{
              reset: ar ? "إعادة الضبط…" : "Reset data…",
              confirm: ar ? "نعم، امسح وأعد البناء" : "Yes, wipe and rebuild",
              cancel: T("cancel"),
              warning: ar
                ? "لا يمكن التراجع عن هذا الإجراء."
                : "This cannot be undone.",
            }}
          />
        </div>
      </section>
    </div>
  );
}
