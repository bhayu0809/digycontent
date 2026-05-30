import { z } from "zod";

export const carouselSlideSchema = z.object({
  headline: z.string().catch(""),
  body: z.string().catch(""),
  image_prompt: z.string().catch(""),
});

export const carouselJsonSchema = z.object({
  title: z.string().catch("Untitled Carousel"),
  pillar: z.string().catch(""),
  slides: z.array(carouselSlideSchema).min(1, "Minimal harus ada 1 slide"),
  caption: z.string().catch(""),
  hashtags: z.array(z.string()).catch([]),
  cta: z.string().catch(""),
});

export type CarouselJsonInput = z.infer<typeof carouselJsonSchema>;
