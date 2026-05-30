import { buildDailyIdeasPrompt, buildDigytalabImagePrompt } from "@/features/prompts/prompt-builder";
import { generateId } from "@/lib/id";
import { query } from "@/lib/postgres";
import { BrandProfile } from "@/types/brand";
import { CarouselDraft, CarouselSlide } from "@/types/carousel";
import { ContentDraftBase } from "@/types/content";
import { ReelsDraft, ReelsScene } from "@/types/reels";

type DailyIdeasRequest = {
  postingDate?: string;
  targetBusiness?: string;
  contentTitle?: string;
  audienceFocus?: "umkm" | "education";
  formatMode?: "mixed" | "carousel" | "reels";
  carouselSlideCount?: number;
  brand?: BrandProfile;
  currentIdeaSummaries?: string[];
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

type RawIdea = {
  format?: string;
  title?: string;
  pillar?: string;
  targetBusiness?: string;
  industry?: string;
  packageAngle?: string;
  painPoint?: string;
  strategyReason?: string;
  slides?: Array<{
    headline?: string;
    body?: string;
    image_prompt?: string;
  }>;
  hook?: string;
  scenes?: Array<{
    duration?: string;
    visual?: string;
    text_overlay?: string;
    voiceover?: string;
    image_prompt?: string;
  }>;
  caption?: string;
  hashtags?: string[];
  cta?: string;
  musicSuggestion?: string;
};

type RawIdeasResponse = {
  ideas?: RawIdea[];
};

type ExistingIdeaRow = {
  title: string;
  format: string;
  pillar: string;
  target_business: string;
  notes: string | null;
  payload: ContentDraftBase;
};

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { message: "GEMINI_API_KEY belum diset. Tambahkan key di .env.local untuk generate ide otomatis." },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as DailyIdeasRequest;

    if (!body.brand) {
      return Response.json({ message: "Brand Brain belum tersedia." }, { status: 400 });
    }

    if (!body.postingDate) {
      return Response.json({ message: "Tanggal posting wajib diisi." }, { status: 400 });
    }

    const formatMode = body.formatMode || "mixed";
    const carouselSlideCount = clampCarouselSlideCount(body.carouselSlideCount);
    const existingIdeaSummaries = await getExistingIdeaSummaries(body.currentIdeaSummaries || []);
    const usedKeys = new Set(existingIdeaSummaries.map(normalizeIdeaKey));
    const usedTitles = new Set(existingIdeaSummaries.map((summary) => normalizeIdeaKey(summary.split("|")[0] || summary)));
    const validIdeas: Array<CarouselDraft | ReelsDraft> = [];

    for (let attempt = 0; attempt < 3 && validIdeas.length < 3; attempt += 1) {
      const prompt = buildDailyIdeasPrompt(
        {
          postingDate: body.postingDate,
          targetBusiness: body.targetBusiness,
          contentTitle: body.contentTitle,
          audienceFocus: body.audienceFocus,
          formatMode,
          carouselSlideCount,
          existingIdeaSummaries: [
            ...existingIdeaSummaries,
            ...validIdeas.map((idea) => buildDraftSummary(idea)),
          ],
        },
        body.brand
      );

      const parsed = await generateIdeasFromGemini(prompt, apiKey);
      const ideas = parsed.ideas?.map((idea) => mapIdeaToDraft(idea, body.postingDate!, body.brand!, carouselSlideCount)) || [];

      for (const idea of ideas) {
        if (!idea || validIdeas.length >= 3) continue;
        if (!matchesFormatMode(idea.format, formatMode)) continue;

        const key = normalizeIdeaKey(buildDraftSummary(idea));
        const titleKey = normalizeIdeaKey(idea.title);
        if (usedKeys.has(key) || usedTitles.has(titleKey)) continue;

        usedKeys.add(key);
        usedTitles.add(titleKey);
        validIdeas.push(idea);
      }
    }

    if (validIdeas.length < 3) {
      return Response.json(
        { message: "AI belum berhasil membuat 3 ide yang unik. Coba generate ulang dengan target bisnis yang lebih spesifik." },
        { status: 502 }
      );
    }

    return Response.json({ ideas: validIdeas });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "Gagal memproses generate ide harian." },
      { status: 500 }
    );
  }
}

async function generateIdeasFromGemini(prompt: string, apiKey: string): Promise<RawIdeasResponse> {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Gemini gagal membuat ide. Cek API key atau limit free tier.");
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini tidak mengembalikan teks ide.");
  }

  return parseGeminiJson(text);
}

function parseGeminiJson(text: string): RawIdeasResponse {
  const cleanedText = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleanedText) as RawIdeasResponse;
}

function mapIdeaToDraft(idea: RawIdea, postingDate: string, brand: BrandProfile, carouselSlideCount: number): CarouselDraft | ReelsDraft | null {
  const now = new Date().toISOString();
  const scheduledAt = new Date(`${postingDate}T09:00:00`).toISOString();
  const base = {
    id: generateId(),
    title: idea.title || "Ide Konten Harian",
    pillar: idea.pillar || "Edukasi",
    targetBusiness: idea.targetBusiness || "",
    status: "idea" as const,
    caption: idea.caption || "",
    hashtags: Array.isArray(idea.hashtags) ? idea.hashtags : [],
    cta: idea.cta || brand.cta,
    notes: buildIdeaNotes(idea),
    scheduledAt,
    createdAt: now,
    updatedAt: now,
  };

  if (idea.format === "carousel") {
    const slides: CarouselSlide[] = (idea.slides || []).slice(0, carouselSlideCount).map((slide, index) => ({
      id: generateId(),
      order: index,
      headline: slide.headline || "",
      body: slide.body || "",
      imagePrompt: buildDigytalabImagePrompt(slide.image_prompt || ""),
    }));

    if (slides.length < carouselSlideCount) return null;

    return {
      ...base,
      format: "carousel",
      slides,
    };
  }

  if (idea.format === "reels") {
    const scenes: ReelsScene[] = (idea.scenes || []).slice(0, 8).map((scene, index) => ({
      id: generateId(),
      order: index,
      duration: scene.duration || "",
      visual: scene.visual || "",
      textOverlay: scene.text_overlay || "",
      voiceover: scene.voiceover || "",
      imagePrompt: buildDigytalabImagePrompt(scene.image_prompt || ""),
    }));

    if (scenes.length === 0) return null;

    return {
      ...base,
      format: "reels",
      hook: idea.hook || "",
      scenes,
    };
  }

  return null;
}

function clampCarouselSlideCount(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 6;

  return Math.min(Math.max(Math.round(value), 3), 10);
}

function matchesFormatMode(format: "carousel" | "reels", mode: "mixed" | "carousel" | "reels") {
  if (mode === "mixed") return true;

  return format === mode;
}

function buildIdeaNotes(idea: RawIdea): string {
  const notes = [
    idea.industry ? `Industry: ${idea.industry}` : null,
    idea.packageAngle ? `Package angle: ${idea.packageAngle}` : null,
    idea.painPoint ? `Pain point: ${idea.painPoint}` : null,
    idea.strategyReason ? `Strategy reason: ${idea.strategyReason}` : null,
    `Music: ${idea.musicSuggestion || "lo-fi upbeat atau soft tech beat, volume rendah agar voiceover tetap jelas."}`,
  ];

  return notes.filter(Boolean).join("\n");
}

async function getExistingIdeaSummaries(currentIdeaSummaries: string[]): Promise<string[]> {
  const result = await query<ExistingIdeaRow>(
    `
      SELECT title, format, pillar, target_business, notes, payload
      FROM content_drafts
      ORDER BY updated_at DESC
      LIMIT 200
    `
  );

  const savedSummaries = result.rows.map((row) => {
    const draft = row.payload;
    const notes = row.notes || draft.notes || "";
    const painPoint = notes.match(/^Pain point:\s*(.+)$/im)?.[1];
    const packageAngle = notes.match(/^Package angle:\s*(.+)$/im)?.[1];

    return [
      row.title,
      row.format,
      row.pillar,
      row.target_business,
      packageAngle ? `package: ${packageAngle}` : null,
      painPoint ? `pain: ${painPoint}` : null,
    ].filter(Boolean).join(" | ");
  });

  return [...currentIdeaSummaries, ...savedSummaries].filter(Boolean);
}

function buildDraftSummary(draft: CarouselDraft | ReelsDraft): string {
  const firstContent = draft.format === "carousel"
    ? draft.slides[0]?.headline || draft.slides[0]?.body || ""
    : draft.hook || draft.scenes[0]?.voiceover || "";

  return [
    draft.title,
    draft.format,
    draft.pillar,
    draft.targetBusiness,
    firstContent,
  ].filter(Boolean).join(" | ");
}

function normalizeIdeaKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\b(untuk|yang|dan|di|ke|dari|dengan|agar|bisa|lebih|ini|itu|the|a|an)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
