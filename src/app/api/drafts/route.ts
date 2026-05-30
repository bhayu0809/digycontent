import { getRequestLogContext, logApiError } from "@/lib/api-logging";
import { query } from "@/lib/postgres";
import { ContentDraftBase } from "@/types/content";

export const runtime = "nodejs";

type DraftRow = {
  payload: ContentDraftBase;
};

export async function GET(request: Request) {
  try {
    const result = await query<DraftRow>(
      `SELECT payload FROM content_drafts ORDER BY updated_at DESC`
    );

    return Response.json({ drafts: result.rows.map((row) => row.payload) });
  } catch (error) {
    logApiError(error, {
      route: "/api/drafts",
      ...getRequestLogContext(request),
    });

    return Response.json({ message: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let draftId = "unknown";
  let draftFormat = "unknown";

  try {
    const draft = (await request.json()) as ContentDraftBase;
    draftId = draft.id || "unknown";
    draftFormat = draft.format || "unknown";

    if (!draft.id || !draft.format || !draft.title) {
      return Response.json({ message: "Draft tidak lengkap." }, { status: 400 });
    }

    const savedDraft = await saveDraft(draft);
    return Response.json({ draft: savedDraft });
  } catch (error) {
    logApiError(error, {
      route: "/api/drafts",
      ...getRequestLogContext(request),
      metadata: { draftId, draftFormat },
    });

    return Response.json({ message: getErrorMessage(error) }, { status: 500 });
  }
}

async function saveDraft(draft: ContentDraftBase) {
  const now = new Date().toISOString();
  const payload = {
    ...draft,
    hashtags: Array.isArray(draft.hashtags) ? draft.hashtags : [],
    createdAt: draft.createdAt || now,
    updatedAt: now,
  };

  await query(
    `
      INSERT INTO content_drafts (
        id, title, format, pillar, target_business, status, caption, hashtags,
        cta, scheduled_at, notes, payload, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12::jsonb, $13, $14)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        format = EXCLUDED.format,
        pillar = EXCLUDED.pillar,
        target_business = EXCLUDED.target_business,
        status = EXCLUDED.status,
        caption = EXCLUDED.caption,
        hashtags = EXCLUDED.hashtags,
        cta = EXCLUDED.cta,
        scheduled_at = EXCLUDED.scheduled_at,
        notes = EXCLUDED.notes,
        payload = EXCLUDED.payload,
        updated_at = EXCLUDED.updated_at
    `,
    [
      payload.id,
      payload.title,
      payload.format,
      payload.pillar,
      payload.targetBusiness,
      payload.status,
      payload.caption,
      JSON.stringify(payload.hashtags),
      payload.cta,
      payload.scheduledAt || null,
      payload.notes || null,
      JSON.stringify(payload),
      payload.createdAt,
      payload.updatedAt,
    ]
  );

  return payload;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.includes("DATABASE_URL")) {
    return "DATABASE_URL belum diset. Tambahkan koneksi PostgreSQL di .env.local.";
  }

  return "Gagal mengakses draft PostgreSQL.";
}
