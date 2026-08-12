import { Locale } from "./models";

/**
 * Bilingual message/email generator.
 *
 * Deterministic and template-driven on purpose: it runs with no API key, no
 * external service and no per-message cost, and it produces the formal register
 * Saudi institutional correspondence expects. `generateDraft` is the single
 * seam — swapping in an LLM later means replacing this function body only, with
 * no change to the composer UI or the stored draft shape.
 */

export interface DraftInput {
  purpose: string;
  transcript: string;
  senderName: string;
  senderTitle?: string;
  recipientName?: string;
  organisation?: string;
}

export interface Draft {
  subjectEn: string;
  bodyEn: string;
  subjectAr: string;
  bodyAr: string;
  detectedLanguage: Locale;
}

interface Purpose {
  labelEn: string;
  labelAr: string;
  subjectEn: string;
  subjectAr: string;
  openEn: string;
  openAr: string;
  closeEn: string;
  closeAr: string;
}

export const PURPOSES: Record<string, Purpose> = {
  inquiry: {
    labelEn: "General enquiry",
    labelAr: "استفسار عام",
    subjectEn: "Enquiry",
    subjectAr: "استفسار",
    openEn:
      "I hope this message finds you well. I am writing on behalf of the VVG Franchise Cooperative to enquire about the following matter:",
    openAr:
      "أرجو أن تصلكم رسالتي وأنتم بأتم الصحة والعافية. أكتب إليكم نيابةً عن تعاونية في في جي للامتياز التجاري للاستفسار عن الموضوع التالي:",
    closeEn: "We would be grateful for your response at your earliest convenience.",
    closeAr: "ونكون شاكرين لكم تفضلكم بالرد في أقرب وقت ممكن.",
  },
  invitation: {
    labelEn: "Event invitation",
    labelAr: "دعوة لفعالية",
    subjectEn: "Invitation",
    subjectAr: "دعوة",
    openEn:
      "On behalf of the VVG Franchise Cooperative, it is our pleasure to extend the following invitation to you:",
    openAr:
      "يسرّنا، نيابةً عن تعاونية في في جي للامتياز التجاري، أن نوجّه إليكم الدعوة التالية:",
    closeEn:
      "Kindly confirm your attendance through the member portal so that we may complete the necessary arrangements.",
    closeAr:
      "نرجو التكرم بتأكيد حضوركم عبر بوابة الأعضاء ليتسنى لنا استكمال الترتيبات اللازمة.",
  },
  partnership: {
    labelEn: "Partnership proposal",
    labelAr: "مقترح شراكة",
    subjectEn: "Partnership proposal",
    subjectAr: "مقترح شراكة",
    openEn:
      "We are pleased to present the following partnership proposal for your kind consideration:",
    openAr: "يسرّنا أن نعرض على كريم اطلاعكم مقترح الشراكة التالي:",
    closeEn:
      "We would welcome the opportunity to discuss this proposal with you at a time that suits you.",
    closeAr: "ويسعدنا مناقشة هذا المقترح معكم في الوقت الذي يناسبكم.",
  },
  franchise_offer: {
    labelEn: "Franchise offer",
    labelAr: "عرض امتياز تجاري",
    subjectEn: "Franchise opportunity",
    subjectAr: "فرصة امتياز تجاري",
    openEn:
      "Further to your interest in expanding through franchising, we are pleased to share the following opportunity:",
    openAr:
      "إلحاقاً باهتمامكم بالتوسّع عبر الامتياز التجاري، يسرّنا أن نعرض عليكم الفرصة التالية:",
    closeEn:
      "The complete franchise disclosure pack is available to verified members in the portal's data room.",
    closeAr:
      "حزمة الإفصاح الكاملة للامتياز متاحة للأعضاء الموثّقين في غرفة البيانات داخل البوابة.",
  },
  followup: {
    labelEn: "Follow-up",
    labelAr: "متابعة",
    subjectEn: "Follow-up",
    subjectAr: "متابعة",
    openEn: "Further to our previous correspondence, I would like to follow up on the following:",
    openAr: "إلحاقاً بمراسلاتنا السابقة، أودّ متابعة الموضوع التالي:",
    closeEn: "Please let us know if any further information would be helpful.",
    closeAr: "ونرجو إفادتنا في حال احتجتم إلى أي معلومات إضافية.",
  },
  official_request: {
    labelEn: "Official request",
    labelAr: "طلب رسمي",
    subjectEn: "Official request",
    subjectAr: "طلب رسمي",
    openEn:
      "With reference to the cooperative's activities, we should like to submit the following request for your consideration:",
    openAr:
      "بالإشارة إلى أنشطة التعاونية، نودّ رفع الطلب التالي لكريم نظركم واعتماده:",
    closeEn: "We remain at your disposal for any clarification you may require.",
    closeAr: "ونبقى على استعداد لتقديم أي إيضاح تحتاجونه.",
  },
  thanks: {
    labelEn: "Letter of thanks",
    labelAr: "خطاب شكر",
    subjectEn: "With our thanks",
    subjectAr: "شكر وتقدير",
    openEn: "On behalf of the cooperative and its members, we wish to record our sincere thanks:",
    openAr: "نيابةً عن التعاونية وأعضائها، نودّ أن نسجّل خالص شكرنا وتقديرنا:",
    closeEn: "We look forward to continuing our cooperation.",
    closeAr: "ونتطلع إلى استمرار تعاوننا المثمر.",
  },
};

export function detectArabic(text: string): boolean {
  const arabic = (text.match(/[؀-ۿ]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  return arabic > latin;
}

/** Trims dictation filler and normalises spacing so drafts read cleanly. */
function tidy(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/\b(um+|uh+|erm+|you know|like,)\b/gi, "")
    .replace(/\s+([,.!؟،])/g, "$1")
    .trim();
}

/** Splits dictation into sentences so long transcripts become readable paragraphs. */
function paragraphs(text: string): string {
  const sentences = text
    .split(/(?<=[.!?؟])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length <= 2) return text;
  const out: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    out.push(sentences.slice(i, i + 2).join(" "));
  }
  return out.join("\n\n");
}

function subjectFrom(base: string, content: string): string {
  const words = content.split(/\s+/).filter(Boolean);
  if (words.length === 0) return base;
  const head = words.slice(0, 9).join(" ");
  return `${base}: ${head}${words.length > 9 ? "…" : ""}`;
}

export function generateDraft(input: DraftInput): Draft {
  const purpose = PURPOSES[input.purpose] ?? PURPOSES.inquiry;
  const content = paragraphs(tidy(input.transcript));
  const detectedLanguage: Locale = detectArabic(input.transcript) ? "ar" : "en";

  const org = input.organisation?.trim() || "VVG Franchise Cooperative";
  const orgAr = input.organisation?.trim() || "تعاونية في في جي للامتياز التجاري";
  const signatureEn = [input.senderName, input.senderTitle, org].filter(Boolean).join("\n");
  const signatureAr = [input.senderName, input.senderTitle, orgAr].filter(Boolean).join("\n");

  const toEn = input.recipientName?.trim() || "Sir/Madam";
  const toAr = input.recipientName?.trim() || "سعادة المسؤول المحترم";

  const bodyEn = `Dear ${toEn},

${purpose.openEn}

${content}

${purpose.closeEn} Should you wish to reply, please do so through the VVG member portal so that the exchange stays on record.

Kind regards,
${signatureEn}`;

  const bodyAr = `${toAr}،

السلام عليكم ورحمة الله وبركاته، وبعد:

${purpose.openAr}

${content}

${purpose.closeAr} وفي حال رغبتكم بالرد، نرجو إتمامه عبر بوابة أعضاء التعاونية ليبقى التواصل موثّقاً في السجل.

وتفضلوا بقبول فائق الاحترام والتقدير،
${signatureAr}`;

  return {
    subjectEn: subjectFrom(purpose.subjectEn, tidy(input.transcript)),
    subjectAr: subjectFrom(purpose.subjectAr, tidy(input.transcript)),
    bodyEn,
    bodyAr,
    detectedLanguage,
  };
}
