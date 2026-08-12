import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/auth";
import { tr } from "@/lib/i18n";
import { db, verifiedOrgs } from "@/lib/queries";
import { Stat } from "@/components/ui";

export const metadata: Metadata = { title: "About the cooperative" };

export default async function AboutPage() {
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const ar = locale === "ar";

  const pillars = [
    [
      ar ? "التسويق التعاوني" : "Cooperative marketing",
      ar
        ? "يجمع الأعضاء ميزانياتهم في صندوق تسويق مشترك لتمويل الحملات والمعارض والشراء الإعلامي الموحّد، فيحصل العضو الصغير على وصول لم يكن ليحققه منفرداً."
        : "Members pool budget into a shared marketing fund that pays for joint campaigns, exhibitions and consolidated media buying, so a small operator gets reach it could never buy alone.",
    ],
    [
      ar ? "التوسع عبر الحدود" : "Cross-border expansion",
      ar
        ? "تنشر العلامات فرص الامتياز في المنصة، ويطّلع عليها المشغّلون في الأسواق المستهدفة، ويتم التواصل والتفاوض الأول داخل البوابة بالكامل."
        : "Brands publish franchise opportunities in the platform, operators in the target markets review them, and the first contact and negotiation happen entirely inside the portal.",
    ],
    [
      ar ? "الحوكمة والموافقات" : "Governance and approvals",
      ar
        ? "كل قرار — توثيق عضوية، نشر فرصة، اعتماد فعالية — يمر عبر قائمة موافقات موثّقة، ويُسجَّل في سجل لا يقبل التعديل."
        : "Every decision — verifying a member, publishing an opportunity, approving an event — passes through a recorded approvals queue and lands in an append-only log.",
    ],
    [
      ar ? "المعرفة والتمثيل" : "Knowledge and representation",
      ar
        ? "تحتفظ التعاونية بدليل الجمعيات الوطنية للامتياز حول العالم ومركز معلومات للجهات التنظيمية والغرف، وتمثّل أعضاءها أمامها."
        : "The cooperative maintains a directory of national franchise associations worldwide and an information centre of regulators and chambers, and represents its members before them.",
    ],
  ];

  return (
    <>
      <header className="bg-brand-900 text-white">
        <div className="container-x py-16">
          <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            {ar
              ? "تعاونية تسويق يملكها أعضاؤها، ومنصة تشغيلية تديرها بالكامل."
              : "A marketing cooperative owned by its members, and the operating platform that runs it."}
          </h1>
          <p className="mt-5 max-w-2xl text-white/75">{T("tagline")}</p>
        </div>
      </header>

      <div className="container-x -mt-8 grid gap-4 sm:grid-cols-3">
        <Stat value={verifiedOrgs(d).length} label={T("home_stats_members")} />
        <Stat value={d.events.length} label={T("home_stats_events")} />
        <Stat value={d.associations.length} label={T("home_stats_associations")} />
      </div>

      <div className="container-x py-14">
        <div className="grid gap-6 md:grid-cols-2">
          {pillars.map(([title, body]) => (
            <section key={title} className="card start-border border-s-brand-600 p-7">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="prose-body mt-3">{body}</p>
            </section>
          ))}
        </div>

        <section className="card mt-8 p-7">
          <h2 className="text-lg font-semibold">
            {ar ? "لماذا لا نعتمد على البريد الإلكتروني" : "Why not email"}
          </h2>
          <p className="prose-body mt-3 max-w-3xl">
            {ar
              ? "حين تُتخذ الموافقات عبر البريد، يضيع القرار في صناديق الوارد ولا يبقى سجل موحّد يمكن الرجوع إليه. في هذه المنصة، طلب التسجيل في فعالية، وتوثيق العضوية، ونشر الفرصة — كلها تمرّ عبر قائمة موافقات واحدة، ويُسجَّل كل قرار مع صاحبه وتوقيته وملاحظته. البريد الإلكتروني، إن استُخدم لاحقاً، يبقى طبقة إشعار فقط لا سجلاً رسمياً."
              : "When approvals happen over email the decision disappears into inboxes and no single record survives. Here, an event registration, a membership verification and an opportunity publication all pass through one approvals queue, and every decision is recorded with its author, its timestamp and its note. Email, if it is added later, stays a notification layer — never the system of record."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/board" className="btn-ghost btn-sm">
              {T("nav_board")} →
            </Link>
            <Link href="/membership" className="btn-primary btn-sm">
              {T("home_cta_join")}
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
