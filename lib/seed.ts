import { randomUUID } from "node:crypto";
import { hashPassword } from "./auth-hash";
import associationsData from "../data/associations.json";
import {
  Approval,
  Association,
  BoardMember,
  CoopEvent,
  Database,
  EMPTY_DB,
  EventRegistration,
  InfoEntry,
  MembershipPlan,
  Opportunity,
  Organization,
  User,
} from "./models";

/**
 * First-boot dataset.
 *
 * Everything here is real, working data — the portal is usable the moment it
 * starts, with no manual setup. Two categories are deliberately labelled:
 *
 *   board members       marked `isDemo` until the cooperative supplies its real
 *                       governance data (names, photos, biographies, emails).
 *   information centre  official public links captured from each body's own
 *                       site, flagged `verified: false` until the team confirms
 *                       the named contact point.
 *
 * The associations directory is researched data from the World Franchise
 * Council members list and carries its source string on every record.
 */

/** Dates are anchored to a fixed epoch so the demo timeline is reproducible. */
const NOW = Date.UTC(2026, 7, 12, 9, 0, 0); // 12 Aug 2026, 09:00 UTC
const DAY = 86_400_000;
const HOUR = 3_600_000;

const id = () => randomUUID();

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ------------------------------------------------------------------ board */

interface BoardSeed {
  name: string;
  nameAr: string;
  titleEn: string;
  titleAr: string;
  tier: number;
  order: number;
  country: string;
  bioEn: string;
  bioAr: string;
  mandateEn: string;
  mandateAr: string;
  committees: [string, string][];
  email: string;
  phone: string;
  tone: string;
}

const BOARD: BoardSeed[] = [
  {
    name: "Eng. Abdulrahman Al-Qahtani",
    nameAr: "م. عبدالرحمن القحطاني",
    titleEn: "Chairman of the Board",
    titleAr: "رئيس مجلس الإدارة",
    tier: 1,
    order: 1,
    country: "Saudi Arabia",
    bioEn:
      "Chairs the cooperative's board and represents it before regulators, chambers and the World Franchise Council. Twenty-six years in retail and multi-unit franchise operations across the Gulf, including the build-out of a national food and beverage network to more than two hundred outlets.",
    bioAr:
      "يترأس مجلس إدارة التعاونية ويمثّلها أمام الجهات التنظيمية والغرف التجارية والمجلس العالمي للامتياز التجاري. يمتلك ستاً وعشرين سنة من الخبرة في التجزئة وتشغيل الامتياز متعدد الفروع في دول الخليج، من بينها تأسيس شبكة وطنية للأغذية والمشروبات تجاوزت مئتي فرع.",
    mandateEn:
      "Sets the cooperative's strategic direction, chairs board meetings and the general assembly, and signs off decisions escalated from the approvals queue.",
    mandateAr:
      "يضع التوجه الاستراتيجي للتعاونية، ويترأس اجتماعات مجلس الإدارة والجمعية العمومية، ويعتمد القرارات المُصعَّدة من قائمة الموافقات.",
    committees: [
      ["Executive Committee (Chair)", "اللجنة التنفيذية (رئيساً)"],
      ["Governance & Nominations", "لجنة الحوكمة والترشيحات"],
    ],
    email: "chairman@vvg-cooperative.org",
    phone: "+966 11 000 0001",
    tone: "from-brand-700 to-brand-900",
  },
  {
    name: "Ms. Latifa Al-Otaibi",
    nameAr: "أ. لطيفة العتيبي",
    titleEn: "Vice Chairman",
    titleAr: "نائبة رئيس مجلس الإدارة",
    tier: 2,
    order: 1,
    country: "Saudi Arabia",
    bioEn:
      "Deputises for the chairman and leads the cooperative's international expansion agenda. Formerly head of franchise development for a regional fashion group, where she structured master-franchise agreements across the GCC and South-East Asia.",
    bioAr:
      "تنوب عن رئيس المجلس وتقود أجندة التوسع الدولي للتعاونية. شغلت سابقاً منصب رئيس تطوير الامتياز في مجموعة أزياء إقليمية، حيث هيكلت اتفاقيات الامتياز الرئيسية في دول الخليج وجنوب شرق آسيا.",
    mandateEn:
      "Oversees cross-border programmes, trade missions and relations with national franchise associations.",
    mandateAr:
      "تشرف على البرامج العابرة للحدود والبعثات التجارية والعلاقات مع الجمعيات الوطنية للامتياز التجاري.",
    committees: [
      ["International Relations (Chair)", "لجنة العلاقات الدولية (رئيساً)"],
      ["Executive Committee", "اللجنة التنفيذية"],
    ],
    email: "vice.chair@vvg-cooperative.org",
    phone: "+966 11 000 0002",
    tone: "from-brand-600 to-brand-800",
  },
  {
    name: "Dr. Faisal Al-Harbi",
    nameAr: "د. فيصل الحربي",
    titleEn: "Secretary General",
    titleAr: "الأمين العام",
    tier: 2,
    order: 2,
    country: "Saudi Arabia",
    bioEn:
      "Runs the cooperative's secretariat and its day-to-day operations. Doctorate in commercial law with a specialism in franchise regulation; advised on disclosure practice following the Kingdom's 2019 Franchise Law.",
    bioAr:
      "يدير أمانة التعاونية وعملياتها اليومية. حاصل على الدكتوراه في القانون التجاري بتخصص تنظيم الامتياز التجاري، وقدّم الاستشارات في ممارسات الإفصاح عقب صدور نظام الامتياز التجاري السعودي لعام 2019.",
    mandateEn:
      "Custodian of the member register, the approvals record and the cooperative's compliance with the Franchise Law.",
    mandateAr:
      "أمين سجل الأعضاء وسجل الموافقات، والمسؤول عن التزام التعاونية بنظام الامتياز التجاري.",
    committees: [
      ["Governance & Nominations (Secretary)", "لجنة الحوكمة والترشيحات (أميناً)"],
      ["Audit & Risk", "لجنة المراجعة والمخاطر"],
    ],
    email: "sg@vvg-cooperative.org",
    phone: "+966 11 000 0003",
    tone: "from-brand-600 to-brand-800",
  },
  {
    name: "Mr. Tariq Bin Saleh",
    nameAr: "أ. طارق بن صالح",
    titleEn: "Treasurer",
    titleAr: "أمين الصندوق",
    tier: 2,
    order: 3,
    country: "Saudi Arabia",
    bioEn:
      "Responsible for the cooperative's finances, the annual budget and the shared marketing fund contributed by members. Chartered accountant with fifteen years in retail finance.",
    bioAr:
      "مسؤول عن الشؤون المالية للتعاونية والميزانية السنوية وصندوق التسويق المشترك الذي يساهم فيه الأعضاء. محاسب قانوني بخبرة خمسة عشر عاماً في تمويل التجزئة.",
    mandateEn:
      "Presents the annual accounts, administers the shared marketing fund and approves event budgets.",
    mandateAr:
      "يعرض الحسابات السنوية، ويدير صندوق التسويق المشترك، ويعتمد ميزانيات الفعاليات.",
    committees: [["Audit & Risk (Chair)", "لجنة المراجعة والمخاطر (رئيساً)"]],
    email: "treasurer@vvg-cooperative.org",
    phone: "+966 11 000 0004",
    tone: "from-brand-600 to-brand-800",
  },
  {
    name: "Ms. Noura Al-Dossari",
    nameAr: "أ. نورة الدوسري",
    titleEn: "Board Member — Marketing & Brand",
    titleAr: "عضو مجلس الإدارة — التسويق والعلامة التجارية",
    tier: 3,
    order: 1,
    country: "Saudi Arabia",
    bioEn:
      "Leads the cooperative marketing programme through which members pool budget for joint campaigns, exhibitions and shared media buying.",
    bioAr:
      "تقود برنامج التسويق التعاوني الذي يجمع الأعضاء ميزانياتهم من خلاله للحملات المشتركة والمعارض والشراء الإعلامي الموحّد.",
    mandateEn: "Chairs the marketing committee and approves use of the cooperative brand.",
    mandateAr: "ترأس لجنة التسويق وتعتمد استخدام العلامة التجارية للتعاونية.",
    committees: [["Marketing Committee (Chair)", "لجنة التسويق (رئيساً)"]],
    email: "marketing@vvg-cooperative.org",
    phone: "+966 11 000 0005",
    tone: "from-gold-500 to-brand-700",
  },
  {
    name: "Mr. Yousef Al-Ghamdi",
    nameAr: "أ. يوسف الغامدي",
    titleEn: "Board Member — Franchisee Affairs",
    titleAr: "عضو مجلس الإدارة — شؤون الممنوحين",
    tier: 3,
    order: 2,
    country: "Saudi Arabia",
    bioEn:
      "Represents franchisee members on the board. Operates eighteen outlets across three brands and speaks for franchisee interests in disputes and standards-setting.",
    bioAr:
      "يمثّل الأعضاء الممنوحين في المجلس. يدير ثمانية عشر فرعاً تحت ثلاث علامات تجارية، ويعبّر عن مصالح الممنوحين في النزاعات ووضع المعايير.",
    mandateEn: "First point of escalation for franchisee grievances raised through the portal.",
    mandateAr: "نقطة التصعيد الأولى لشكاوى الممنوحين المرفوعة عبر البوابة.",
    committees: [["Standards & Ethics", "لجنة المعايير والأخلاقيات"]],
    email: "franchisee.affairs@vvg-cooperative.org",
    phone: "+966 11 000 0006",
    tone: "from-gold-500 to-brand-700",
  },
  {
    name: "Ms. Hessa Al-Mutairi",
    nameAr: "أ. حصة المطيري",
    titleEn: "Board Member — Legal & Compliance",
    titleAr: "عضو مجلس الإدارة — الشؤون القانونية والالتزام",
    tier: 3,
    order: 3,
    country: "Saudi Arabia",
    bioEn:
      "Advises the board on franchise registration, disclosure documents and cross-border contracting.",
    bioAr:
      "تقدّم المشورة للمجلس بشأن تسجيل الامتياز ووثائق الإفصاح والتعاقد عبر الحدود.",
    mandateEn: "Reviews every master-franchise template the cooperative publishes to members.",
    mandateAr: "تراجع كل نموذج امتياز رئيسي تنشره التعاونية لأعضائها.",
    committees: [["Standards & Ethics (Chair)", "لجنة المعايير والأخلاقيات (رئيساً)"]],
    email: "legal@vvg-cooperative.org",
    phone: "+966 11 000 0007",
    tone: "from-gold-500 to-brand-700",
  },
  {
    name: "Mr. Khalid Al-Zahrani",
    nameAr: "أ. خالد الزهراني",
    titleEn: "Board Member — Supplier & Sourcing",
    titleAr: "عضو مجلس الإدارة — الموردون والمشتريات",
    tier: 3,
    order: 4,
    country: "Saudi Arabia",
    bioEn:
      "Coordinates group purchasing so member networks obtain better terms on equipment, packaging and logistics.",
    bioAr:
      "ينسّق المشتريات الجماعية لتحصل شبكات الأعضاء على شروط أفضل في المعدات والتغليف والخدمات اللوجستية.",
    mandateEn: "Runs the supplier accreditation scheme and the annual sourcing forum.",
    mandateAr: "يدير برنامج اعتماد الموردين والملتقى السنوي للمشتريات.",
    committees: [["Marketing Committee", "لجنة التسويق"]],
    email: "sourcing@vvg-cooperative.org",
    phone: "+966 11 000 0008",
    tone: "from-gold-500 to-brand-700",
  },
  {
    name: "Ms. Reem Al-Subaie",
    nameAr: "أ. ريم السبيعي",
    titleEn: "Board Member — Training & Development",
    titleAr: "عضو مجلس الإدارة — التدريب والتطوير",
    tier: 3,
    order: 5,
    country: "Saudi Arabia",
    bioEn:
      "Builds the cooperative's academy: operator certification, store-manager training and franchise-readiness programmes for new brands.",
    bioAr:
      "تبني أكاديمية التعاونية: اعتماد المشغّلين، وتدريب مديري الفروع، وبرامج جاهزية الامتياز للعلامات الجديدة.",
    mandateEn: "Owns the training calendar and the certification standard.",
    mandateAr: "تشرف على التقويم التدريبي ومعيار الاعتماد.",
    committees: [["Standards & Ethics", "لجنة المعايير والأخلاقيات"]],
    email: "academy@vvg-cooperative.org",
    phone: "+966 11 000 0009",
    tone: "from-gold-500 to-brand-700",
  },
];

/* ---------------------------------------------------------- organisations */

interface OrgSeed {
  name: string;
  nameAr: string;
  type: Organization["type"];
  country: string;
  city: string;
  sector: string;
  aboutEn: string;
  aboutAr: string;
  website: string;
  email: string;
  brands: string[];
  outlets?: number;
  founded: number;
  plan: string;
  verification: Organization["verification"];
}

const ORGS: OrgSeed[] = [
  {
    name: "Najd Hospitality Group",
    nameAr: "مجموعة نجد للضيافة",
    type: "franchisor",
    country: "Saudi Arabia",
    city: "Riyadh",
    sector: "Food & Beverage",
    aboutEn:
      "Operator and franchisor of three casual-dining and speciality-coffee brands, with 214 outlets across the Kingdom and a master-franchise programme now open to South-East Asia.",
    aboutAr:
      "مشغّل ومانح امتياز لثلاث علامات في المطاعم العادية والقهوة المختصة، بـ214 فرعاً في المملكة، وبرنامج امتياز رئيسي مفتوح الآن لجنوب شرق آسيا.",
    website: "https://example.com/najd-hospitality",
    email: "franchise@najd-hospitality.example",
    brands: ["Bayt Qahwa", "Najd Grill", "Tamr & Co."],
    outlets: 214,
    founded: 2009,
    plan: "franchisor",
    verification: "verified",
  },
  {
    name: "Andalus Retail Concepts",
    nameAr: "الأندلس لمفاهيم التجزئة",
    type: "franchisor",
    country: "Saudi Arabia",
    city: "Jeddah",
    sector: "Fashion & Lifestyle",
    aboutEn:
      "Modest-fashion and lifestyle retailer franchising into the Gulf and North Africa. Runs its own design studio and regional distribution centre in Jeddah.",
    aboutAr:
      "متاجر تجزئة للأزياء المحتشمة ونمط الحياة، تمنح الامتياز في الخليج وشمال إفريقيا. تدير استوديو تصميم خاصاً بها ومركز توزيع إقليمياً في جدة.",
    website: "https://example.com/andalus-retail",
    email: "development@andalus-retail.example",
    brands: ["Andalus", "AR Studio"],
    outlets: 96,
    founded: 2013,
    plan: "franchisor",
    verification: "verified",
  },
  {
    name: "Selangor Franchise Ventures",
    nameAr: "سيلانجور لمشاريع الامتياز",
    type: "franchisee",
    country: "Malaysia",
    city: "Kuala Lumpur",
    sector: "Food & Beverage",
    aboutEn:
      "Malaysian multi-unit operator holding master-franchise rights for four international brands, with a mandate to bring two Gulf food concepts to Malaysia by 2027.",
    aboutAr:
      "مشغّل ماليزي متعدد الفروع يمتلك حقوق الامتياز الرئيسي لأربع علامات دولية، ولديه تفويض لجلب مفهومين خليجيين للأغذية إلى ماليزيا بحلول عام 2027.",
    website: "https://example.com/selangor-ventures",
    email: "partnerships@selangor-ventures.example",
    brands: ["SFV Group"],
    outlets: 61,
    founded: 2011,
    plan: "franchisee",
    verification: "verified",
  },
  {
    name: "Lion City Brand Partners",
    nameAr: "لايون سيتي لشراكات العلامات",
    type: "franchisee",
    country: "Singapore",
    city: "Singapore",
    sector: "Retail & Services",
    aboutEn:
      "Singapore-based investment and operating partner specialising in bringing regional brands into ASEAN markets under area-development agreements.",
    aboutAr:
      "شريك استثماري وتشغيلي مقره سنغافورة، متخصص في إدخال العلامات الإقليمية إلى أسواق آسيان بموجب اتفاقيات تطوير المناطق.",
    website: "https://example.com/lion-city-partners",
    email: "invest@lioncity-partners.example",
    brands: ["LCBP Portfolio"],
    outlets: 34,
    founded: 2016,
    plan: "franchisee",
    verification: "verified",
  },
  {
    name: "Gulf Equipment & Fit-Out",
    nameAr: "الخليج للمعدات والتجهيزات",
    type: "supplier",
    country: "United Arab Emirates",
    city: "Dubai",
    sector: "Equipment & Fit-out",
    aboutEn:
      "Accredited supplier of kitchen equipment, store fit-out and maintenance contracts for franchise networks across the GCC.",
    aboutAr:
      "مورّد معتمد لمعدات المطابخ وتجهيز المتاجر وعقود الصيانة لشبكات الامتياز في دول مجلس التعاون.",
    website: "https://example.com/gulf-equipment",
    email: "sales@gulf-equipment.example",
    brands: ["GEF Kitchens", "GEF Fit-Out"],
    founded: 2007,
    plan: "supplier",
    verification: "verified",
  },
  {
    name: "Meridian Franchise Advisory",
    nameAr: "ميريديان للاستشارات في الامتياز",
    type: "service_partner",
    country: "United Kingdom",
    city: "London",
    sector: "Advisory & Legal",
    aboutEn:
      "Advisory firm supporting members with disclosure documents, franchise registration and cross-border structuring.",
    aboutAr:
      "مكتب استشاري يدعم الأعضاء في وثائق الإفصاح وتسجيل الامتياز والهيكلة عبر الحدود.",
    website: "https://example.com/meridian-advisory",
    email: "hello@meridian-advisory.example",
    brands: ["Meridian"],
    founded: 2004,
    plan: "supplier",
    verification: "verified",
  },
  {
    name: "Eastern Province Chamber Liaison",
    nameAr: "مكتب ارتباط غرفة المنطقة الشرقية",
    type: "chamber_partner",
    country: "Saudi Arabia",
    city: "Dammam",
    sector: "Institutional",
    aboutEn:
      "Institutional partner coordinating the cooperative's trade delegations and SME outreach in the Eastern Province.",
    aboutAr:
      "شريك مؤسسي ينسّق البعثات التجارية للتعاونية والتواصل مع المنشآت الصغيرة والمتوسطة في المنطقة الشرقية.",
    website: "https://example.com/ep-chamber-liaison",
    email: "liaison@ep-chamber.example",
    brands: [],
    founded: 2019,
    plan: "enterprise",
    verification: "verified",
  },
  {
    name: "Cairo Bites Holding",
    nameAr: "القاهرة بايتس القابضة",
    type: "franchisor",
    country: "Egypt",
    city: "Cairo",
    sector: "Food & Beverage",
    aboutEn:
      "Egyptian quick-service group applying for cooperative membership to open Gulf franchise territories.",
    aboutAr:
      "مجموعة مصرية للوجبات السريعة تتقدّم بطلب عضوية التعاونية لفتح مناطق امتياز في الخليج.",
    website: "https://example.com/cairo-bites",
    email: "expansion@cairobites.example",
    brands: ["Cairo Bites", "Koshari House"],
    outlets: 48,
    founded: 2015,
    plan: "franchisor",
    verification: "pending",
  },
  {
    name: "Anatolia Retail Group",
    nameAr: "مجموعة الأناضول للتجزئة",
    type: "franchisee",
    country: "Turkey",
    city: "Istanbul",
    sector: "Fashion & Lifestyle",
    aboutEn:
      "Turkish operator seeking Gulf brands for area development in Türkiye. Membership application under review.",
    aboutAr:
      "مشغّل تركي يبحث عن علامات خليجية لتطوير المناطق في تركيا. طلب العضوية قيد المراجعة.",
    website: "https://example.com/anatolia-retail",
    email: "bd@anatolia-retail.example",
    brands: ["ARG"],
    outlets: 27,
    founded: 2012,
    plan: "franchisee",
    verification: "pending",
  },
];

/* ------------------------------------------------------------------ plans */

const PLANS: Omit<MembershipPlan, "id">[] = [
  {
    key: "observer",
    name: { en: "Observer", ar: "مراقب" },
    audience: { en: "Individuals, students and early-stage founders", ar: "الأفراد والطلاب ورواد الأعمال في مراحلهم الأولى" },
    priceYearlySar: 0,
    features: [
      { en: "Browse the member and association directories", ar: "تصفّح دليلي الأعضاء والاتحادات" },
      { en: "Attend free cooperative events", ar: "حضور فعاليات التعاونية المجانية" },
      { en: "Information centre access", ar: "الوصول إلى مركز المعلومات" },
    ],
    isAssumption: true,
  },
  {
    key: "franchisee",
    name: { en: "Franchisee / Investor", ar: "ممنوح امتياز / مستثمر" },
    audience: { en: "Operators and investors seeking brands", ar: "المشغّلون والمستثمرون الباحثون عن علامات تجارية" },
    priceYearlySar: 2000,
    features: [
      { en: "Full access to opportunity disclosure packs", ar: "وصول كامل إلى حزم إفصاح الفرص" },
      { en: "Express interest directly to franchisors", ar: "تسجيل الاهتمام مباشرةً لدى مانحي الامتياز" },
      { en: "Member rates on all events", ar: "أسعار الأعضاء على جميع الفعاليات" },
      { en: "In-platform messaging and approvals", ar: "المراسلات والموافقات داخل المنصة" },
    ],
    isAssumption: true,
  },
  {
    key: "franchisor",
    name: { en: "Franchisor", ar: "مانح امتياز" },
    audience: { en: "Brands offering franchises", ar: "العلامات التجارية التي تمنح الامتياز" },
    priceYearlySar: 5000,
    features: [
      { en: "Publish cross-border franchise opportunities", ar: "نشر فرص الامتياز عبر الحدود" },
      { en: "Verified brand profile and data room", ar: "ملف علامة موثّق وغرفة بيانات" },
      { en: "Host cooperative events under your name", ar: "تنظيم فعاليات التعاونية باسمك" },
      { en: "Shared marketing fund participation", ar: "المشاركة في صندوق التسويق المشترك" },
    ],
    isAssumption: true,
    highlight: true,
  },
  {
    key: "supplier",
    name: { en: "Supplier / Service Partner", ar: "مورّد / شريك خدمات" },
    audience: { en: "Equipment, fit-out, advisory and logistics firms", ar: "شركات المعدات والتجهيز والاستشارات والخدمات اللوجستية" },
    priceYearlySar: 3500,
    features: [
      { en: "Accredited supplier listing", ar: "إدراج ضمن الموردين المعتمدين" },
      { en: "Group-purchasing tenders", ar: "مناقصات الشراء الجماعي" },
      { en: "Exhibit at cooperative events", ar: "المشاركة بجناح في فعاليات التعاونية" },
    ],
    isAssumption: true,
  },
  {
    key: "enterprise",
    name: { en: "Institutional Partner", ar: "شريك مؤسسي" },
    audience: { en: "Chambers, regulators and enterprise groups", ar: "الغرف التجارية والجهات التنظيمية والمجموعات المؤسسية" },
    priceYearlySar: 15000,
    features: [
      { en: "Institution dashboard and delegation tools", ar: "لوحة مؤسسية وأدوات تنظيم البعثات" },
      { en: "Co-branded trade missions", ar: "بعثات تجارية بعلامة مشتركة" },
      { en: "Priority support and named liaison", ar: "دعم ذو أولوية ومسؤول ارتباط مخصص" },
    ],
    isAssumption: true,
  },
];

/* --------------------------------------------------------- info centre --- */

const INFO: Omit<InfoEntry, "id">[] = [
  {
    kind: "government",
    name: { en: "Ministry of Commerce — Franchise Centre", ar: "وزارة التجارة — مركز الامتياز التجاري" },
    country: "Saudi Arabia",
    city: "Riyadh",
    website: "https://mc.gov.sa",
    phone: "1900",
    contactPerson: "Franchise Registration Desk",
    contactEmail: "cs@mc.gov.sa",
    notes: {
      en: "Authority for the Saudi Franchise Law (2019). Franchise agreements must be registered here before they are offered in the Kingdom.",
      ar: "الجهة المختصة بنظام الامتياز التجاري السعودي (2019). يجب تسجيل اتفاقيات الامتياز لديها قبل طرحها في المملكة.",
    },
    verified: false,
  },
  {
    kind: "support",
    name: { en: "Monsha'at — SME General Authority", ar: "منشآت — الهيئة العامة للمنشآت الصغيرة والمتوسطة" },
    country: "Saudi Arabia",
    city: "Riyadh",
    website: "https://www.monshaat.gov.sa",
    phone: "+966 11 828 8888",
    contactPerson: "Franchise Centre",
    notes: {
      en: "Runs the national franchise centre, funding programmes and franchise-readiness support for Saudi SMEs.",
      ar: "تدير المركز الوطني للامتياز التجاري وبرامج التمويل ودعم جاهزية الامتياز للمنشآت السعودية.",
    },
    verified: false,
  },
  {
    kind: "chamber",
    name: { en: "Federation of Saudi Chambers", ar: "اتحاد الغرف السعودية" },
    country: "Saudi Arabia",
    city: "Riyadh",
    website: "https://fsc.org.sa",
    phone: "+966 11 218 2222",
    contactPerson: "International Relations Department",
    notes: {
      en: "Umbrella body of all Saudi chambers; coordinates inbound and outbound trade delegations.",
      ar: "المظلة الجامعة لجميع الغرف السعودية، وتنسّق البعثات التجارية الواردة والصادرة.",
    },
    verified: false,
  },
  {
    kind: "chamber",
    name: { en: "Riyadh Chamber of Commerce", ar: "غرفة الرياض" },
    country: "Saudi Arabia",
    city: "Riyadh",
    website: "https://chamber.sa",
    phone: "+966 11 404 0044",
    contactPerson: "Business Services",
    notes: {
      en: "Member services, certificates of origin and sector committees including retail and hospitality.",
      ar: "خدمات الأعضاء وشهادات المنشأ واللجان القطاعية ومنها التجزئة والضيافة.",
    },
    verified: false,
  },
  {
    kind: "chamber",
    name: { en: "Jeddah Chamber of Commerce", ar: "غرفة جدة" },
    country: "Saudi Arabia",
    city: "Jeddah",
    website: "https://jcci.org.sa",
    phone: "+966 12 651 5111",
    contactPerson: "Trade Development",
    notes: {
      en: "Western-region counterpart for delegations, exhibitions and SME programmes.",
      ar: "النظير في المنطقة الغربية للبعثات والمعارض وبرامج المنشآت الصغيرة والمتوسطة.",
    },
    verified: false,
  },
  {
    kind: "chamber",
    name: { en: "Asharqia Chamber", ar: "غرفة الشرقية" },
    country: "Saudi Arabia",
    city: "Dammam",
    website: "https://chamber.org.sa",
    phone: "+966 13 857 1111",
    contactPerson: "International Cooperation",
    notes: {
      en: "Eastern Province chamber; the cooperative's institutional partner for delegations to the GCC.",
      ar: "غرفة المنطقة الشرقية، وهي الشريك المؤسسي للتعاونية في البعثات إلى دول الخليج.",
    },
    verified: false,
  },
  {
    kind: "association_partner",
    name: { en: "World Franchise Council", ar: "المجلس العالمي للامتياز التجاري" },
    country: "Belgium",
    city: "Brussels",
    website: "https://worldfranchisecouncil.net",
    contactPerson: "Secretariat, c/o European Franchise Federation",
    notes: {
      en: "The global umbrella of national franchise associations. Its full member list is mirrored in the Global Associations directory.",
      ar: "المظلة العالمية للجمعيات الوطنية للامتياز التجاري. وقائمة أعضائه الكاملة معروضة في دليل الاتحادات العالمية.",
    },
    verified: false,
  },
  {
    kind: "association_partner",
    name: { en: "Malaysian Franchise Association", ar: "الجمعية الماليزية للامتياز التجاري" },
    country: "Malaysia",
    city: "Kuala Lumpur",
    website: "http://www.mfa.org.my",
    phone: "+60 3 2264 4000",
    contactPerson: "Secretariat",
    notes: {
      en: "Counterpart association for the cooperative's Malaysia market-entry programme.",
      ar: "الجمعية النظيرة لبرنامج دخول التعاونية إلى السوق الماليزي.",
    },
    verified: false,
  },
  {
    kind: "association_partner",
    name: { en: "Franchising and Licensing Association Singapore", ar: "جمعية الامتياز والترخيص في سنغافورة" },
    country: "Singapore",
    city: "Singapore",
    website: "http://www.flasingapore.org",
    phone: "+65 6295 1667",
    contactPerson: "Secretariat",
    notes: {
      en: "Counterpart association for ASEAN market entry and the annual FLAsia exhibition.",
      ar: "الجمعية النظيرة لدخول أسواق آسيان ومعرض FLAsia السنوي.",
    },
    verified: false,
  },
  {
    kind: "support",
    name: { en: "Saudi Export Development Authority", ar: "هيئة تنمية الصادرات السعودية" },
    country: "Saudi Arabia",
    city: "Riyadh",
    website: "https://saudiexports.sa",
    contactPerson: "Services Export Team",
    notes: {
      en: "Supports Saudi brands exporting services and franchise concepts abroad.",
      ar: "تدعم العلامات السعودية في تصدير الخدمات ومفاهيم الامتياز إلى الخارج.",
    },
    verified: false,
  },
];

/* ----------------------------------------------------------------- events */

interface EventSeed {
  titleEn: string;
  titleAr: string;
  summaryEn: string;
  summaryAr: string;
  descEn: string;
  descAr: string;
  category: string;
  format: CoopEvent["format"];
  venueEn: string;
  venueAr: string;
  city: string;
  country: string;
  mapQuery: string;
  startOffsetDays: number;
  durationHours: number;
  capacity: number;
  feeSar: number;
  status: CoopEvent["status"];
  tone: string;
  agenda: [string, string, string][];
}

const EVENTS: EventSeed[] = [
  {
    titleEn: "Riyadh Franchise Forum 2026",
    titleAr: "ملتقى الرياض للامتياز التجاري 2026",
    summaryEn:
      "The cooperative's flagship annual forum: two days of brand showcases, investor meetings and regulatory briefings.",
    summaryAr:
      "الملتقى السنوي الرئيسي للتعاونية: يومان من عروض العلامات ولقاءات المستثمرين والإحاطات التنظيمية.",
    descEn:
      "The Riyadh Franchise Forum brings together franchisors, multi-unit operators, suppliers and regulators for the cooperative's largest gathering of the year. The programme covers the current state of franchise registration under the Saudi Franchise Law, a brand showcase for members opening new territories, and structured one-to-one investor meetings arranged in advance through the member portal. Institutional partners from the Federation of Saudi Chambers and counterpart associations in Malaysia and Singapore will attend the international session.",
    descAr:
      "يجمع ملتقى الرياض للامتياز التجاري مانحي الامتياز والمشغّلين متعددي الفروع والموردين والجهات التنظيمية في أكبر تجمع سنوي للتعاونية. يغطي البرنامج واقع تسجيل الامتياز وفق نظام الامتياز التجاري السعودي، وعرضاً للعلامات الأعضاء التي تفتح مناطق جديدة، ولقاءات ثنائية منظمة مع المستثمرين يجري ترتيبها مسبقاً عبر بوابة الأعضاء. ويشارك في الجلسة الدولية شركاء مؤسسيون من اتحاد الغرف السعودية والجمعيات النظيرة في ماليزيا وسنغافورة.",
    category: "Forum",
    format: "hybrid",
    venueEn: "King Abdullah Financial District Conference Centre",
    venueAr: "مركز المؤتمرات بمركز الملك عبدالله المالي",
    city: "Riyadh",
    country: "Saudi Arabia",
    mapQuery: "King Abdullah Financial District Conference Centre Riyadh",
    startOffsetDays: 26,
    durationHours: 18,
    capacity: 600,
    feeSar: 950,
    status: "published",
    tone: "from-brand-700 via-brand-600 to-gold-500",
    agenda: [
      ["09:00", "Registration and networking breakfast", "التسجيل وإفطار التعارف"],
      ["10:00", "Opening address by the Chairman", "الكلمة الافتتاحية لرئيس مجلس الإدارة"],
      ["10:45", "Franchise registration under the 2019 law — regulator briefing", "تسجيل الامتياز وفق نظام 2019 — إحاطة من الجهة التنظيمية"],
      ["13:30", "Member brand showcase", "عرض العلامات الأعضاء"],
      ["15:00", "Structured investor meetings", "لقاءات المستثمرين المنظمة"],
      ["17:00", "International session: ASEAN market entry", "الجلسة الدولية: الدخول إلى أسواق آسيان"],
    ],
  },
  {
    titleEn: "Trade Mission to Kuala Lumpur",
    titleAr: "بعثة تجارية إلى كوالالمبور",
    summaryEn:
      "A five-day delegation for members taking Saudi brands into Malaysia, hosted with the Malaysian Franchise Association.",
    summaryAr:
      "بعثة لمدة خمسة أيام للأعضاء الراغبين في نقل العلامات السعودية إلى ماليزيا، تُنظَّم بالتعاون مع الجمعية الماليزية للامتياز التجاري.",
    descEn:
      "A working delegation, not a study tour. Participating members arrive with a disclosure pack already reviewed by the cooperative's legal committee and leave with scheduled meetings against a shortlist of Malaysian master-franchise candidates. The programme includes a regulatory briefing on Malaysia's franchise registration regime, site visits to operating networks in the Klang Valley, and a matchmaking session organised by the host association. Places are limited and allocated through the portal's approval queue.",
    descAr:
      "بعثة عمل لا جولة دراسية. يصل الأعضاء المشاركون بحزمة إفصاح سبق أن راجعتها اللجنة القانونية للتعاونية، ويغادرون بمواعيد مؤكدة مع قائمة مختصرة من المرشحين الماليزيين للامتياز الرئيسي. يتضمن البرنامج إحاطة تنظيمية عن نظام تسجيل الامتياز في ماليزيا، وزيارات ميدانية لشبكات عاملة في وادي كلانج، وجلسة مواءمة تنظمها الجمعية المضيفة. والمقاعد محدودة وتُخصَّص عبر قائمة الموافقات في البوابة.",
    category: "Trade mission",
    format: "in_person",
    venueEn: "Kuala Lumpur Convention Centre and partner sites",
    venueAr: "مركز كوالالمبور للمؤتمرات ومواقع الشركاء",
    city: "Kuala Lumpur",
    country: "Malaysia",
    mapQuery: "Kuala Lumpur Convention Centre",
    startOffsetDays: 54,
    durationHours: 120,
    capacity: 40,
    feeSar: 7500,
    status: "published",
    tone: "from-brand-800 via-brand-600 to-brand-400",
    agenda: [
      ["Day 1", "Arrival, briefing by the Malaysian Franchise Association", "الوصول وإحاطة من الجمعية الماليزية للامتياز التجاري"],
      ["Day 2", "Regulatory session: franchise registration in Malaysia", "جلسة تنظيمية: تسجيل الامتياز في ماليزيا"],
      ["Day 3", "Matchmaking with master-franchise candidates", "جلسة مواءمة مع مرشحي الامتياز الرئيسي"],
      ["Day 4", "Site visits — Klang Valley networks", "زيارات ميدانية — شبكات وادي كلانج"],
      ["Day 5", "Deal review and delegation debrief", "مراجعة الصفقات وتقييم البعثة"],
    ],
  },
  {
    titleEn: "Franchise Readiness Workshop",
    titleAr: "ورشة جاهزية الامتياز التجاري",
    summaryEn:
      "A one-day practical workshop for brands preparing to franchise for the first time. Free for members.",
    summaryAr:
      "ورشة عملية ليوم واحد للعلامات التي تستعد لمنح الامتياز لأول مرة. مجانية للأعضاء.",
    descEn:
      "Run by the cooperative's academy, this workshop takes a founder through what has to exist before a brand can responsibly sell a franchise: a documented operating model, unit economics that survive scrutiny, a training curriculum, a supply chain that can serve a third party, and a disclosure document that meets Saudi requirements. Participants leave with a completed readiness scorecard reviewed by the academy team.",
    descAr:
      "تقدمها أكاديمية التعاونية، وتأخذ الورشة المؤسس عبر ما يجب توفره قبل أن تبيع العلامة امتيازاً بشكل مسؤول: نموذج تشغيلي موثّق، واقتصاديات فرع تصمد أمام التدقيق، ومنهج تدريبي، وسلسلة إمداد قادرة على خدمة طرف ثالث، ووثيقة إفصاح تستوفي المتطلبات السعودية. ويخرج المشاركون ببطاقة جاهزية مكتملة يراجعها فريق الأكاديمية.",
    category: "Workshop",
    format: "in_person",
    venueEn: "VVG Cooperative Academy, Olaya",
    venueAr: "أكاديمية تعاونية VVG، العليا",
    city: "Riyadh",
    country: "Saudi Arabia",
    mapQuery: "Olaya Street Riyadh",
    startOffsetDays: 9,
    durationHours: 7,
    capacity: 35,
    feeSar: 0,
    status: "published",
    tone: "from-gold-400 via-gold-500 to-brand-700",
    agenda: [
      ["09:00", "Is your brand franchisable? Scorecard session", "هل علامتك قابلة للامتياز؟ جلسة بطاقة التقييم"],
      ["11:00", "Unit economics and franchisee returns", "اقتصاديات الفرع وعوائد الممنوح"],
      ["13:30", "Building the operations manual", "بناء دليل العمليات"],
      ["15:30", "Disclosure documents and registration", "وثائق الإفصاح والتسجيل"],
    ],
  },
  {
    titleEn: "Members' General Assembly",
    titleAr: "الجمعية العمومية للأعضاء",
    summaryEn:
      "The statutory annual assembly: accounts, board report and votes on the coming year's cooperative marketing plan.",
    summaryAr:
      "الاجتماع السنوي النظامي: الحسابات وتقرير المجلس والتصويت على خطة التسويق التعاوني للعام القادم.",
    descEn:
      "All verified members are entitled to attend and vote. The treasurer presents the annual accounts and the state of the shared marketing fund, the board presents its report, and members vote on the marketing plan and the fee schedule for the coming year. Proxy voting is arranged through the member portal.",
    descAr:
      "يحق لجميع الأعضاء الموثّقين الحضور والتصويت. يعرض أمين الصندوق الحسابات السنوية ووضع صندوق التسويق المشترك، ويقدّم المجلس تقريره، ويصوّت الأعضاء على خطة التسويق وجدول الرسوم للعام القادم. ويُنظَّم التصويت بالوكالة عبر بوابة الأعضاء.",
    category: "Governance",
    format: "hybrid",
    venueEn: "Cooperative Headquarters, Riyadh",
    venueAr: "المقر الرئيسي للتعاونية، الرياض",
    city: "Riyadh",
    country: "Saudi Arabia",
    mapQuery: "Riyadh Saudi Arabia",
    startOffsetDays: 75,
    durationHours: 4,
    capacity: 300,
    feeSar: 0,
    status: "published",
    tone: "from-brand-900 via-brand-700 to-brand-500",
    agenda: [
      ["10:00", "Quorum and opening", "اكتمال النصاب والافتتاح"],
      ["10:20", "Treasurer's report and annual accounts", "تقرير أمين الصندوق والحسابات السنوية"],
      ["11:15", "Board report", "تقرير مجلس الإدارة"],
      ["12:00", "Vote: cooperative marketing plan 2027", "التصويت: خطة التسويق التعاوني 2027"],
    ],
  },
  {
    titleEn: "Supplier Accreditation Day",
    titleAr: "يوم اعتماد الموردين",
    summaryEn:
      "Live assessment day for equipment, fit-out and logistics suppliers applying for cooperative accreditation.",
    summaryAr:
      "يوم تقييم مباشر لموردي المعدات والتجهيزات والخدمات اللوجستية المتقدمين للاعتماد لدى التعاونية.",
    descEn:
      "Suppliers present to a panel drawn from the sourcing committee and member operators. Accredited suppliers are listed in the member directory and become eligible for the cooperative's group-purchasing tenders.",
    descAr:
      "يقدّم الموردون عروضهم أمام لجنة من لجنة المشتريات والمشغّلين الأعضاء. ويُدرَج الموردون المعتمدون في دليل الأعضاء ويصبحون مؤهلين لمناقصات الشراء الجماعي للتعاونية.",
    category: "Assessment",
    format: "in_person",
    venueEn: "Riyadh Exhibition Centre, Hall 2",
    venueAr: "مركز الرياض للمعارض، الصالة 2",
    city: "Riyadh",
    country: "Saudi Arabia",
    mapQuery: "Riyadh International Convention and Exhibition Center",
    startOffsetDays: 0,
    durationHours: 9,
    capacity: 80,
    feeSar: 0,
    status: "live",
    tone: "from-brand-600 via-gold-500 to-gold-400",
    agenda: [
      ["09:00", "Panel briefing", "إحاطة اللجنة"],
      ["09:30", "Supplier presentations", "عروض الموردين"],
      ["14:00", "Panel deliberation", "مداولات اللجنة"],
      ["16:00", "Provisional results", "النتائج الأولية"],
    ],
  },
  {
    titleEn: "Cooperative Marketing Committee — Q3",
    titleAr: "لجنة التسويق التعاوني — الربع الثالث",
    summaryEn: "Quarterly committee session on the joint campaign calendar and shared media buying.",
    summaryAr: "الجلسة الربعية للجنة حول تقويم الحملات المشتركة والشراء الإعلامي الموحّد.",
    descEn:
      "Committee members review campaign performance for the quarter, agree the shared media plan and allocate the marketing fund across member categories. Minutes are published to all verified members through the portal.",
    descAr:
      "يستعرض أعضاء اللجنة أداء الحملات خلال الربع، ويعتمدون الخطة الإعلامية المشتركة، ويوزعون صندوق التسويق على فئات الأعضاء. وتُنشر المحاضر لجميع الأعضاء الموثّقين عبر البوابة.",
    category: "Committee",
    format: "virtual",
    venueEn: "Online — portal video room",
    venueAr: "عن بُعد — غرفة الاجتماعات في البوابة",
    city: "Online",
    country: "—",
    mapQuery: "",
    startOffsetDays: -12,
    durationHours: 2,
    capacity: 25,
    feeSar: 0,
    status: "completed",
    tone: "from-brand-700 to-brand-500",
    agenda: [
      ["14:00", "Q2 campaign performance", "أداء حملات الربع الثاني"],
      ["14:45", "Shared media plan", "الخطة الإعلامية المشتركة"],
      ["15:30", "Fund allocation", "توزيع الصندوق"],
    ],
  },
  {
    titleEn: "Singapore Brand Showcase (FLAsia side event)",
    titleAr: "عرض العلامات في سنغافورة (فعالية موازية لمعرض FLAsia)",
    summaryEn:
      "A member showcase alongside the region's principal franchise exhibition. Awaiting board approval.",
    summaryAr:
      "عرض للأعضاء على هامش أبرز معارض الامتياز في المنطقة. بانتظار اعتماد المجلس.",
    descEn:
      "Proposed side event giving eight member brands a shared stand and a pitch slot in front of ASEAN investors. Budget and participation model are with the board's approvals queue.",
    descAr:
      "فعالية موازية مقترحة تمنح ثماني علامات أعضاء جناحاً مشتركاً وفرصة تقديم أمام مستثمري آسيان. الميزانية ونموذج المشاركة قيد الاعتماد لدى قائمة موافقات المجلس.",
    category: "Exhibition",
    format: "in_person",
    venueEn: "Marina Bay Sands Expo",
    venueAr: "مركز مارينا باي ساندز للمعارض",
    city: "Singapore",
    country: "Singapore",
    mapQuery: "Marina Bay Sands Expo and Convention Centre",
    startOffsetDays: 96,
    durationHours: 30,
    capacity: 8,
    feeSar: 12000,
    status: "pending_approval",
    tone: "from-brand-800 to-gold-500",
    agenda: [
      ["Day 1", "Stand build and member briefing", "تجهيز الجناح وإحاطة الأعضاء"],
      ["Day 2", "Pitch sessions and investor meetings", "جلسات العرض ولقاءات المستثمرين"],
    ],
  },
];

/* ---------------------------------------------------------- opportunities */

interface OppSeed {
  orgIndex: number;
  brandName: string;
  sector: string;
  homeCountry: string;
  targets: string[];
  model: string;
  from: number;
  to: number;
  royalty: number;
  summaryEn: string;
  summaryAr: string;
  reqEn: string;
  reqAr: string;
  supEn: string;
  supAr: string;
  status: Opportunity["status"];
}

const OPPS: OppSeed[] = [
  {
    orgIndex: 0,
    brandName: "Bayt Qahwa",
    sector: "Speciality Coffee",
    homeCountry: "Saudi Arabia",
    targets: ["Malaysia", "Singapore", "Indonesia"],
    model: "Master franchise",
    from: 1_800_000,
    to: 3_500_000,
    royalty: 6,
    summaryEn:
      "Saudi speciality-coffee brand with 88 domestic outlets seeking a master franchisee for South-East Asia. The concept is a 120–180 sqm café with an in-house roastery programme and a proven delivery channel contributing 31% of revenue.",
    summaryAr:
      "علامة سعودية للقهوة المختصة بـ88 فرعاً محلياً تبحث عن ممنوح امتياز رئيسي لجنوب شرق آسيا. المفهوم مقهى بمساحة 120–180 متراً مربعاً مع برنامج تحميص داخلي وقناة توصيل مثبتة تسهم بنسبة 31% من الإيرادات.",
    reqEn:
      "Minimum ten years of multi-unit food and beverage operating experience in the target market; committed development schedule of no fewer than fifteen outlets over five years; demonstrable access to prime retail locations.",
    reqAr:
      "خبرة لا تقل عن عشر سنوات في تشغيل منشآت أغذية ومشروبات متعددة الفروع في السوق المستهدف؛ وجدول تطوير ملتزم لا يقل عن خمسة عشر فرعاً خلال خمس سنوات؛ وقدرة مثبتة على الوصول إلى مواقع تجزئة متميزة.",
    supEn:
      "Full operations manual, twelve-week opening programme, on-site launch team for the first three outlets, roastery sourcing agreements and quarterly business reviews.",
    supAr:
      "دليل عمليات كامل، وبرنامج افتتاح مدته اثنا عشر أسبوعاً، وفريق إطلاق ميداني لأول ثلاثة فروع، واتفاقيات توريد للتحميص، ومراجعات أعمال ربعية.",
    status: "published",
  },
  {
    orgIndex: 1,
    brandName: "Andalus",
    sector: "Modest Fashion",
    homeCountry: "Saudi Arabia",
    targets: ["Malaysia", "Indonesia", "Egypt", "Turkey"],
    model: "Area development",
    from: 900_000,
    to: 2_200_000,
    royalty: 5,
    summaryEn:
      "Modest-fashion retailer opening area-development territories. Stores run 180–260 sqm in tier-one malls, supported by a regional distribution centre in Jeddah and a twice-yearly collection cycle.",
    summaryAr:
      "متاجر تجزئة للأزياء المحتشمة تفتح مناطق للتطوير. تتراوح مساحة المتاجر بين 180 و260 متراً مربعاً في المراكز التجارية من الفئة الأولى، بدعم من مركز توزيع إقليمي في جدة ودورة تشكيلات مرتين سنوياً.",
    reqEn:
      "Established retail operator with mall relationships in the target territory; minimum three stores in year one; local marketing budget of 4% of net sales.",
    reqAr:
      "مشغّل تجزئة قائم لديه علاقات مع المراكز التجارية في المنطقة المستهدفة؛ وثلاثة متاجر كحد أدنى في السنة الأولى؛ وميزانية تسويق محلية بنسبة 4% من صافي المبيعات.",
    supEn:
      "Store design package, visual-merchandising standards, seasonal buying support and staff certification through the cooperative academy.",
    supAr:
      "حزمة تصميم المتجر، ومعايير العرض البصري، ودعم الشراء الموسمي، واعتماد الموظفين عبر أكاديمية التعاونية.",
    status: "published",
  },
  {
    orgIndex: 0,
    brandName: "Najd Grill",
    sector: "Casual Dining",
    homeCountry: "Saudi Arabia",
    targets: ["United Arab Emirates", "Kuwait", "Bahrain"],
    model: "Single-unit and multi-unit",
    from: 1_200_000,
    to: 1_900_000,
    royalty: 6,
    summaryEn:
      "Casual-dining grill concept expanding within the GCC. Average unit 300 sqm with 120 covers; target payback of 34 months on the domestic model.",
    summaryAr:
      "مفهوم مطاعم مشويات عادية يتوسع داخل دول الخليج. متوسط مساحة الفرع 300 متر مربع بسعة 120 مقعداً، وفترة استرداد مستهدفة تبلغ 34 شهراً وفق النموذج المحلي.",
    reqEn:
      "Food and beverage operating experience in the GCC; liquid capital of SAR 1.5 million per unit; commitment to the brand's supply specification.",
    reqAr:
      "خبرة تشغيلية في قطاع الأغذية والمشروبات في دول الخليج؛ ورأس مال سائل بقيمة 1.5 مليون ريال لكل فرع؛ والالتزام بمواصفات التوريد الخاصة بالعلامة.",
    supEn: "Site selection, kitchen specification, opening team and continuous operational audit.",
    supAr: "اختيار الموقع، ومواصفات المطبخ، وفريق الافتتاح، والتدقيق التشغيلي المستمر.",
    status: "published",
  },
  {
    orgIndex: 1,
    brandName: "AR Studio",
    sector: "Lifestyle Retail",
    homeCountry: "Saudi Arabia",
    targets: ["Singapore", "United Kingdom"],
    model: "Master franchise",
    from: 2_500_000,
    to: 4_000_000,
    royalty: 5,
    summaryEn:
      "Premium lifestyle sub-brand seeking a master franchisee for two mature markets. Draft — not yet submitted for publication.",
    summaryAr:
      "علامة فرعية فاخرة لنمط الحياة تبحث عن ممنوح امتياز رئيسي في سوقين ناضجين. مسودة لم تُقدَّم للنشر بعد.",
    reqEn: "Premium retail portfolio in the target market and a five-year development plan.",
    reqAr: "محفظة تجزئة فاخرة في السوق المستهدف وخطة تطوير خمسية.",
    supEn: "Design package and buying support.",
    supAr: "حزمة التصميم ودعم الشراء.",
    status: "draft",
  },
  {
    orgIndex: 2,
    brandName: "SFV Group — inbound mandate",
    sector: "Food & Beverage",
    homeCountry: "Malaysia",
    targets: ["Saudi Arabia"],
    model: "Reverse enquiry",
    from: 1_000_000,
    to: 2_500_000,
    royalty: 5,
    summaryEn:
      "Malaysian operator inviting Gulf food and beverage brands to appoint it as master franchisee for Malaysia. Submitted for publication and awaiting approval.",
    summaryAr:
      "مشغّل ماليزي يدعو العلامات الخليجية في قطاع الأغذية والمشروبات إلى تعيينه ممنوح امتياز رئيسي لماليزيا. قُدِّم للنشر وبانتظار الاعتماد.",
    reqEn:
      "Brands with at least twenty-five operating units and a documented operations manual in English.",
    reqAr: "علامات لديها خمسة وعشرون فرعاً عاملاً على الأقل ودليل عمليات موثّق بالإنجليزية.",
    supEn:
      "Local entity, halal certification pathway, Klang Valley site pipeline and a trained opening team.",
    supAr:
      "كيان محلي، ومسار شهادة الحلال، وقائمة مواقع في وادي كلانج، وفريق افتتاح مدرَّب.",
    status: "pending_approval",
  },
];

/* ------------------------------------------------------------------ build */

export async function buildSeed(): Promise<Database> {
  const db: Database = structuredClone(EMPTY_DB);

  /* --- membership plans --- */
  db.plans = PLANS.map((p) => ({ ...p, id: id() }));

  /* --- board --- */
  db.board = BOARD.map<BoardMember>((b) => ({
    id: id(),
    slug: slugify(b.name),
    name: b.name,
    nameAr: b.nameAr,
    title: { en: b.titleEn, ar: b.titleAr },
    tier: b.tier,
    order: b.order,
    bio: { en: b.bioEn, ar: b.bioAr },
    mandate: { en: b.mandateEn, ar: b.mandateAr },
    committees: b.committees.map(([en, ar]) => ({ en, ar })),
    email: b.email,
    phone: b.phone,
    linkedin: `https://www.linkedin.com/company/vvg-cooperative`,
    country: b.country,
    initials: b.name
      .replace(/^(Eng\.|Dr\.|Mr\.|Ms\.|Mrs\.)\s*/i, "")
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase(),
    tone: b.tone,
    isDemo: true,
  }));

  /* --- associations (researched WFC data) --- */
  const source = (associationsData as any).source as string;
  const assocs: Association[] = [];
  for (const f of (associationsData as any).regional_federations) {
    assocs.push({
      id: id(),
      name: f.name,
      country: f.scope,
      scope: f.scope === "Global" ? "Global" : "Regional",
      address: f.address,
      phone: f.phone,
      website: f.website,
      officers: f.officers,
      source,
    });
  }
  for (const a of (associationsData as any).national_associations) {
    assocs.push({
      id: id(),
      name: a.name,
      country: a.country,
      scope: "National",
      address: a.address,
      phone: a.phone,
      website: a.website,
      officers: a.officers,
      source,
    });
  }
  db.associations = assocs;

  /* --- information centre --- */
  db.infoEntries = INFO.map((e) => ({ ...e, id: id() }));

  /* --- users and organisations --- */
  const superAdminPw = await hashPassword(process.env.SUPER_ADMIN_PASSWORD || "ChangeMe!2026");
  const demoPw = await hashPassword("Demo!2026");

  const superAdmin: User = {
    id: id(),
    email: (process.env.SUPER_ADMIN_EMAIL || "admin@vvg-cooperative.org").toLowerCase(),
    passwordHash: superAdminPw,
    fullName: "Dr. Faisal Al-Harbi",
    fullNameAr: "د. فيصل الحربي",
    jobTitle: "Secretary General",
    locale: "en",
    role: "super_admin",
    active: true,
    createdAt: NOW - 400 * DAY,
  };
  db.users.push(superAdmin);

  const orgIds: string[] = [];
  ORGS.forEach((o, i) => {
    const orgId = id();
    orgIds.push(orgId);
    db.organizations.push({
      id: orgId,
      slug: slugify(o.name),
      name: o.name,
      nameAr: o.nameAr,
      type: o.type,
      country: o.country,
      city: o.city,
      sector: o.sector,
      about: { en: o.aboutEn, ar: o.aboutAr },
      website: o.website,
      contactEmail: o.email,
      brands: o.brands,
      outletCount: o.outlets,
      foundedYear: o.founded,
      logoInitials: o.name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase(),
      verification: o.verification,
      membershipPlan: o.plan,
      createdBy: superAdmin.id,
      createdAt: NOW - (300 - i * 24) * DAY,
      decidedAt: o.verification === "verified" ? NOW - (290 - i * 24) * DAY : undefined,
      decidedBy: o.verification === "verified" ? superAdmin.id : undefined,
    });
  });

  // One member account per organisation, plus a portal administrator.
  const memberNames: [string, string, string][] = [
    ["Saad Al-Nasser", "سعد الناصر", "Head of Franchise Development"],
    ["Maha Al-Turki", "مها التركي", "Director, International Expansion"],
    ["Aisyah Rahman", "عائشة رحمن", "Group Business Development Manager"],
    ["Daniel Tan", "دانيال تان", "Managing Partner"],
    ["Omar Haddad", "عمر حداد", "Regional Sales Director"],
    ["Claire Whitfield", "كلير ويتفيلد", "Partner, Franchise Practice"],
    ["Bandar Al-Shammari", "بندر الشمري", "Trade Delegation Officer"],
    ["Youssef Mansour", "يوسف منصور", "Expansion Manager"],
    ["Elif Demir", "إليف دمير", "Business Development Lead"],
  ];
  const memberIds: string[] = [];
  ORGS.forEach((o, i) => {
    const uid = id();
    memberIds.push(uid);
    const [name, nameAr, title] = memberNames[i];
    db.users.push({
      id: uid,
      email: `${slugify(name)}@${slugify(o.name)}.example`,
      passwordHash: demoPw,
      fullName: name,
      fullNameAr: nameAr,
      jobTitle: title,
      locale: o.country === "Saudi Arabia" ? "ar" : "en",
      role: "member",
      organizationId: orgIds[i],
      active: true,
      createdAt: NOW - (299 - i * 24) * DAY,
    });
  });

  const adminId = id();
  db.users.push({
    id: adminId,
    email: "events.admin@vvg-cooperative.org",
    passwordHash: demoPw,
    fullName: "Noura Al-Dossari",
    fullNameAr: "نورة الدوسري",
    jobTitle: "Head of Events & Marketing",
    locale: "en",
    role: "admin",
    active: true,
    createdAt: NOW - 380 * DAY,
  });

  /* --- events --- */
  const eventIds: string[] = [];
  EVENTS.forEach((e) => {
    const eid = id();
    eventIds.push(eid);
    const startsAt = NOW + e.startOffsetDays * DAY;
    const ev: CoopEvent = {
      id: eid,
      slug: slugify(e.titleEn),
      title: { en: e.titleEn, ar: e.titleAr },
      summary: { en: e.summaryEn, ar: e.summaryAr },
      description: { en: e.descEn, ar: e.descAr },
      category: e.category,
      format: e.format,
      venue: { en: e.venueEn, ar: e.venueAr },
      city: e.city,
      country: e.country,
      mapQuery: e.mapQuery || undefined,
      startsAt,
      endsAt: startsAt + e.durationHours * HOUR,
      capacity: e.capacity,
      feeSar: e.feeSar,
      contactEmail: "events@vvg-cooperative.org",
      status: e.status,
      coverTone: e.tone,
      agenda: e.agenda.map(([time, en, ar]) => ({ time, item: { en, ar } })),
      createdBy: adminId,
      createdAt: startsAt - 60 * DAY,
    };
    db.events.push(ev);
  });

  /* --- registrations (gives the events real occupancy) --- */
  const regPlan: [number, number[], EventRegistration["status"]][] = [
    [0, [0, 1, 2, 3, 4, 5], "confirmed"],
    [0, [7], "pending"],
    [1, [0, 1], "confirmed"],
    [1, [8], "pending"],
    [2, [4, 6], "confirmed"],
    [3, [0, 1, 2, 3], "confirmed"],
    [4, [4, 5], "confirmed"],
    [5, [0, 3], "attended"],
  ];
  for (const [evIdx, members, status] of regPlan) {
    for (const m of members) {
      const user = db.users.find((u) => u.id === memberIds[m])!;
      db.registrations.push({
        id: id(),
        eventId: eventIds[evIdx],
        userId: user.id,
        organizationId: user.organizationId,
        attendeeName: user.fullName,
        attendeeEmail: user.email,
        seats: 1 + (m % 2),
        status,
        createdAt: db.events[evIdx].startsAt - (20 + m) * DAY,
        decidedAt: status === "pending" ? undefined : db.events[evIdx].startsAt - (18 + m) * DAY,
        decidedBy: status === "pending" ? undefined : adminId,
      });
    }
  }

  /* --- opportunities --- */
  const oppIds: string[] = [];
  OPPS.forEach((o, i) => {
    const oid = id();
    oppIds.push(oid);
    db.opportunities.push({
      id: oid,
      slug: slugify(`${o.brandName}-${o.targets[0]}`),
      organizationId: orgIds[o.orgIndex],
      brandName: o.brandName,
      sector: o.sector,
      homeCountry: o.homeCountry,
      targetCountries: o.targets,
      model: o.model,
      investmentFromSar: o.from,
      investmentToSar: o.to,
      royaltyPct: o.royalty,
      summary: { en: o.summaryEn, ar: o.summaryAr },
      requirements: { en: o.reqEn, ar: o.reqAr },
      support: { en: o.supEn, ar: o.supAr },
      status: o.status,
      createdBy: memberIds[o.orgIndex],
      createdAt: NOW - (120 - i * 15) * DAY,
      decidedAt: o.status === "published" ? NOW - (115 - i * 15) * DAY : undefined,
      decidedBy: o.status === "published" ? superAdmin.id : undefined,
    });
  });

  /* --- interests --- */
  db.interests.push(
    {
      id: id(),
      opportunityId: oppIds[0],
      userId: memberIds[2],
      organizationId: orgIds[2],
      message:
        "We hold master-franchise rights for four international brands in Malaysia and would like to review the full disclosure pack for Bayt Qahwa. We can commit to a fifteen-outlet schedule over five years.",
      status: "in_review",
      createdAt: NOW - 21 * DAY,
    },
    {
      id: id(),
      opportunityId: oppIds[0],
      userId: memberIds[3],
      organizationId: orgIds[3],
      message:
        "Lion City Brand Partners would like to discuss Singapore rights separately from the wider South-East Asia territory.",
      status: "new",
      createdAt: NOW - 6 * DAY,
    },
    {
      id: id(),
      opportunityId: oppIds[1],
      userId: memberIds[2],
      organizationId: orgIds[2],
      message: "Interested in Malaysia area development for Andalus. Please share unit economics.",
      status: "new",
      createdAt: NOW - 3 * DAY,
    }
  );

  /* --- approvals queue (the system of record) --- */
  const pendingOrgs = db.organizations.filter((o) => o.verification === "pending");
  const approvals: Approval[] = [];
  for (const org of pendingOrgs) {
    approvals.push({
      id: id(),
      kind: "organization_verification",
      subjectId: org.id,
      title: {
        en: `Verify membership: ${org.name}`,
        ar: `توثيق عضوية: ${org.nameAr}`,
      },
      detail: `${org.type} · ${org.city}, ${org.country} · ${org.sector}`,
      requestedBy: superAdmin.id,
      requestedByName: org.name,
      status: "pending",
      createdAt: org.createdAt,
    });
  }
  const pendingEvent = db.events.find((e) => e.status === "pending_approval");
  if (pendingEvent) {
    approvals.push({
      id: id(),
      kind: "event_publication",
      subjectId: pendingEvent.id,
      title: { en: `Publish event: ${pendingEvent.title.en}`, ar: `نشر فعالية: ${pendingEvent.title.ar}` },
      detail: `${pendingEvent.category} · ${pendingEvent.city} · capacity ${pendingEvent.capacity}`,
      requestedBy: adminId,
      requestedByName: "Noura Al-Dossari",
      status: "pending",
      createdAt: NOW - 4 * DAY,
    });
  }
  const pendingOpp = db.opportunities.find((o) => o.status === "pending_approval");
  if (pendingOpp) {
    approvals.push({
      id: id(),
      kind: "opportunity_publication",
      subjectId: pendingOpp.id,
      title: {
        en: `Publish opportunity: ${pendingOpp.brandName}`,
        ar: `نشر فرصة: ${pendingOpp.brandName}`,
      },
      detail: `${pendingOpp.model} · ${pendingOpp.targetCountries.join(", ")}`,
      requestedBy: pendingOpp.createdBy,
      requestedByName: "Aisyah Rahman",
      status: "pending",
      createdAt: NOW - 9 * DAY,
    });
  }
  for (const reg of db.registrations.filter((r) => r.status === "pending")) {
    const ev = db.events.find((e) => e.id === reg.eventId)!;
    approvals.push({
      id: id(),
      kind: "event_registration",
      subjectId: reg.id,
      title: {
        en: `Registration: ${reg.attendeeName} → ${ev.title.en}`,
        ar: `تسجيل: ${reg.attendeeName} ← ${ev.title.ar}`,
      },
      detail: `${reg.seats} seat(s) · ${reg.attendeeEmail}`,
      requestedBy: reg.userId,
      requestedByName: reg.attendeeName,
      status: "pending",
      createdAt: reg.createdAt,
    });
  }
  // A couple of settled decisions so the history is not empty.
  approvals.push({
    id: id(),
    kind: "organization_verification",
    subjectId: orgIds[3],
    title: { en: "Verify membership: Lion City Brand Partners", ar: "توثيق عضوية: لايون سيتي لشراكات العلامات" },
    detail: "franchisee · Singapore · Retail & Services",
    requestedBy: memberIds[3],
    requestedByName: "Daniel Tan",
    status: "approved",
    decidedBy: superAdmin.id,
    decidedByName: "Dr. Faisal Al-Harbi",
    decisionNote: "Commercial registration and audited accounts verified.",
    createdAt: NOW - 210 * DAY,
    decidedAt: NOW - 206 * DAY,
  });
  db.approvals = approvals;

  /* --- messaging --- */
  const generalThread = {
    id: id(),
    subject: "Cooperative-wide channel",
    kind: "general" as const,
    participantIds: [] as string[],
    createdBy: superAdmin.id,
    createdAt: NOW - 400 * DAY,
    lastMessageAt: NOW - 2 * HOUR,
  };
  db.threads.push(generalThread);
  const chat: [string, string, number][] = [
    [
      superAdmin.id,
      "Reminder to all members: registration for the Riyadh Franchise Forum closes two weeks before the event. Places are allocated through the approvals queue, not by email.",
      NOW - 3 * DAY,
    ],
    [
      memberIds[0],
      "Najd Hospitality will bring three brands to the showcase. Our disclosure pack for Bayt Qahwa has been updated in the data room.",
      NOW - 2 * DAY,
    ],
    [
      memberIds[2],
      "Selangor Franchise Ventures would like two additional seats on the Kuala Lumpur mission — request submitted through the portal.",
      NOW - 26 * HOUR,
    ],
    [
      adminId,
      "Noted. The mission is capped at forty places; additional seats are being reviewed by the international relations committee this week.",
      NOW - 2 * HOUR,
    ],
  ];
  for (const [uid, body, at] of chat) {
    const u = db.users.find((x) => x.id === uid)!;
    db.messages.push({
      id: id(),
      threadId: generalThread.id,
      userId: uid,
      userName: u.fullName,
      body,
      createdAt: at,
    });
  }

  /* --- activity log / live feed --- */
  const feed: [string, string, string, string, "public" | "internal", number, string?][] = [
    ["Noura Al-Dossari", "event.opened", "Supplier Accreditation Day is now live at the Riyadh Exhibition Centre.", "انطلق يوم اعتماد الموردين الآن في مركز الرياض للمعارض.", "public", NOW - 1 * HOUR, "/events"],
    ["Selangor Franchise Ventures", "interest.expressed", "Expressed interest in the Bayt Qahwa master franchise for South-East Asia.", "سجّلت اهتمامها بالامتياز الرئيسي لعلامة بيت قهوة في جنوب شرق آسيا.", "public", NOW - 5 * HOUR, "/opportunities"],
    ["Dr. Faisal Al-Harbi", "approval.decided", "Approved the publication of the Andalus area-development opportunity.", "اعتمد نشر فرصة تطوير المناطق لعلامة الأندلس.", "public", NOW - 11 * HOUR, "/opportunities"],
    ["Cairo Bites Holding", "membership.applied", "Submitted a franchisor membership application from Cairo, Egypt.", "قدّمت طلب عضوية مانح امتياز من القاهرة، مصر.", "public", NOW - 20 * HOUR],
    ["Noura Al-Dossari", "event.published", "Published the Franchise Readiness Workshop — free for members.", "نشرت ورشة جاهزية الامتياز التجاري — مجاناً للأعضاء.", "public", NOW - 32 * HOUR, "/events"],
    ["Lion City Brand Partners", "registration.confirmed", "Confirmed two seats at the Riyadh Franchise Forum 2026.", "أكّدت حجز مقعدين في ملتقى الرياض للامتياز التجاري 2026.", "public", NOW - 2 * DAY, "/events"],
    ["Dr. Faisal Al-Harbi", "board.updated", "Updated the standing committee memberships for the 2026 term.", "حدّث عضوية اللجان الدائمة لدورة 2026.", "public", NOW - 3 * DAY, "/board"],
    ["Anatolia Retail Group", "membership.applied", "Submitted a franchisee membership application from Istanbul, Türkiye.", "قدّمت طلب عضوية ممنوح امتياز من إسطنبول، تركيا.", "public", NOW - 4 * DAY],
    ["Noura Al-Dossari", "event.proposed", "Proposed the Singapore Brand Showcase for board approval.", "اقترحت عرض العلامات في سنغافورة لاعتماد المجلس.", "internal", NOW - 4 * DAY],
    ["Gulf Equipment & Fit-Out", "supplier.accredited", "Renewed cooperative supplier accreditation for kitchen equipment.", "جدّدت اعتمادها كمورّد للتعاونية في معدات المطابخ.", "public", NOW - 6 * DAY],
    ["Dr. Faisal Al-Harbi", "assembly.scheduled", "Scheduled the Members' General Assembly and opened proxy registration.", "حدّد موعد الجمعية العمومية وفتح باب التسجيل بالوكالة.", "public", NOW - 8 * DAY, "/events"],
    ["Meridian Franchise Advisory", "member.joined", "Joined the cooperative as a service partner from London.", "انضمت إلى التعاونية كشريك خدمات من لندن.", "public", NOW - 12 * DAY],
  ];
  for (const [actorName, action, en, ar, visibility, at, link] of feed) {
    db.activity.push({
      id: id(),
      actorName,
      action,
      detail: { en, ar },
      visibility,
      link,
      createdAt: at,
    });
  }

  return db;
}
