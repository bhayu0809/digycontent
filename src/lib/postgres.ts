import "server-only";
import { Pool, QueryResultRow } from "pg";

let pool: Pool | undefined;
let hasEnsuredSchema = false;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL belum diset.");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  return pool;
}

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  await ensureSchema();
  return getPool().query<T>(text, values);
}

export async function ensureSchema() {
  if (hasEnsuredSchema) return;

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS brand_profiles (
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
    );

    CREATE TABLE IF NOT EXISTS content_drafts (
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
    );

    CREATE INDEX IF NOT EXISTS content_drafts_updated_at_idx ON content_drafts (updated_at DESC);
    CREATE INDEX IF NOT EXISTS content_drafts_scheduled_at_idx ON content_drafts (scheduled_at);
    CREATE INDEX IF NOT EXISTS content_drafts_format_status_idx ON content_drafts (format, status);
  `);

  hasEnsuredSchema = true;
}
