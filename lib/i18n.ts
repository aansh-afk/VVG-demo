import { Bi, Locale } from "./models";

/**
 * Bilingual dictionary. All Arabic here is authored copy in Modern Standard
 * Arabic as used in Saudi institutional writing — it is not machine output and
 * should be reviewed by the cooperative's own Arabic editor before launch.
 */
const DICT = {
  /* brand + chrome */
  brand: { en: "WASL Global", ar: "وصل جلوبال" },
  brandShort: { en: "WASL Global", ar: "وصل جلوبال" },
  tagline: {
    en: "The marketing cooperative connecting franchisors, franchisees and partners across borders.",
    ar: "التعاونية التسويقية التي تربط مانحي الامتياز والممنوحين والشركاء عبر الحدود.",
  },
  nav_home: { en: "Home", ar: "الرئيسية" },
  nav_about: { en: "About", ar: "عن التعاونية" },
  nav_board: { en: "Board of Directors", ar: "مجلس الإدارة" },
  nav_events: { en: "Events & Activities", ar: "الفعاليات والأنشطة" },
  nav_activity: { en: "Live Activity", ar: "النشاط المباشر" },
  nav_members: { en: "Members", ar: "الأعضاء" },
  nav_opportunities: { en: "Franchise Opportunities", ar: "فرص الامتياز" },
  nav_associations: { en: "Global Associations", ar: "الاتحادات العالمية" },
  nav_info: { en: "Information Centre", ar: "مركز المعلومات" },
  nav_membership: { en: "Membership", ar: "العضوية" },
  nav_contact: { en: "Contact", ar: "تواصل معنا" },
  nav_portal: { en: "Member Portal", ar: "بوابة الأعضاء" },
  nav_signin: { en: "Sign in", ar: "تسجيل الدخول" },
  nav_signup: { en: "Join the cooperative", ar: "انضم إلى التعاونية" },
  nav_signout: { en: "Sign out", ar: "تسجيل الخروج" },

  /* generic */
  search: { en: "Search", ar: "بحث" },
  filter_all: { en: "All", ar: "الكل" },
  view_profile: { en: "View profile", ar: "عرض الملف" },
  view_details: { en: "View details", ar: "عرض التفاصيل" },
  read_more: { en: "Read more", ar: "اقرأ المزيد" },
  back: { en: "Back", ar: "رجوع" },
  save: { en: "Save", ar: "حفظ" },
  submit: { en: "Submit", ar: "إرسال" },
  cancel: { en: "Cancel", ar: "إلغاء" },
  approve: { en: "Approve", ar: "اعتماد" },
  reject: { en: "Reject", ar: "رفض" },
  pending: { en: "Pending", ar: "قيد المراجعة" },
  approved: { en: "Approved", ar: "معتمد" },
  rejected: { en: "Rejected", ar: "مرفوض" },
  verified: { en: "Verified", ar: "موثّق" },
  none_yet: { en: "Nothing here yet.", ar: "لا يوجد شيء هنا بعد." },
  required: { en: "Required", ar: "مطلوب" },
  optional: { en: "Optional", ar: "اختياري" },
  demo_data: { en: "Demo record", ar: "سجل تجريبي" },
  verify_before_publishing: {
    en: "Official public link captured — confirm before publishing externally.",
    ar: "رابط عام رسمي — يُرجى التحقق منه قبل النشر خارجياً.",
  },

  /* home */
  home_hero_kicker: { en: "Franchisee marketing cooperative", ar: "تعاونية تسويق الامتياز التجاري" },
  home_hero_title: {
    en: "One cooperative. Every franchise conversation, in one place.",
    ar: "تعاونية واحدة. كل ما يخص الامتياز التجاري في مكان واحد.",
  },
  home_hero_body: {
    en: "Members run their events, publish cross-border franchise opportunities, connect with chambers and global associations, and take every approval inside the platform — never over email.",
    ar: "ينظّم الأعضاء فعالياتهم، وينشرون فرص الامتياز عبر الحدود، ويتواصلون مع الغرف التجارية والاتحادات العالمية، وتُتخذ جميع الموافقات داخل المنصة — لا عبر البريد الإلكتروني.",
  },
  home_cta_join: { en: "Apply for membership", ar: "تقديم طلب عضوية" },
  home_cta_events: { en: "Browse events", ar: "تصفّح الفعاليات" },
  home_stats_members: { en: "Verified members", ar: "الأعضاء الموثّقون" },
  home_stats_events: { en: "Events & activities", ar: "الفعاليات والأنشطة" },
  home_stats_opportunities: { en: "Live opportunities", ar: "الفرص المتاحة" },
  home_stats_associations: { en: "Associations worldwide", ar: "اتحادات حول العالم" },
  home_upcoming: { en: "Upcoming events & activities", ar: "الفعاليات والأنشطة القادمة" },
  home_live: { en: "Live activity", ar: "النشاط المباشر" },
  home_live_sub: {
    en: "Everything that happens in the cooperative, as it happens.",
    ar: "كل ما يجري داخل التعاونية، لحظة بلحظة.",
  },
  home_opportunities: { en: "Latest franchise opportunities", ar: "أحدث فرص الامتياز" },
  home_governance: { en: "Governance", ar: "الحوكمة" },
  home_governance_sub: {
    en: "Meet the board leading the cooperative. Every profile is public.",
    ar: "تعرّف على مجلس الإدارة الذي يقود التعاونية. جميع الملفات متاحة للعموم.",
  },

  /* board */
  board_title: { en: "Board of Directors", ar: "مجلس الإدارة" },
  board_sub: {
    en: "Select any member to open their full public profile.",
    ar: "اختر أي عضو لعرض ملفه العام الكامل.",
  },
  board_tier1: { en: "Chairmanship", ar: "رئاسة المجلس" },
  board_tier2: { en: "Executive officers", ar: "القيادات التنفيذية" },
  board_tier3: { en: "Board members", ar: "أعضاء مجلس الإدارة" },
  board_tier4: { en: "Standing committees", ar: "اللجان الدائمة" },
  board_mandate: { en: "Mandate", ar: "المهام" },
  board_committees: { en: "Committee memberships", ar: "عضوية اللجان" },
  board_contact: { en: "Public contact", ar: "بيانات التواصل العامة" },
  board_biography: { en: "Biography", ar: "السيرة الذاتية" },

  /* events */
  events_title: { en: "Events & Activities", ar: "الفعاليات والأنشطة" },
  events_sub: {
    en: "Exhibitions, trade missions, workshops and member forums run by the cooperative.",
    ar: "معارض وبعثات تجارية وورش عمل وملتقيات أعضاء تنظّمها التعاونية.",
  },
  events_upcoming: { en: "Upcoming", ar: "القادمة" },
  events_live_now: { en: "Happening now", ar: "جارية الآن" },
  events_past: { en: "Past", ar: "السابقة" },
  events_register: { en: "Register", ar: "التسجيل" },
  events_registered: { en: "You are registered", ar: "تم تسجيلك" },
  events_seats: { en: "Seats", ar: "المقاعد" },
  events_seats_left: { en: "seats remaining", ar: "مقعد متبقٍ" },
  events_agenda: { en: "Agenda", ar: "جدول الأعمال" },
  events_venue: { en: "Venue", ar: "المكان" },
  events_free: { en: "Free", ar: "مجاناً" },
  events_format_in_person: { en: "In person", ar: "حضورياً" },
  events_format_virtual: { en: "Virtual", ar: "عن بُعد" },
  events_format_hybrid: { en: "Hybrid", ar: "حضورياً وعن بُعد" },
  events_register_note: {
    en: "Your registration goes to the organiser's approval queue inside the portal.",
    ar: "يُحال طلب تسجيلك إلى قائمة موافقات المنظّم داخل البوابة.",
  },

  /* activity */
  activity_title: { en: "Live Activity", ar: "النشاط المباشر" },
  activity_sub: {
    en: "A continuous, append-only record of everything the cooperative does.",
    ar: "سجل مستمر لا يقبل التعديل يوثّق كل ما تقوم به التعاونية.",
  },

  /* members */
  members_title: { en: "Member Directory", ar: "دليل الأعضاء" },
  members_sub: {
    en: "Verified franchisors, franchisees, suppliers and partner institutions.",
    ar: "مانحو الامتياز والممنوحون والموردون والجهات الشريكة الموثّقون.",
  },
  member_brands: { en: "Brands", ar: "العلامات التجارية" },
  member_outlets: { en: "Outlets", ar: "الفروع" },
  member_since: { en: "Member since", ar: "عضو منذ" },
  member_sector: { en: "Sector", ar: "القطاع" },

  /* opportunities */
  opp_title: { en: "Franchise Opportunities", ar: "فرص الامتياز التجاري" },
  opp_sub: {
    en: "Cross-border franchise offers published by verified members.",
    ar: "عروض امتياز عابرة للحدود ينشرها أعضاء موثّقون.",
  },
  opp_investment: { en: "Investment", ar: "الاستثمار" },
  opp_targets: { en: "Target markets", ar: "الأسواق المستهدفة" },
  opp_model: { en: "Model", ar: "نموذج الامتياز" },
  opp_royalty: { en: "Royalty", ar: "الإتاوة" },
  opp_requirements: { en: "Franchisee requirements", ar: "متطلبات الممنوح" },
  opp_support: { en: "Support provided", ar: "الدعم المقدَّم" },
  opp_express: { en: "Express interest", ar: "تسجيل الاهتمام" },
  opp_express_note: {
    en: "Your enquiry is delivered inside the portal to the brand's member account.",
    ar: "يُسلَّم استفسارك داخل البوابة إلى حساب العضو صاحب العلامة.",
  },

  /* associations */
  assoc_title: { en: "Global Franchise Associations", ar: "الاتحادات العالمية للامتياز التجاري" },
  assoc_sub: {
    en: "The World Franchise Council, its regional federations and national member associations.",
    ar: "المجلس العالمي للامتياز التجاري واتحاداته الإقليمية والجمعيات الوطنية الأعضاء.",
  },
  assoc_officers: { en: "Officers", ar: "المسؤولون" },
  assoc_open_map: { en: "Open in Maps", ar: "فتح في الخرائط" },
  assoc_visit: { en: "Visit website", ar: "زيارة الموقع" },

  /* info centre */
  info_title: { en: "Information Centre", ar: "مركز المعلومات" },
  info_sub: {
    en: "Regulators, chambers and support bodies — with the right contact point for each.",
    ar: "الجهات التنظيمية والغرف التجارية وجهات الدعم — مع جهة الاتصال المناسبة لكل منها.",
  },
  info_kind_government: { en: "Government & regulators", ar: "الجهات الحكومية والتنظيمية" },
  info_kind_chamber: { en: "Chambers of commerce", ar: "الغرف التجارية" },
  info_kind_association_partner: { en: "Partner associations", ar: "الجمعيات الشريكة" },
  info_kind_support: { en: "Support & enablement", ar: "جهات الدعم والتمكين" },
  info_contact_person: { en: "Contact point", ar: "جهة الاتصال" },

  /* membership */
  plans_title: { en: "Membership", ar: "العضوية" },
  plans_sub: {
    en: "Choose the tier that matches your role in the franchise ecosystem.",
    ar: "اختر الفئة التي تناسب دورك في منظومة الامتياز التجاري.",
  },
  plans_per_year: { en: "SAR / year", ar: "ريال سعودي / سنوياً" },
  plans_assumption: {
    en: "Indicative pricing — pending board ratification.",
    ar: "أسعار استرشادية — بانتظار اعتماد مجلس الإدارة.",
  },

  /* auth */
  auth_signin_title: { en: "Sign in to the member portal", ar: "تسجيل الدخول إلى بوابة الأعضاء" },
  auth_signup_title: { en: "Join the cooperative", ar: "الانضمام إلى التعاونية" },
  auth_email: { en: "Email address", ar: "البريد الإلكتروني" },
  auth_password: { en: "Password", ar: "كلمة المرور" },
  auth_fullname: { en: "Full name", ar: "الاسم الكامل" },
  auth_jobtitle: { en: "Job title", ar: "المسمى الوظيفي" },
  auth_phone: { en: "Phone", ar: "الهاتف" },
  auth_org: { en: "Organisation name", ar: "اسم المنشأة" },
  auth_org_ar: { en: "Organisation name (Arabic)", ar: "اسم المنشأة بالعربية" },
  auth_country: { en: "Country", ar: "الدولة" },
  auth_city: { en: "City", ar: "المدينة" },
  auth_type: { en: "Member type", ar: "نوع العضوية" },
  auth_sector: { en: "Sector", ar: "القطاع" },
  auth_about: { en: "About your organisation", ar: "نبذة عن منشأتك" },
  auth_have_account: { en: "Already a member?", ar: "لديك حساب بالفعل؟" },
  auth_no_account: { en: "Not a member yet?", ar: "لست عضواً بعد؟" },
  auth_pending_note: {
    en: "Your organisation goes to the super admin's verification queue. You can sign in immediately; publishing unlocks once you are verified.",
    ar: "تُحال منشأتك إلى قائمة التوثيق لدى المشرف العام. يمكنك تسجيل الدخول فوراً، ويُفتح النشر بعد توثيق حسابك.",
  },

  /* portal */
  portal_title: { en: "Member Portal", ar: "بوابة الأعضاء" },
  portal_overview: { en: "Overview", ar: "نظرة عامة" },
  portal_org: { en: "My organisation", ar: "منشأتي" },
  portal_my_events: { en: "My events", ar: "فعالياتي" },
  portal_my_opps: { en: "My opportunities", ar: "فرصي" },
  portal_messages: { en: "Messages", ar: "الرسائل" },
  portal_compose: { en: "AI message composer", ar: "منشئ الرسائل الذكي" },
  portal_approvals: { en: "Approvals", ar: "الموافقات" },
  portal_admin: { en: "Administration", ar: "الإدارة" },
  portal_admin_members: { en: "Members & verification", ar: "الأعضاء والتوثيق" },
  portal_admin_events: { en: "Event management", ar: "إدارة الفعاليات" },
  portal_admin_content: { en: "Board & content", ar: "المجلس والمحتوى" },
  portal_admin_users: { en: "Users & roles", ar: "المستخدمون والصلاحيات" },
  portal_admin_audit: { en: "Audit trail", ar: "سجل التدقيق" },
  portal_admin_system: { en: "System", ar: "النظام" },

  /* composer */
  compose_title: { en: "AI message & email composer", ar: "منشئ الرسائل والبريد بالذكاء الاصطناعي" },
  compose_sub: {
    en: "Speak or type in Arabic or English. You get a professional draft in both languages.",
    ar: "تحدّث أو اكتب بالعربية أو الإنجليزية، لتحصل على مسودة احترافية باللغتين.",
  },
  compose_purpose: { en: "Purpose", ar: "الغرض" },
  compose_recipient: { en: "Recipient name", ar: "اسم المرسل إليه" },
  compose_input: { en: "What do you want to say?", ar: "ما الذي تودّ قوله؟" },
  compose_generate: { en: "Generate draft", ar: "إنشاء المسودة" },
  compose_result_en: { en: "English draft", ar: "المسودة الإنجليزية" },
  compose_result_ar: { en: "Arabic draft", ar: "المسودة العربية" },
  compose_history: { en: "Recent drafts", ar: "المسودات الأخيرة" },
  voice_hint: { en: "Tap the microphone to dictate", ar: "اضغط على الميكروفون للإملاء الصوتي" },
} as const;

export type Key = keyof typeof DICT;

export function t(locale: Locale, key: Key): string {
  return DICT[key][locale];
}

/** Reads a bilingual field, falling back to whichever side has content. */
export function bi(locale: Locale, value: Bi | undefined | null): string {
  if (!value) return "";
  return (locale === "ar" ? value.ar : value.en) || value.en || value.ar || "";
}

/** Curried translator so pages can do `const T = tr(locale)` then `T("nav_home")`. */
export function tr(locale: Locale) {
  return (key: Key) => t(locale, key);
}

export function dir(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

/** Deterministic formatting — identical on the server and the client. */
export function formatDate(locale: Locale, ts: number, withTime = false): string {
  const d = new Date(ts);
  const day = d.getUTCDate();
  const month = d.getUTCMonth();
  const year = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  const en = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const base =
    locale === "ar" ? `${day} ${AR_MONTHS[month]} ${year}` : `${day} ${en[month]} ${year}`;
  return withTime ? `${base} · ${hh}:${mm}` : base;
}

export function formatMoney(locale: Locale, amount: number): string {
  const n = amount.toLocaleString("en-US");
  return locale === "ar" ? `${n} ر.س` : `SAR ${n}`;
}

/** "3 hours ago" / "منذ ٣ ساعات" — computed from a caller-supplied `now`. */
export function timeAgo(locale: Locale, ts: number, now: number): string {
  const secs = Math.floor((now - ts) / 1000);
  if (secs < 0) return locale === "ar" ? "قريباً" : "soon";
  // [seconds in one unit, singular EN, plural EN, AR]
  const units: [number, string, string, string][] = [
    [1, "second", "seconds", "ثانية"],
    [60, "minute", "minutes", "دقيقة"],
    [3600, "hour", "hours", "ساعة"],
    [86400, "day", "days", "يوم"],
    [2592000, "month", "months", "شهر"],
    [31536000, "year", "years", "سنة"],
  ];
  let chosen = units[0];
  for (const u of units) if (secs >= u[0]) chosen = u;
  const value = Math.max(1, Math.floor(secs / chosen[0]));
  if (locale === "ar") return `قبل ${value} ${chosen[3]}`;
  return `${value} ${value === 1 ? chosen[1] : chosen[2]} ago`;
}
