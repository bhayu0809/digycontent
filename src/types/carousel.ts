import { ContentDraftBase } from "./content";

export type CarouselSlide = {
  id: string;
  order: number;
  headline: string;
  body: string;
  imagePrompt: string;
  imageDataUrl?: string;
  showLogo?: boolean;
  logoX?: number;
  logoY?: number;
  logoSize?: number;
};

export const DEFAULT_CAROUSEL_LOGO = {
  showLogo: true,
  logoX: 82,
  logoY: 8,
  logoSize: 30,
} as const;

const MIN_CAROUSEL_WORDMARK_SIZE = 20;

export function withDefaultCarouselLogo(slide: CarouselSlide): CarouselSlide {
  return {
    ...slide,
    showLogo: slide.showLogo ?? DEFAULT_CAROUSEL_LOGO.showLogo,
    logoX: slide.logoX ?? DEFAULT_CAROUSEL_LOGO.logoX,
    logoY: slide.logoY ?? DEFAULT_CAROUSEL_LOGO.logoY,
    logoSize: Math.max(slide.logoSize ?? DEFAULT_CAROUSEL_LOGO.logoSize, MIN_CAROUSEL_WORDMARK_SIZE),
  };
}

export type CarouselDraft = ContentDraftBase & {
  format: "carousel";
  slides: CarouselSlide[];
};
