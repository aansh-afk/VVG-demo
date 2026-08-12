import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { read, mutate, newId } from "./db";
import { Role, User } from "./models";

export { hashPassword, verifyPassword } from "./auth-hash";

const SESSION_COOKIE = "vvg_session";
const LOCALE_COOKIE = "vvg_locale";
const SESSION_DAYS = 30;

/**
 * Signing key for session cookies. A stable SESSION_SECRET keeps people signed
 * in across deploys; without one we generate a per-boot key, which is safe but
 * logs everyone out whenever the server restarts.
 *
 * The generated key is parked on `globalThis` deliberately: a production build
 * bundles this module separately into each route, so a plain module-level
 * constant would give every route a *different* key and no cookie signed by one
 * route would verify in another.
 */
const globalKey = globalThis as typeof globalThis & { __vvgSessionSecret?: string };

const SECRET =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16
    ? process.env.SESSION_SECRET
    : (globalKey.__vvgSessionSecret ??= randomBytes(32).toString("hex"));

/* --------------------------------------------------------------- sessions */

function sign(sessionId: string): string {
  const mac = createHmac("sha256", SECRET).update(sessionId).digest("hex");
  return `${sessionId}.${mac}`;
}

function unsign(token: string | undefined): string | null {
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return null;
  const id = token.slice(0, idx);
  const mac = token.slice(idx + 1);
  const expected = createHmac("sha256", SECRET).update(id).digest("hex");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return id;
}

export async function createSession(userId: string): Promise<void> {
  const id = newId();
  const now = Date.now();
  await mutate((db) => {
    // Drop this user's expired sessions while we're here.
    db.sessions = db.sessions.filter((s) => s.expiresAt > now);
    db.sessions.push({
      id,
      userId,
      createdAt: now,
      expiresAt: now + SESSION_DAYS * 86_400_000,
    });
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, sign(id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const id = unsign(jar.get(SESSION_COOKIE)?.value);
  if (id) await mutate((db) => void (db.sessions = db.sessions.filter((s) => s.id !== id)));
  jar.delete(SESSION_COOKIE);
}

/** The signed-in user, or null. Safe to call from any server component. */
export async function currentUser(): Promise<User | null> {
  const jar = await cookies();
  const id = unsign(jar.get(SESSION_COOKIE)?.value);
  if (!id) return null;
  const db = await read();
  const session = db.sessions.find((s) => s.id === id);
  if (!session || session.expiresAt < Date.now()) return null;
  const user = db.users.find((u) => u.id === session.userId);
  if (!user || !user.active) return null;
  return user;
}

/* ------------------------------------------------------------------ roles */

const RANK: Record<Role, number> = { member: 1, admin: 2, super_admin: 3 };

export function atLeast(user: User | null, role: Role): boolean {
  return !!user && RANK[user.role] >= RANK[role];
}

/** Throws unless the caller holds `role` or higher. Use in every server action. */
export async function requireRole(role: Role): Promise<User> {
  const user = await currentUser();
  if (!user) throw new Error("You must be signed in to do that.");
  if (!atLeast(user, role)) throw new Error("You do not have permission to do that.");
  return user;
}

export async function requireUser(): Promise<User> {
  return requireRole("member");
}

/**
 * For server components under /portal. A layout's `redirect()` does not stop
 * the page beneath it from rendering, so each page re-checks for itself rather
 * than assuming the layout already guaranteed a session.
 */
export async function pageUser(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  return user;
}

/** Same, but also enforces a minimum role — redirects instead of throwing. */
export async function pageRole(role: Role): Promise<User> {
  const user = await pageUser();
  if (!atLeast(user, role)) redirect("/portal");
  return user;
}

/* ----------------------------------------------------------------- locale */

export async function getLocale(): Promise<"en" | "ar"> {
  const jar = await cookies();
  return jar.get(LOCALE_COOKIE)?.value === "ar" ? "ar" : "en";
}

export async function setLocaleCookie(locale: "en" | "ar"): Promise<void> {
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 365 * 86_400, sameSite: "lax" });
}
