"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { mutate, newId, read, resetToSeed } from "@/lib/db";
import { log } from "@/lib/activity";
import { generateDraft } from "@/lib/ai";
import {
  atLeast,
  createSession,
  currentUser,
  destroySession,
  hashPassword,
  requireRole,
  setLocaleCookie,
  verifyPassword,
} from "@/lib/auth";
import { Approval, MemberType, Organization, Role } from "@/lib/models";

/**
 * Every write in the portal goes through one of these server actions. Each one
 * re-checks the caller's role server-side — the UI hides what you cannot do,
 * but the check that matters happens here.
 */

export type ActionState = { error?: string; ok?: string } | null;

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function str(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

/* ------------------------------------------------------------------ locale */

export async function switchLocale(locale: "en" | "ar", path: string) {
  await setLocaleCookie(locale);
  revalidatePath("/", "layout");
  redirect(path || "/");
}

/* -------------------------------------------------------------------- auth */

export async function signIn(_prev: ActionState, form: FormData): Promise<ActionState> {
  const email = str(form, "email").toLowerCase();
  const password = str(form, "password");
  if (!email || !password) return { error: "Enter your email address and password." };

  const db = await read();
  const user = db.users.find((u) => u.email === email);
  // One message for both cases so the form cannot be used to enumerate accounts.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Those credentials do not match an account." };
  }
  if (!user.active) return { error: "This account has been suspended. Contact the secretariat." };

  await mutate((d) => {
    const u = d.users.find((x) => x.id === user.id);
    if (u) u.lastSeenAt = Date.now();
  });
  await createSession(user.id);
  redirect("/portal");
}

export async function signUp(_prev: ActionState, form: FormData): Promise<ActionState> {
  const email = str(form, "email").toLowerCase();
  const password = str(form, "password");
  const fullName = str(form, "fullName");
  const orgName = str(form, "orgName");

  if (!email.includes("@")) return { error: "Enter a valid email address." };
  if (password.length < 8) return { error: "Choose a password of at least 8 characters." };
  if (!fullName) return { error: "Enter your full name." };
  if (!orgName) return { error: "Enter your organisation's name." };

  const db = await read();
  if (db.users.some((u) => u.email === email)) {
    return { error: "An account already exists for that email address." };
  }

  const now = Date.now();
  const userId = newId();
  const orgId = newId();
  const type = (str(form, "type") || "franchisee") as MemberType;

  await mutate((d) => {
    const org: Organization = {
      id: orgId,
      slug: slugify(orgName) || orgId.slice(0, 8),
      name: orgName,
      nameAr: str(form, "orgNameAr") || orgName,
      type,
      country: str(form, "country") || "Saudi Arabia",
      city: str(form, "city") || undefined,
      sector: str(form, "sector") || "General",
      about: { en: str(form, "about"), ar: str(form, "aboutAr") || str(form, "about") },
      website: str(form, "website") || undefined,
      contactEmail: email,
      contactPhone: str(form, "phone") || undefined,
      brands: str(form, "brands")
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean),
      logoInitials: orgName.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase(),
      verification: "pending",
      membershipPlan: type === "franchisor" ? "franchisor" : type === "supplier" ? "supplier" : "franchisee",
      createdBy: userId,
      createdAt: now,
    };
    d.organizations.push(org);

    d.users.push({
      id: userId,
      email,
      passwordHash: "",
      fullName,
      fullNameAr: str(form, "fullNameAr") || undefined,
      jobTitle: str(form, "jobTitle") || undefined,
      phone: str(form, "phone") || undefined,
      locale: str(form, "locale") === "ar" ? "ar" : "en",
      role: "member",
      organizationId: orgId,
      active: true,
      createdAt: now,
    });

    d.approvals.push({
      id: newId(),
      kind: "organization_verification",
      subjectId: orgId,
      title: { en: `Verify membership: ${orgName}`, ar: `توثيق عضوية: ${orgName}` },
      detail: `${type} · ${org.city ?? ""}${org.city ? ", " : ""}${org.country} · ${org.sector}`,
      requestedBy: userId,
      requestedByName: fullName,
      status: "pending",
      createdAt: now,
    });

    log(d, {
      actorId: userId,
      actorName: orgName,
      action: "membership.applied",
      detail: {
        en: `Submitted a ${type.replace("_", " ")} membership application from ${org.city ?? org.country}.`,
        ar: `قدّمت طلب عضوية من ${org.city ?? org.country}.`,
      },
      visibility: "public",
      at: now,
    });
  });

  // Hash outside the first mutate so the write lock is not held during scrypt.
  const hash = await hashPassword(password);
  await mutate((d) => {
    const u = d.users.find((x) => x.id === userId);
    if (u) u.passwordHash = hash;
  });

  await createSession(userId);
  redirect("/portal");
}

export async function signOut() {
  await destroySession();
  redirect("/");
}

/* ------------------------------------------------------------------ events */

export async function registerForEvent(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return { error: "Sign in to register for cooperative events." };

  const eventId = str(form, "eventId");
  const seats = Math.max(1, Math.min(10, Number(str(form, "seats") || "1")));
  const note = str(form, "note");

  const result = await mutate((d) => {
    const ev = d.events.find((e) => e.id === eventId);
    if (!ev) return { error: "That event no longer exists." };
    if (d.registrations.some((r) => r.eventId === eventId && r.userId === user.id && r.status !== "declined")) {
      return { error: "You already have a registration for this event." };
    }
    const taken = d.registrations
      .filter((r) => r.eventId === eventId && (r.status === "confirmed" || r.status === "attended"))
      .reduce((n, r) => n + r.seats, 0);

    const regId = newId();
    const now = Date.now();
    d.registrations.push({
      id: regId,
      eventId,
      userId: user.id,
      organizationId: user.organizationId,
      attendeeName: user.fullName,
      attendeeEmail: user.email,
      seats,
      note: note || undefined,
      status: taken + seats > ev.capacity ? "waitlisted" : "pending",
      createdAt: now,
    });
    d.approvals.push({
      id: newId(),
      kind: "event_registration",
      subjectId: regId,
      title: {
        en: `Registration: ${user.fullName} → ${ev.title.en}`,
        ar: `تسجيل: ${user.fullName} ← ${ev.title.ar}`,
      },
      detail: `${seats} seat(s) · ${user.email}${note ? ` · ${note}` : ""}`,
      requestedBy: user.id,
      requestedByName: user.fullName,
      status: "pending",
      createdAt: now,
    });
    log(d, {
      actorId: user.id,
      actorName: user.fullName,
      action: "registration.requested",
      detail: {
        en: `Requested ${seats} seat(s) at ${ev.title.en}.`,
        ar: `طلب ${seats} مقعد في ${ev.title.ar}.`,
      },
      visibility: "public",
      link: `/events/${ev.slug}`,
      at: now,
    });
    return { ok: "Your registration has been submitted to the organiser's approval queue." };
  });

  revalidatePath("/events");
  revalidatePath("/portal");
  return result;
}

export async function saveEvent(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireRole("admin");
  const eventId = str(form, "eventId");
  const titleEn = str(form, "titleEn");
  if (!titleEn) return { error: "The event needs an English title." };

  const startsAt = Date.parse(str(form, "startsAt") || "") || Date.now() + 7 * 86_400_000;
  const hours = Math.max(1, Number(str(form, "durationHours") || "8"));

  const result = await mutate((d) => {
    const now = Date.now();
    const payload = {
      title: { en: titleEn, ar: str(form, "titleAr") || titleEn },
      summary: { en: str(form, "summaryEn"), ar: str(form, "summaryAr") || str(form, "summaryEn") },
      description: {
        en: str(form, "descriptionEn"),
        ar: str(form, "descriptionAr") || str(form, "descriptionEn"),
      },
      category: str(form, "category") || "Event",
      format: (str(form, "format") || "in_person") as any,
      venue: { en: str(form, "venueEn"), ar: str(form, "venueAr") || str(form, "venueEn") },
      city: str(form, "city"),
      country: str(form, "country"),
      mapQuery: str(form, "venueEn") || undefined,
      startsAt,
      endsAt: startsAt + hours * 3_600_000,
      capacity: Math.max(1, Number(str(form, "capacity") || "50")),
      feeSar: Math.max(0, Number(str(form, "feeSar") || "0")),
      contactEmail: str(form, "contactEmail") || "events@vvg-cooperative.org",
    };

    if (eventId) {
      const ev = d.events.find((e) => e.id === eventId);
      if (!ev) return { error: "That event no longer exists." };
      Object.assign(ev, payload);
      log(d, {
        actorId: user.id,
        actorName: user.fullName,
        action: "event.updated",
        detail: { en: `Updated the event ${titleEn}.`, ar: `حدّث الفعالية ${payload.title.ar}.` },
        visibility: "internal",
        at: now,
      });
      return { ok: "Event updated." };
    }

    const id = newId();
    d.events.push({
      id,
      slug: slugify(titleEn) || id.slice(0, 8),
      ...payload,
      status: "draft",
      coverTone: "from-brand-700 via-brand-600 to-gold-500",
      agenda: [],
      createdBy: user.id,
      createdAt: now,
    });
    log(d, {
      actorId: user.id,
      actorName: user.fullName,
      action: "event.created",
      detail: { en: `Created the event ${titleEn} as a draft.`, ar: `أنشأ الفعالية ${payload.title.ar} كمسودة.` },
      visibility: "internal",
      at: now,
    });
    return { ok: "Event created as a draft. Submit it for approval when it is ready." };
  });

  revalidatePath("/portal/admin/events");
  revalidatePath("/events");
  return result;
}

export async function setEventStatus(eventId: string, status: string) {
  const user = await requireRole("admin");
  await mutate((d) => {
    const ev = d.events.find((e) => e.id === eventId);
    if (!ev) return;
    const now = Date.now();

    // Publishing is a board decision, so an admin request goes to the queue and
    // only a super admin can push it straight through.
    if (status === "published" && !atLeast(user, "super_admin")) {
      ev.status = "pending_approval";
      d.approvals.push({
        id: newId(),
        kind: "event_publication",
        subjectId: ev.id,
        title: { en: `Publish event: ${ev.title.en}`, ar: `نشر فعالية: ${ev.title.ar}` },
        detail: `${ev.category} · ${ev.city} · capacity ${ev.capacity}`,
        requestedBy: user.id,
        requestedByName: user.fullName,
        status: "pending",
        createdAt: now,
      });
      log(d, {
        actorId: user.id,
        actorName: user.fullName,
        action: "event.proposed",
        detail: { en: `Submitted ${ev.title.en} for publication approval.`, ar: `قدّم ${ev.title.ar} لاعتماد النشر.` },
        visibility: "internal",
        at: now,
      });
      return;
    }

    ev.status = status as any;
    log(d, {
      actorId: user.id,
      actorName: user.fullName,
      action: `event.${status}`,
      detail: {
        en: `Set ${ev.title.en} to ${status.replace("_", " ")}.`,
        ar: `غيّر حالة ${ev.title.ar} إلى ${status.replace("_", " ")}.`,
      },
      visibility: status === "published" || status === "live" ? "public" : "internal",
      link: `/events/${ev.slug}`,
      at: now,
    });
  });
  revalidatePath("/portal/admin/events");
  revalidatePath("/events");
}

/* ----------------------------------------------------------- opportunities */

export async function saveOpportunity(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireRole("member");
  if (!user.organizationId) return { error: "Your account is not linked to an organisation." };

  const db = await read();
  const org = db.organizations.find((o) => o.id === user.organizationId);
  if (!org) return { error: "Your organisation record could not be found." };
  if (org.verification !== "verified") {
    return { error: "Your organisation must be verified before you can publish opportunities." };
  }

  const brandName = str(form, "brandName");
  if (!brandName) return { error: "Enter the brand name." };

  const oppId = str(form, "opportunityId");
  const submit = str(form, "intent") === "submit";

  const result = await mutate((d) => {
    const now = Date.now();
    const payload = {
      brandName,
      sector: str(form, "sector") || org.sector,
      homeCountry: str(form, "homeCountry") || org.country,
      targetCountries: str(form, "targetCountries")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      model: str(form, "model") || "Master franchise",
      investmentFromSar: Math.max(0, Number(str(form, "investmentFrom") || "0")),
      investmentToSar: Math.max(0, Number(str(form, "investmentTo") || "0")),
      royaltyPct: Number(str(form, "royalty") || "0") || undefined,
      summary: { en: str(form, "summaryEn"), ar: str(form, "summaryAr") || str(form, "summaryEn") },
      requirements: {
        en: str(form, "requirementsEn"),
        ar: str(form, "requirementsAr") || str(form, "requirementsEn"),
      },
      support: { en: str(form, "supportEn"), ar: str(form, "supportAr") || str(form, "supportEn") },
    };

    let opp = oppId ? d.opportunities.find((o) => o.id === oppId) : undefined;
    if (oppId && !opp) return { error: "That opportunity no longer exists." };
    if (opp && opp.organizationId !== org.id) return { error: "That opportunity belongs to another member." };

    if (!opp) {
      const id = newId();
      opp = {
        id,
        slug: slugify(`${brandName}-${payload.targetCountries[0] ?? org.country}`) || id.slice(0, 8),
        organizationId: org.id,
        ...payload,
        status: "draft",
        createdBy: user.id,
        createdAt: now,
      };
      d.opportunities.push(opp);
    } else {
      Object.assign(opp, payload);
    }

    if (submit) {
      opp.status = "pending_approval";
      d.approvals.push({
        id: newId(),
        kind: "opportunity_publication",
        subjectId: opp.id,
        title: { en: `Publish opportunity: ${brandName}`, ar: `نشر فرصة: ${brandName}` },
        detail: `${payload.model} · ${payload.targetCountries.join(", ")}`,
        requestedBy: user.id,
        requestedByName: user.fullName,
        status: "pending",
        createdAt: now,
      });
      log(d, {
        actorId: user.id,
        actorName: org.name,
        action: "opportunity.submitted",
        detail: {
          en: `Submitted the ${brandName} franchise opportunity for publication.`,
          ar: `قدّمت فرصة الامتياز لعلامة ${brandName} للنشر.`,
        },
        visibility: "internal",
        at: now,
      });
      return { ok: "Submitted to the approvals queue. It publishes once approved." };
    }
    return { ok: "Saved as a draft." };
  });

  revalidatePath("/portal/opportunities");
  revalidatePath("/opportunities");
  return result;
}

export async function expressInterest(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return { error: "Sign in to contact a member about an opportunity." };
  const opportunityId = str(form, "opportunityId");
  const message = str(form, "message");
  if (message.length < 20) return { error: "Write at least a couple of sentences about your interest." };

  const result = await mutate((d) => {
    const opp = d.opportunities.find((o) => o.id === opportunityId);
    if (!opp) return { error: "That opportunity is no longer listed." };
    if (d.interests.some((i) => i.opportunityId === opportunityId && i.userId === user.id)) {
      return { error: "You have already registered your interest in this opportunity." };
    }
    const now = Date.now();
    d.interests.push({
      id: newId(),
      opportunityId,
      userId: user.id,
      organizationId: user.organizationId,
      message,
      status: "new",
      createdAt: now,
    });
    const org = d.organizations.find((o) => o.id === user.organizationId);
    log(d, {
      actorId: user.id,
      actorName: org?.name ?? user.fullName,
      action: "interest.expressed",
      detail: {
        en: `Expressed interest in the ${opp.brandName} franchise opportunity.`,
        ar: `سجّلت اهتمامها بفرصة الامتياز لعلامة ${opp.brandName}.`,
      },
      visibility: "public",
      link: `/opportunities/${opp.slug}`,
      at: now,
    });
    return { ok: "Your interest has been delivered inside the portal to the brand's member account." };
  });

  revalidatePath("/opportunities");
  return result;
}

/* --------------------------------------------------------------- approvals */

export async function decideApproval(approvalId: string, decision: "approved" | "rejected", note: string) {
  const user = await requireRole("admin");
  await mutate((d) => {
    const ap = d.approvals.find((a) => a.id === approvalId);
    if (!ap || ap.status !== "pending") return;
    const now = Date.now();
    ap.status = decision;
    ap.decidedBy = user.id;
    ap.decidedByName = user.fullName;
    ap.decisionNote = note || undefined;
    ap.decidedAt = now;
    applyDecision(d, ap, decision, user.id, user.fullName, now);
  });
  revalidatePath("/portal/approvals");
  revalidatePath("/portal");
  revalidatePath("/members");
  revalidatePath("/events");
  revalidatePath("/opportunities");
}

/** Applies the side effect a decision implies, and records it in the log. */
function applyDecision(
  d: Awaited<ReturnType<typeof read>>,
  ap: Approval,
  decision: "approved" | "rejected",
  actorId: string,
  actorName: string,
  now: number
) {
  const approved = decision === "approved";
  switch (ap.kind) {
    case "organization_verification": {
      const org = d.organizations.find((o) => o.id === ap.subjectId);
      if (!org) return;
      org.verification = approved ? "verified" : "rejected";
      org.decidedAt = now;
      org.decidedBy = actorId;
      log(d, {
        actorId,
        actorName,
        action: approved ? "member.verified" : "member.rejected",
        detail: {
          en: approved
            ? `${org.name} was verified as a cooperative member.`
            : `The membership application from ${org.name} was declined.`,
          ar: approved
            ? `تم توثيق ${org.nameAr} كعضو في التعاونية.`
            : `تم رفض طلب عضوية ${org.nameAr}.`,
        },
        visibility: approved ? "public" : "internal",
        link: approved ? `/members/${org.slug}` : undefined,
        at: now,
      });
      return;
    }
    case "event_publication": {
      const ev = d.events.find((e) => e.id === ap.subjectId);
      if (!ev) return;
      ev.status = approved ? "published" : "draft";
      log(d, {
        actorId,
        actorName,
        action: approved ? "event.published" : "event.publication_declined",
        detail: {
          en: approved ? `Published ${ev.title.en}.` : `Returned ${ev.title.en} to draft.`,
          ar: approved ? `نشر ${ev.title.ar}.` : `أعاد ${ev.title.ar} إلى المسودة.`,
        },
        visibility: approved ? "public" : "internal",
        link: `/events/${ev.slug}`,
        at: now,
      });
      return;
    }
    case "event_registration": {
      const reg = d.registrations.find((r) => r.id === ap.subjectId);
      if (!reg) return;
      reg.status = approved ? "confirmed" : "declined";
      reg.decidedAt = now;
      reg.decidedBy = actorId;
      const ev = d.events.find((e) => e.id === reg.eventId);
      log(d, {
        actorId,
        actorName,
        action: approved ? "registration.confirmed" : "registration.declined",
        detail: {
          en: approved
            ? `Confirmed ${reg.seats} seat(s) for ${reg.attendeeName} at ${ev?.title.en ?? "an event"}.`
            : `Declined the registration from ${reg.attendeeName}.`,
          ar: approved
            ? `أكّد ${reg.seats} مقعد لـ ${reg.attendeeName} في ${ev?.title.ar ?? "فعالية"}.`
            : `رفض تسجيل ${reg.attendeeName}.`,
        },
        visibility: approved ? "public" : "internal",
        link: ev ? `/events/${ev.slug}` : undefined,
        at: now,
      });
      return;
    }
    case "opportunity_publication": {
      const opp = d.opportunities.find((o) => o.id === ap.subjectId);
      if (!opp) return;
      opp.status = approved ? "published" : "rejected";
      opp.decidedAt = now;
      opp.decidedBy = actorId;
      log(d, {
        actorId,
        actorName,
        action: approved ? "opportunity.published" : "opportunity.declined",
        detail: {
          en: approved
            ? `Published the ${opp.brandName} franchise opportunity for ${opp.targetCountries.join(", ")}.`
            : `Declined the ${opp.brandName} opportunity.`,
          ar: approved
            ? `نشر فرصة الامتياز لعلامة ${opp.brandName} في ${opp.targetCountries.join("، ")}.`
            : `رفض فرصة ${opp.brandName}.`,
        },
        visibility: approved ? "public" : "internal",
        link: `/opportunities/${opp.slug}`,
        at: now,
      });
      return;
    }
    default:
      log(d, {
        actorId,
        actorName,
        action: "approval.decided",
        detail: { en: `${decision} — ${ap.title.en}`, ar: `${decision} — ${ap.title.ar}` },
        visibility: "internal",
        at: now,
      });
  }
}

/* ---------------------------------------------------------------- messages */

export async function postMessage(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireRole("member");
  const body = str(form, "body");
  if (!body) return { error: "Write a message first." };

  await mutate((d) => {
    let thread = d.threads.find((t) => t.kind === "general");
    if (!thread) {
      thread = {
        id: newId(),
        subject: "Cooperative-wide channel",
        kind: "general",
        participantIds: [],
        createdBy: user.id,
        createdAt: Date.now(),
        lastMessageAt: Date.now(),
      };
      d.threads.push(thread);
    }
    const now = Date.now();
    d.messages.push({
      id: newId(),
      threadId: thread.id,
      userId: user.id,
      userName: user.fullName,
      body,
      createdAt: now,
    });
    thread.lastMessageAt = now;
  });

  revalidatePath("/portal/messages");
  return { ok: "Posted." };
}

/* ------------------------------------------------------------ AI composer */

export async function generateMessage(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireRole("member");
  const transcript = str(form, "transcript");
  if (transcript.length < 10) {
    return { error: "Dictate or type a little more so the draft has something to work with." };
  }

  const db = await read();
  const org = db.organizations.find((o) => o.id === user.organizationId);
  const draft = generateDraft({
    purpose: str(form, "purpose") || "inquiry",
    transcript,
    senderName: user.fullName,
    senderTitle: user.jobTitle,
    recipientName: str(form, "recipientName") || undefined,
    organisation: org?.name,
  });

  await mutate((d) => {
    d.drafts.push({
      id: newId(),
      userId: user.id,
      purpose: str(form, "purpose") || "inquiry",
      transcript,
      recipientName: str(form, "recipientName") || undefined,
      recipientEmail: str(form, "recipientEmail") || undefined,
      ...draft,
      createdAt: Date.now(),
    });
    // Keep each member's draft history to the most recent 30.
    const mine = d.drafts.filter((x) => x.userId === user.id).sort((a, b) => a.createdAt - b.createdAt);
    if (mine.length > 30) {
      const drop = new Set(mine.slice(0, mine.length - 30).map((x) => x.id));
      d.drafts = d.drafts.filter((x) => !drop.has(x.id));
    }
  });

  revalidatePath("/portal/compose");
  return { ok: "Draft generated." };
}

/* -------------------------------------------------------- admin: profiles */

export async function updateProfile(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireRole("member");
  await mutate((d) => {
    const u = d.users.find((x) => x.id === user.id);
    if (!u) return;
    u.fullName = str(form, "fullName") || u.fullName;
    u.fullNameAr = str(form, "fullNameAr") || u.fullNameAr;
    u.jobTitle = str(form, "jobTitle") || u.jobTitle;
    u.phone = str(form, "phone") || u.phone;

    const org = d.organizations.find((o) => o.id === u.organizationId);
    if (org) {
      org.name = str(form, "orgName") || org.name;
      org.nameAr = str(form, "orgNameAr") || org.nameAr;
      org.sector = str(form, "sector") || org.sector;
      org.city = str(form, "city") || org.city;
      org.country = str(form, "country") || org.country;
      org.website = str(form, "website") || org.website;
      org.about = {
        en: str(form, "aboutEn") || org.about.en,
        ar: str(form, "aboutAr") || org.about.ar,
      };
      org.brands = str(form, "brands")
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean);
      const outlets = Number(str(form, "outletCount"));
      if (!Number.isNaN(outlets) && outlets > 0) org.outletCount = outlets;
    }
  });
  revalidatePath("/portal/organization");
  return { ok: "Saved." };
}

/* ------------------------------------------------- super admin: users etc */

export async function setUserRole(userId: string, role: Role) {
  const admin = await requireRole("super_admin");
  await mutate((d) => {
    const u = d.users.find((x) => x.id === userId);
    if (!u || u.id === admin.id) return; // never let a super admin demote themselves
    u.role = role;
    log(d, {
      actorId: admin.id,
      actorName: admin.fullName,
      action: "user.role_changed",
      detail: { en: `Set ${u.fullName} to ${role}.`, ar: `عيّن ${u.fullName} بصلاحية ${role}.` },
      visibility: "internal",
    });
  });
  revalidatePath("/portal/admin/users");
}

export async function setUserActive(userId: string, active: boolean) {
  const admin = await requireRole("super_admin");
  await mutate((d) => {
    const u = d.users.find((x) => x.id === userId);
    if (!u || u.id === admin.id) return;
    u.active = active;
    if (!active) d.sessions = d.sessions.filter((s) => s.userId !== userId);
    log(d, {
      actorId: admin.id,
      actorName: admin.fullName,
      action: active ? "user.reinstated" : "user.suspended",
      detail: {
        en: `${active ? "Reinstated" : "Suspended"} the account of ${u.fullName}.`,
        ar: `${active ? "أعاد تفعيل" : "أوقف"} حساب ${u.fullName}.`,
      },
      visibility: "internal",
    });
  });
  revalidatePath("/portal/admin/users");
}

export async function setOrgVerification(orgId: string, status: Organization["verification"]) {
  const admin = await requireRole("super_admin");
  await mutate((d) => {
    const org = d.organizations.find((o) => o.id === orgId);
    if (!org) return;
    org.verification = status;
    org.decidedAt = Date.now();
    org.decidedBy = admin.id;
    log(d, {
      actorId: admin.id,
      actorName: admin.fullName,
      action: `member.${status}`,
      detail: {
        en: `Set ${org.name} to ${status}.`,
        ar: `غيّر حالة ${org.nameAr} إلى ${status}.`,
      },
      visibility: status === "verified" ? "public" : "internal",
      link: `/members/${org.slug}`,
    });
  });
  revalidatePath("/portal/admin/members");
  revalidatePath("/members");
}

export async function resetDemoData() {
  const admin = await requireRole("super_admin");
  await resetToSeed();
  await mutate((d) => {
    log(d, {
      actorName: admin.fullName,
      action: "system.reset",
      detail: {
        en: "Reset the portal to its seed dataset.",
        ar: "أعاد ضبط البوابة إلى بياناتها الأولية.",
      },
      visibility: "internal",
    });
  });
  revalidatePath("/", "layout");
  redirect("/");
}
