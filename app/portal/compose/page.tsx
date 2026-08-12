import { getLocale, pageUser } from "@/lib/auth";
import { formatDate, tr } from "@/lib/i18n";
import { db } from "@/lib/queries";
import { PURPOSES } from "@/lib/ai";
import ComposerForm from "@/components/ComposerForm";
import CopyBlock from "@/components/CopyBlock";
import { Banner, Empty } from "@/components/ui";

/**
 * Voice-note → bilingual correspondence. Dictate in Arabic or English and the
 * portal produces a formal draft in both languages, saved to the member's
 * history so it can be reused or audited.
 */
export default async function ComposePage() {
  const user = await pageUser();
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const ar = locale === "ar";

  const drafts = d.drafts
    .filter((x) => x.userId === user.id)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 10);
  const latest = drafts[0];

  const purposes = Object.entries(PURPOSES).map(([value, p]) => ({
    value,
    label: ar ? p.labelAr : p.labelEn,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{T("compose_title")}</h1>
        <p className="prose-body mt-1 text-sm">{T("compose_sub")}</p>
      </div>

      <div className="card p-6">
        <ComposerForm
          locale={locale}
          purposes={purposes}
          labels={{
            purpose: T("compose_purpose"),
            recipient: T("compose_recipient"),
            input: T("compose_input"),
            generate: T("compose_generate"),
            hint: T("voice_hint"),
          }}
        />
      </div>

      {latest && (
        <div className="grid gap-5 lg:grid-cols-2">
          <CopyBlock
            title={T("compose_result_en")}
            subject={latest.subjectEn}
            body={latest.bodyEn}
            dir="ltr"
            copyLabel={ar ? "نسخ" : "Copy"}
            copiedLabel={ar ? "تم النسخ" : "Copied"}
          />
          <CopyBlock
            title={T("compose_result_ar")}
            subject={latest.subjectAr}
            body={latest.bodyAr}
            dir="rtl"
            copyLabel={ar ? "نسخ" : "Copy"}
            copiedLabel={ar ? "تم النسخ" : "Copied"}
          />
        </div>
      )}

      <Banner tone="info">
        {ar
          ? "يعمل المولّد محلياً بقوالب رسمية دون الاعتماد على أي خدمة خارجية أو مفتاح واجهة برمجية. ويمكن لاحقاً استبدال محرك التوليد بنموذج لغوي دون تغيير هذه الواجهة."
          : "The generator runs locally from formal templates, with no external service and no API key. An LLM can be swapped in behind it later without changing this interface."}
      </Banner>

      <section>
        <h2 className="mb-3 text-base font-semibold">{T("compose_history")}</h2>
        {drafts.length <= 1 ? (
          <Empty>{ar ? "لا توجد مسودات سابقة." : "No earlier drafts yet."}</Empty>
        ) : (
          <ul className="card divide-y divide-brand-900/8">
            {drafts.slice(1).map((x) => (
              <li key={x.id} className="p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-brand-900">{x.subjectEn}</span>
                  <span className="text-xs text-brand-900/45">
                    {formatDate(locale, x.createdAt, true)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-brand-900/55">{x.transcript}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
