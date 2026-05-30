export type ContentStatus = "idea" | "draft" | "ready" | "posted";
export type ContentFormat = "carousel" | "reels";

export type ContentDraftBase = {
  id: string;
  title: string;
  format: ContentFormat;
  pillar: string;
  targetBusiness: string;
  status: ContentStatus;
  caption: string;
  hashtags: string[];
  cta: string;
  scheduledAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
