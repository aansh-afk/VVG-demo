import { read } from "./db";
import { CoopEvent, Database, Organization } from "./models";

/** Read helpers shared by the public pages and the portal. */

export async function db(): Promise<Database> {
  return await read();
}

/** Seats already committed against an event (confirmed or attended). */
export function seatsTaken(d: Database, eventId: string): number {
  return d.registrations
    .filter((r) => r.eventId === eventId && (r.status === "confirmed" || r.status === "attended"))
    .reduce((n, r) => n + r.seats, 0);
}

/** Events visible to the public: published and currently-running ones. */
export function publicEvents(d: Database): CoopEvent[] {
  return d.events
    .filter((e) => e.status === "published" || e.status === "live" || e.status === "completed")
    .sort((a, b) => a.startsAt - b.startsAt);
}

export function upcomingEvents(d: Database, now: number): CoopEvent[] {
  return publicEvents(d).filter((e) => e.endsAt >= now && e.status !== "completed");
}

export function pastEvents(d: Database, now: number): CoopEvent[] {
  return publicEvents(d)
    .filter((e) => e.endsAt < now || e.status === "completed")
    .sort((a, b) => b.startsAt - a.startsAt);
}

export function verifiedOrgs(d: Database): Organization[] {
  return d.organizations
    .filter((o) => o.verification === "verified")
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function publishedOpportunities(d: Database) {
  return d.opportunities
    .filter((o) => o.status === "published")
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function orgOf(d: Database, id: string | undefined) {
  return id ? d.organizations.find((o) => o.id === id) : undefined;
}

export function pendingApprovals(d: Database) {
  return d.approvals
    .filter((a) => a.status === "pending")
    .sort((a, b) => a.createdAt - b.createdAt);
}

/** A Google Maps search link, used wherever an address is displayed. */
export function mapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
