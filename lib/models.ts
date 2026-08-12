/**
 * Domain model for the VVG Franchisee Marketing Cooperative Portal.
 *
 * Every record is a plain serialisable object so the same shapes work across
 * all three storage drivers (Postgres / JSON file / memory) without mapping.
 */

export type Locale = "en" | "ar";

/** Platform-wide authority. Members hold `member`; staff hold the rest. */
export type Role = "super_admin" | "admin" | "member";

export type MemberType =
  | "franchisor"
  | "franchisee"
  | "supplier"
  | "service_partner"
  | "chamber_partner";

export type VerificationStatus = "pending" | "verified" | "rejected" | "suspended";

/** Bilingual string. `ar` is authored, never machine-translated. */
export interface Bi {
  en: string;
  ar: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  fullNameAr?: string;
  jobTitle?: string;
  phone?: string;
  locale: Locale;
  role: Role;
  organizationId?: string;
  /** Set false by an admin to block sign-in without deleting history. */
  active: boolean;
  createdAt: number;
  lastSeenAt?: number;
}

export interface Organization {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  type: MemberType;
  country: string;
  city?: string;
  sector: string;
  about: Bi;
  website?: string;
  contactEmail: string;
  contactPhone?: string;
  /** Free-form public brand/product data the member uploads themselves. */
  brands: string[];
  outletCount?: number;
  foundedYear?: number;
  logoInitials: string;
  verification: VerificationStatus;
  verificationNote?: string;
  membershipPlan: string;
  createdBy: string;
  createdAt: number;
  decidedAt?: number;
  decidedBy?: string;
}

export type EventStatus = "draft" | "pending_approval" | "published" | "live" | "completed" | "cancelled";

export type EventFormat = "in_person" | "virtual" | "hybrid";

/**
 * Events & activities are this cooperative's headline module — they replace the
 * embassy directory that sat in the same slot on the sister (WASL) portal.
 */
export interface CoopEvent {
  id: string;
  slug: string;
  title: Bi;
  summary: Bi;
  description: Bi;
  category: string;
  format: EventFormat;
  venue: Bi;
  city: string;
  country: string;
  mapQuery?: string;
  startsAt: number;
  endsAt: number;
  capacity: number;
  /** 0 means free. Currency is SAR throughout. */
  feeSar: number;
  organiserOrgId?: string;
  contactEmail: string;
  status: EventStatus;
  coverTone: string;
  agenda: { time: string; item: Bi }[];
  createdBy: string;
  createdAt: number;
}

export type RegistrationStatus = "pending" | "confirmed" | "waitlisted" | "declined" | "attended";

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  organizationId?: string;
  attendeeName: string;
  attendeeEmail: string;
  seats: number;
  note?: string;
  status: RegistrationStatus;
  createdAt: number;
  decidedAt?: number;
  decidedBy?: string;
}

export type OpportunityStatus = "draft" | "pending_approval" | "published" | "closed" | "rejected";

/** Cross-border franchise offers, e.g. a Saudi brand opening up Malaysia. */
export interface Opportunity {
  id: string;
  slug: string;
  organizationId: string;
  brandName: string;
  sector: string;
  homeCountry: string;
  targetCountries: string[];
  model: string;
  investmentFromSar: number;
  investmentToSar: number;
  royaltyPct?: number;
  summary: Bi;
  requirements: Bi;
  support: Bi;
  status: OpportunityStatus;
  createdBy: string;
  createdAt: number;
  decidedAt?: number;
  decidedBy?: string;
}

export interface Interest {
  id: string;
  opportunityId: string;
  userId: string;
  organizationId?: string;
  message: string;
  status: "new" | "in_review" | "accepted" | "declined";
  createdAt: number;
}

export interface BoardMember {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  title: Bi;
  /** 1 = Chairman, 2 = executive officers, 3 = board members, 4 = committees. */
  tier: number;
  order: number;
  bio: Bi;
  mandate: Bi;
  committees: Bi[];
  email: string;
  phone?: string;
  linkedin?: string;
  country: string;
  initials: string;
  photoUrl?: string;
  /** Tailwind gradient classes used for the portrait placeholder. */
  tone?: string;
  /** Placeholder record awaiting the cooperative's real governance data. */
  isDemo: boolean;
}

export interface Association {
  id: string;
  name: string;
  country: string;
  scope: "Global" | "Regional" | "National";
  address?: string;
  phone?: string;
  website?: string;
  officers?: { name: string; role: string }[];
  source: string;
}

export type InfoKind = "government" | "chamber" | "association_partner" | "support";

export interface InfoEntry {
  id: string;
  kind: InfoKind;
  name: Bi;
  country: string;
  city?: string;
  website?: string;
  phone?: string;
  contactPerson?: string;
  contactEmail?: string;
  notes: Bi;
  /** false = official public link captured but not yet confirmed by the team. */
  verified: boolean;
}

export type ApprovalKind =
  | "organization_verification"
  | "event_publication"
  | "event_registration"
  | "opportunity_publication"
  | "membership_upgrade";

export type ApprovalStatus = "pending" | "approved" | "rejected";

/**
 * The approvals queue is the system of record. Nothing in this portal is
 * approved over email — decisions are taken here and logged forever.
 */
export interface Approval {
  id: string;
  kind: ApprovalKind;
  subjectId: string;
  title: Bi;
  detail: string;
  requestedBy: string;
  requestedByName: string;
  status: ApprovalStatus;
  decidedBy?: string;
  decidedByName?: string;
  decisionNote?: string;
  createdAt: number;
  decidedAt?: number;
}

export interface Thread {
  id: string;
  subject: string;
  /** "general" = the cooperative-wide channel; otherwise a private thread. */
  kind: "general" | "direct" | "org";
  participantIds: string[];
  createdBy: string;
  createdAt: number;
  lastMessageAt: number;
}

export interface Message {
  id: string;
  threadId: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: number;
}

export interface EmailDraft {
  id: string;
  userId: string;
  purpose: string;
  transcript: string;
  recipientName?: string;
  recipientEmail?: string;
  subjectEn: string;
  bodyEn: string;
  subjectAr: string;
  bodyAr: string;
  detectedLanguage: Locale;
  createdAt: number;
}

/** Append-only. Drives both the audit trail and the public live-activity feed. */
export interface ActivityEntry {
  id: string;
  actorId?: string;
  actorName: string;
  action: string;
  detail: Bi;
  /** Public entries surface on the site's live activity feed. */
  visibility: "public" | "internal";
  link?: string;
  createdAt: number;
}

export interface MembershipPlan {
  id: string;
  key: string;
  name: Bi;
  audience: Bi;
  priceYearlySar: number;
  features: Bi[];
  /** Pricing is a working assumption until the board ratifies it. */
  isAssumption: boolean;
  highlight?: boolean;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

/** The whole portal state. One document, three interchangeable drivers. */
export interface Database {
  version: number;
  users: User[];
  organizations: Organization[];
  events: CoopEvent[];
  registrations: EventRegistration[];
  opportunities: Opportunity[];
  interests: Interest[];
  board: BoardMember[];
  associations: Association[];
  infoEntries: InfoEntry[];
  approvals: Approval[];
  threads: Thread[];
  messages: Message[];
  drafts: EmailDraft[];
  activity: ActivityEntry[];
  plans: MembershipPlan[];
  sessions: Session[];
}

export const EMPTY_DB: Database = {
  version: 1,
  users: [],
  organizations: [],
  events: [],
  registrations: [],
  opportunities: [],
  interests: [],
  board: [],
  associations: [],
  infoEntries: [],
  approvals: [],
  threads: [],
  messages: [],
  drafts: [],
  activity: [],
  plans: [],
  sessions: [],
};
