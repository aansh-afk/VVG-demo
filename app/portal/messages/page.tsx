import { getLocale, pageUser } from "@/lib/auth";
import { formatDate, tr } from "@/lib/i18n";
import { db } from "@/lib/queries";
import MessageForm from "@/components/MessageForm";
import { Avatar, Banner, Empty } from "@/components/ui";

/**
 * The cooperative-wide channel. This is the system of record for member
 * correspondence — deliberately in-platform rather than over email.
 */
export default async function MessagesPage() {
  const user = await pageUser();
  const locale = await getLocale();
  const T = tr(locale);
  const d = await db();
  const ar = locale === "ar";

  const thread = d.threads.find((t) => t.kind === "general");
  const messages = thread
    ? d.messages.filter((m) => m.threadId === thread.id).sort((a, b) => a.createdAt - b.createdAt)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{T("portal_messages")}</h1>
        <p className="prose-body mt-1 text-sm">
          {ar
            ? "القناة العامة لأعضاء التعاونية. كل رسالة تُحفظ في سجل المنصة."
            : "The cooperative-wide channel. Every message is kept in the platform's record."}
        </p>
      </div>

      <Banner tone="info">
        {ar
          ? "لا تُرسل الموافقات ولا القرارات عبر البريد الإلكتروني. استخدم هذه القناة للنقاش، وقائمة الموافقات للقرارات."
          : "Approvals and decisions never travel by email. Use this channel for discussion and the approvals queue for decisions."}
      </Banner>

      <section className="card p-6">
        {messages.length === 0 ? (
          <Empty>{ar ? "لا توجد رسائل بعد." : "No messages yet."}</Empty>
        ) : (
          <ol className="space-y-5">
            {messages.map((m) => {
              const mine = m.userId === user.id;
              return (
                <li key={m.id} className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}>
                  <Avatar
                    initials={m.userName.split(/\s+/).slice(0, 2).map((w) => w[0]).join("")}
                    size="sm"
                    tone={mine ? "from-brand-600 to-brand-800" : "from-gold-500 to-brand-700"}
                  />
                  <div className={`max-w-[80%] ${mine ? "text-end" : ""}`}>
                    <div className="flex items-baseline gap-2 text-xs text-brand-900/50">
                      <span className="font-semibold text-brand-900">{m.userName}</span>
                      <span>{formatDate(locale, m.createdAt, true)}</span>
                    </div>
                    <div
                      className={`bidi-auto mt-1.5 inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        mine ? "bg-brand-700 text-white" : "bg-brand-50 text-brand-900/85"
                      }`}
                    >
                      {m.body}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-6 border-t border-brand-900/8 pt-5">
          <MessageForm
            locale={locale}
            labels={{
              field: ar ? "رسالة جديدة" : "New message",
              submit: ar ? "إرسال" : "Send",
            }}
          />
        </div>
      </section>
    </div>
  );
}
