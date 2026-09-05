import 'server-only';
import mysql from 'mysql2/promise';

/**
 * MySQL connection pool.
 *
 * The pool is created lazily and cached on globalThis so Next's dev-mode
 * module reloading doesn't leak a new pool on every edit.
 *
 * If DATABASE_URL is unset the app runs from data/catalog.json instead — see
 * lib/catalog.ts. That keeps the storefront viewable before a database is
 * provisioned, and makes `npm run dev` work on a clean checkout.
 */

declare global {
  var __ghqPool: mysql.Pool | undefined;
}

export const DATABASE_URL = process.env.DATABASE_URL?.trim() || '';

export const hasDatabase = (): boolean => DATABASE_URL.length > 0;

export function getPool(): mysql.Pool {
  if (!hasDatabase()) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env.local and point it at your MySQL instance.',
    );
  }
  if (!globalThis.__ghqPool) {
    globalThis.__ghqPool = mysql.createPool({
      uri: DATABASE_URL,
      waitForConnections: true,
      connectionLimit: Number(process.env.DATABASE_POOL_SIZE ?? 10),
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10_000,
      timezone: 'Z',
      // Decimals and bigints come back as strings rather than lossy floats.
      decimalNumbers: false,
      supportBigNumbers: true,
      bigNumberStrings: true,
    });
  }
  return globalThis.__ghqPool;
}

/** What may legally be bound to a `?` placeholder. */
export type SqlValue = string | number | boolean | null | Date | Buffer;

/** Parameterised query. Values are always bound, never interpolated. */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params: readonly SqlValue[] = [],
): Promise<T[]> {
  const [rows] = await getPool().execute(sql, params as SqlValue[]);
  return rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: readonly SqlValue[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function execute(
  sql: string,
  params: readonly SqlValue[] = [],
): Promise<mysql.ResultSetHeader> {
  const [result] = await getPool().execute(sql, params as SqlValue[]);
  return result as mysql.ResultSetHeader;
}

/** Runs `fn` inside a transaction, rolling back on any throw. */
export async function transaction<T>(
  fn: (conn: mysql.PoolConnection) => Promise<T>,
): Promise<T> {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** True when the database is configured *and* actually reachable. */
export async function isReachable(): Promise<boolean> {
  if (!hasDatabase()) return false;
  try {
    await query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
