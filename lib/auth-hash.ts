import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Password hashing lives in its own module so the seed builder can use it
 * without importing `auth.ts` — which imports the database, which imports the
 * seed. Same primitives, no import cycle.
 */

const scrypt = promisify(_scrypt) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hex] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hex) return false;
  const key = await scrypt(password, salt, 64);
  const expected = Buffer.from(hex, "hex");
  return key.length === expected.length && timingSafeEqual(key, expected);
}
