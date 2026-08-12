/**
 * Minimal ambient declaration for `pg`.
 *
 * The driver is an optional dependency — it is imported lazily and only when
 * DATABASE_URL is set — so we describe just the surface `lib/db.ts` uses rather
 * than depending on @types/pg being installed.
 */
declare module "pg" {
  export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
  }

  export interface PoolConfig {
    connectionString?: string;
    ssl?: boolean | { rejectUnauthorized?: boolean };
    max?: number;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query<T = any>(text: string, values?: unknown[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
  }
}
