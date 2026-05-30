import { getRequestLogContext, logApiError } from "@/lib/api-logging";
import { query } from "@/lib/postgres";
import { generateId } from "@/lib/id";
import { ContentDraftBase, ContentStatus } from "@/types/content";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type DraftRow = {
  payload: ContentDraftBase;
};

type DraftPatchBody = {
  action?: "duplicate";
  status?: ContentStatus;
  scheduledAt?: string | null;
  notes?: string;
};

export async function GET(request: Request, { params }: RouteContext) {
  let draftId = "unknown";

  try {
    const { id } = await params;
    draftId = id;
    const draft = await getDraft(id);

    if (!draft) {
      return Response.json({ message: "Draft tidak ditemukan." }, { status: 404 });
    }

    return Response.json({ draft });
  } catch (error) {
    logApiError(error, {
      route: "/api/drafts/[id]",
      ...getRequestLogContext(request),
      metadata: { draftId },
    });

    return Response.json({ message: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  let draftId = "unknown";
  let action = "update";

  try {
    const { id } = await params;
    draftId = id;
    const body = (await request.json()) as DraftPatchBody;
    action = body.action || "update";
    const draft = await getDraft(id);

    if (!draft) {
      return Response.json({ message: "Draft tidak ditemukan." }, { status: 404 });
    }

    if (body.action === "duplicate") {
      const now = new Date().toISOString();
      const copiedDraft = {
        ...draft,
        id: generateId(),
        title: `${draft.title} (Copy)`,
        status: "draft" as ContentStatus,
        createdAt: now,
        updatedAt: now,
      };

      await saveDraft(copiedDraft);
      return Response.json({ draft: copiedDraft });
    }

    const updatedDraft = {
      ...draft,
      status: body.status || draft.status,
      scheduledAt: body.scheduledAt === null ? undefined : body.scheduledAt ?? draft.scheduledAt,
      notes: body.notes ?? draft.notes,
      updatedAt: new Date().toISOString(),
    };

    await saveDraft(updatedDraft);
    return Response.json({ draft: updatedDraft });
  } catch (error) {
    logApiError(error, {
      route: "/api/drafts/[id]",
      ...getRequestLogContext(request),
      metadata: { draftId, action },
    });

    return Response.json({ message: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  let draftId = "unknown";

  try {
    const { id } = await params;
    draftId = id;
    await query(`DELETE FROM content_drafts WHERE id = $1`, [id]);
    return Response.json({ ok: true });
  } catch (error) {
    logApiError(error, {
      route: "/api/drafts/[id]",
      ...getRequestLogContext(request),
      metadata: { draftId },
    });

    return Response.json({ message: getErrorMessage(error) }, { status: 500 });
  }
}

async function getDraft(id: string) {
  const result = await query<DraftRow>(
    `SELECT payload FROM content_drafts WHERE id = $1 LIMIT 1`,
    [id]
  );

  return result.rows[0]?.payload;
}

async function saveDraft(draft: ContentDraftBase) {
  const payload = {
    ...draft,
    hashtags: Array.isArray(draft.hashtags) ? draft.hashtags : [],
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
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.includes("DATABASE_URL")) {
    return "DATABASE_URL belum diset. Tambahkan koneksi PostgreSQL di .env.local.";
  }

  return "Gagal mengakses draft PostgreSQL.";
}
