import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Database, EMPTY_DB } from "./models";
import { buildSeed } from "./seed";

/**
 * Storage engine.
 *
 * The portal holds its whole state in one JSON document and writes it through
 * one of three drivers, chosen automatically at boot:
 *
 *   postgres  DATABASE_URL is set. Durable, multi-instance, production-grade.
 *   file      No DATABASE_URL but the filesystem is writable (local dev, any
 *             Node host, a container with a volume). Durable across restarts.
 *   memory    Read-only filesystem and no DATABASE_URL — e.g. a serverless
 *             preview. Fully functional, but resets when the instance recycles.
 *
 * The point of this design is that the portal runs immediately with no account
 * to create anywhere, and becomes production-durable by pasting one env var.
 * A document store is the right shape at cooperative scale (thousands of
 * records); it is deliberately not built for millions of rows.
 */

type Driver = "postgres" | "file" | "memory";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

/**
 * All mutable state hangs off `globalThis`, not off module scope.
 *
 * A production Next.js build bundles this module separately into every route,
 * so module-level variables would give each route its own cache and its own
 * write queue — a write made by one route would be invisible to the next.
 * One global holder keeps every route in the same process on one copy.
 */
interface DbState {
  cache: Database | null;
  driver: Driver | null;
  pgPool: any;
  /** Serialises read-modify-write cycles inside one instance. */
  queue: Promise<unknown>;
}

const state: DbState = ((globalThis as typeof globalThis & { __vvgDb?: DbState }).__vvgDb ??= {
  cache: null,
  driver: null,
  pgPool: null,
  queue: Promise.resolve(),
});

export function newId(): string {
  return randomUUID();
}

export function currentDriver(): Driver {
  return state.driver ?? "memory";
}

async function initPostgres(): Promise<boolean> {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  try {
    const { Pool } = await import("pg");
    state.pgPool = new Pool({
      connectionString: url,
      ssl: url.includes("sslmode=disable") ? undefined : { rejectUnauthorized: false },
      max: 3,
    });
    await state.pgPool.query(
      `CREATE TABLE IF NOT EXISTS vvg_portal_state (
         id INT PRIMARY KEY,
         doc JSONB NOT NULL,
         updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
       )`
    );
    return true;
  } catch (err) {
    console.error("[db] Postgres unavailable, falling back to file/memory:", err);
    state.pgPool = null;
    return false;
  }
}

async function readRaw(): Promise<Database | null> {
  if (state.driver === "postgres") {
    const res = await state.pgPool.query("SELECT doc FROM vvg_portal_state WHERE id = 1");
    return res.rows[0]?.doc ?? null;
  }
  if (state.driver === "file") {
    try {
      return JSON.parse(await fs.readFile(DATA_FILE, "utf8")) as Database;
    } catch {
      return null;
    }
  }
  return null;
}

async function writeRaw(db: Database): Promise<void> {
  if (state.driver === "postgres") {
    await state.pgPool.query(
      `INSERT INTO vvg_portal_state (id, doc, updated_at) VALUES (1, $1, now())
       ON CONFLICT (id) DO UPDATE SET doc = EXCLUDED.doc, updated_at = now()`,
      [JSON.stringify(db)]
    );
    return;
  }
  if (state.driver === "file") {
    const tmp = `${DATA_FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(tmp, DATA_FILE);
  }
  // memory driver: `state.cache` is the store, nothing further to do.
}

async function chooseDriver(): Promise<Driver> {
  if (await initPostgres()) return "postgres";
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_DIR, (await import("node:fs")).constants.W_OK);
    return "file";
  } catch {
    return "memory";
  }
}

async function load(): Promise<Database> {
  if (state.cache) return state.cache;
  state.driver = await chooseDriver();
  const existing = await readRaw();
  if (existing) {
    // Tolerate documents written by an older build that lacks newer collections.
    state.cache = { ...EMPTY_DB, ...existing };
  } else {
    state.cache = await buildSeed();
    await writeRaw(state.cache);
    console.log(`[db] Seeded a fresh portal database using the "${state.driver}" driver.`);
  }
  return state.cache;
}

/** Read-only snapshot. Never mutate the result — use `mutate` for writes. */
export async function read(): Promise<Database> {
  return await load();
}

/**
 * Run a read-modify-write cycle. Calls are serialised per instance and the
 * whole document is persisted once the callback returns.
 */
export async function mutate<T>(fn: (db: Database) => T | Promise<T>): Promise<T> {
  const run = async (): Promise<T> => {
    await load();
    // Re-read under Postgres so concurrent instances don't clobber each other.
    if (state.driver === "postgres") {
      const fresh = await readRaw();
      if (fresh) state.cache = { ...EMPTY_DB, ...fresh };
    }
    const result = await fn(state.cache!);
    await writeRaw(state.cache!);
    return result;
  };
  const chained = state.queue.then(run, run);
  // Keep the chain alive even when a caller's callback throws.
  state.queue = chained.catch(() => undefined);
  return chained;
}

/** Wipes everything and re-seeds. Exposed to super admins only. */
export async function resetToSeed(): Promise<void> {
  const fresh = await buildSeed();
  await load();
  state.cache = fresh;
  await writeRaw(fresh);
}
