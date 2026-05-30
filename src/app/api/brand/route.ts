import { getRequestLogContext, logApiError } from "@/lib/api-logging";
import { query } from "@/lib/postgres";
import { BrandProfile } from "@/types/brand";

export const runtime = "nodejs";

type BrandProfileRow = {
  id: string;
  name: string;
  positioning: string;
  target_audience: string;
  offers: string[];
  tone_of_voice: string;
  main_message: string;
  cta: string;
  content_rules: string[];
  forbidden_styles: string[];
  updated_at: string;
};

export async function GET(request: Request) {
  let id = "default";

  try {
    const url = new URL(request.url);
    id = url.searchParams.get("id") || "default";
    const result = await query<BrandProfileRow>(
      `SELECT * FROM brand_profiles WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (!result.rows[0]) {
      return Response.json({ profile: null });
    }

    return Response.json({ profile: mapRowToBrandProfile(result.rows[0]) });
  } catch (error) {
    logApiError(error, {
      route: "/api/brand",
      ...getRequestLogContext(request),
      searchParams: { id },
    });

    return Response.json({ message: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let profileId = "unknown";

  try {
    const profile = (await request.json()) as BrandProfile;
    profileId = profile.id || "default";
    const updatedAt = new Date().toISOString();
    const payload: BrandProfile = {
      ...profile,
      id: profileId,
      offers: profile.offers || [],
      contentRules: profile.contentRules || [],
      forbiddenStyles: profile.forbiddenStyles || [],
      updatedAt,
    };

    await query(
      `
        INSERT INTO brand_profiles (
          id, name, positioning, target_audience, offers, tone_of_voice,
          main_message, cta, content_rules, forbidden_styles, updated_at
        )
        VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9::jsonb, $10::jsonb, $11)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          positioning = EXCLUDED.positioning,
          target_audience = EXCLUDED.target_audience,
          offers = EXCLUDED.offers,
          tone_of_voice = EXCLUDED.tone_of_voice,
          main_message = EXCLUDED.main_message,
          cta = EXCLUDED.cta,
          content_rules = EXCLUDED.content_rules,
          forbidden_styles = EXCLUDED.forbidden_styles,
          updated_at = EXCLUDED.updated_at
      `,
      [
        payload.id,
        payload.name,
        payload.positioning,
        payload.targetAudience,
        JSON.stringify(payload.offers),
        payload.toneOfVoice,
        payload.mainMessage,
        payload.cta,
        JSON.stringify(payload.contentRules),
        JSON.stringify(payload.forbiddenStyles),
        payload.updatedAt,
      ]
    );

    return Response.json({ profile: payload });
  } catch (error) {
    logApiError(error, {
      route: "/api/brand",
      ...getRequestLogContext(request),
      metadata: { profileId },
    });

    return Response.json({ message: getErrorMessage(error) }, { status: 500 });
  }
}

function mapRowToBrandProfile(row: BrandProfileRow): BrandProfile {
  return {
    id: row.id,
    name: row.name,
    positioning: row.positioning,
    targetAudience: row.target_audience,
    offers: row.offers || [],
    toneOfVoice: row.tone_of_voice,
    mainMessage: row.main_message,
    cta: row.cta,
    contentRules: row.content_rules || [],
    forbiddenStyles: row.forbidden_styles || [],
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.includes("DATABASE_URL")) {
    return "DATABASE_URL belum diset. Tambahkan koneksi PostgreSQL di .env.local.";
  }

  return "Gagal mengakses Brand Brain PostgreSQL.";
}
