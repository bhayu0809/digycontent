import "server-only";
import { describeDbError, emitLog, serializeLogError } from "@/lib/api-logging";
import { Pool, QueryResultRow } from "pg";

let pool: Pool | undefined;
let hasEnsuredSchema = false;

const POOL_MAX = 3;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL belum diset.");
  }

  if (!pool) {
    const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL);
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: POOL_MAX,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    });

    // An idle client dropped by the pooler emits 'error' on the pool. Without a
    // listener Node treats it as unhandled and crashes the function; log it so
    // the next "save draft" failure is explained instead of a silent 500.
    pool.on("error", (error) => {
      emitLog({
        tag: "db-error",
        level: "error",
        timestamp: new Date().toISOString(),
        operation: "pool-idle-client",
        dbError: describeDbError(error),
        pool: getPoolStats(),
        error: serializeLogError(error),
      });
    });
  }

  return pool;
}

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  await ensureSchema();

  try {
    return await getPool().query<T>(text, values);
  } catch (error) {
    logPostgresError(error, {
      operation: "query",
      statement: summarizeSqlStatement(text),
      valuesCount: values.length,
    });

    throw error;
  }
}

export async function ensureSchema() {
  if (hasEnsuredSchema) return;

  const statements = [
    `CREATE TABLE IF NOT EXISTS brand_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        positioning TEXT NOT NULL,
        target_audience TEXT NOT NULL,
        offers JSONB NOT NULL DEFAULT '[]'::jsonb,
        tone_of_voice TEXT NOT NULL,
        main_message TEXT NOT NULL,
        cta TEXT NOT NULL,
        content_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
        forbidden_styles JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL
      )`,
    `CREATE TABLE IF NOT EXISTS content_drafts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        format TEXT NOT NULL CHECK (format IN ('carousel', 'reels')),
        pillar TEXT NOT NULL,
        target_business TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('idea', 'draft', 'ready', 'posted')),
        caption TEXT NOT NULL,
        hashtags JSONB NOT NULL DEFAULT '[]'::jsonb,
        cta TEXT NOT NULL,
        scheduled_at TIMESTAMPTZ,
        notes TEXT,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      )`,
    `CREATE INDEX IF NOT EXISTS content_drafts_updated_at_idx ON content_drafts (updated_at DESC)`,
    `CREATE INDEX IF NOT EXISTS content_drafts_scheduled_at_idx ON content_drafts (scheduled_at)`,
    `CREATE INDEX IF NOT EXISTS content_drafts_format_status_idx ON content_drafts (format, status)`,
  ];

  try {
    for (const sql of statements) {
      await getPool().query(sql);
    }
  } catch (error) {
    logPostgresError(error, {
      operation: "ensureSchema",
      statement: "CREATE TABLE IF NOT EXISTS brand_profiles, content_drafts",
    });

    throw error;
  }

  hasEnsuredSchema = true;
}

function logPostgresError(
  error: unknown,
  context: {
    operation: string;
    statement?: string;
    valuesCount?: number;
  }
) {
  emitLog({
    tag: "db-error",
    level: "error",
    timestamp: new Date().toISOString(),
    ...context,
    dbError: describeDbError(error),
    pool: getPoolStats(),
    database: getSafeDatabaseUrlInfo(),
    runtime: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      region: process.env.VERCEL_REGION,
    },
    error: serializeLogError(error),
  });
}

/**
 * Live pool counters at the moment of failure. If `waiting` is high or
 * `total` is pinned at `max`, the error is connection-pool exhaustion rather
 * than a bad query — the usual culprit behind "worked, now fails again" on
 * serverless.
 */
function getPoolStats() {
  if (!pool) return { initialized: false };

  return {
    initialized: true,
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
    max: POOL_MAX,
  };
}

function getSafeDatabaseUrlInfo() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return {
      configured: false,
    };
  }

  try {
    const url = new URL(connectionString);
    const sslMode = url.searchParams.get("sslmode");
    const host = url.hostname;

    return {
      configured: true,
      protocol: url.protocol.replace(":", ""),
      host,
      port: url.port || "5432",
      database: url.pathname.replace(/^\//, "") || undefined,
      user: url.username || undefined,
      sslmode: sslMode || "not-set",
      supabaseConnectionType: getSupabaseConnectionType(host),
    };
  } catch {
    return {
      configured: true,
      parseError: "DATABASE_URL is not a valid URL",
    };
  }
}

function getSupabaseConnectionType(host: string) {
  if (host.includes("pooler.supabase.com")) return "pooler";
  if (host.startsWith("db.") && host.endsWith(".supabase.co")) return "direct";

  return "unknown";
}

function summarizeSqlStatement(text: string) {
  return text.replace(/\s+/g, " ").trim().slice(0, 160);
}
