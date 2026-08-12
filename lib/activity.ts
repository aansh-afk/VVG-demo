import { Database, ActivityEntry, Bi } from "./models";
import { newId } from "./db";

/**
 * Append-only activity log. Internal entries form the audit trail that admins
 * see; public entries are also rendered on the site's live activity feed.
 *
 * Call this inside an existing `mutate` callback so the log entry and the
 * change it describes are persisted in the same write.
 */
export function log(
  db: Database,
  entry: {
    actorId?: string;
    actorName: string;
    action: string;
    detail: Bi;
    visibility?: "public" | "internal";
    link?: string;
    at?: number;
  }
): ActivityEntry {
  const record: ActivityEntry = {
    id: newId(),
    actorId: entry.actorId,
    actorName: entry.actorName,
    action: entry.action,
    detail: entry.detail,
    visibility: entry.visibility ?? "internal",
    link: entry.link,
    createdAt: entry.at ?? Date.now(),
  };
  db.activity.push(record);
  // Keep the log bounded so a long-running demo instance stays responsive.
  if (db.activity.length > 5000) db.activity.splice(0, db.activity.length - 5000);
  return record;
}

export function recentActivity(
  db: Database,
  opts: { visibility?: "public" | "internal" | "all"; limit?: number } = {}
): ActivityEntry[] {
  const { visibility = "all", limit = 50 } = opts;
  return db.activity
    .filter((a) => visibility === "all" || a.visibility === visibility)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}
