import { CarouselJsonInput } from "./carousel.schema";
import { CarouselDraft, CarouselSlide, withDefaultCarouselLogo } from "@/types/carousel";
import { generateId } from "@/lib/id";
import { buildDigytalabImagePrompt } from "@/features/prompts/prompt-builder";

export function mapCarouselJsonToDraft(json: CarouselJsonInput): CarouselDraft {
  const slides: CarouselSlide[] = json.slides.map((slide, index) => withDefaultCarouselLogo({
    id: generateId(),
    order: index,
    headline: slide.headline,
    body: slide.body,
    imagePrompt: buildDigytalabImagePrompt(slide.image_prompt),
  }));

  return {
    id: generateId(),
    title: json.title || "Untitled Carousel",
    format: "carousel",
    pillar: json.pillar || "",
    targetBusiness: "",
    status: "draft",
    caption: json.caption || "",
    hashtags: json.hashtags || [],
    cta: json.cta || "",
    slides,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
