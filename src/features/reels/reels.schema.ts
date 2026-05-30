import { z } from "zod";

export const reelsSceneSchema = z.object({
  duration: z.string().catch(""),
  visual: z.string().catch(""),
  text_overlay: z.string().catch(""),
  voiceover: z.string().catch(""),
  image_prompt: z.string().catch(""),
});

export const reelsJsonSchema = z.object({
  title: z.string().catch("Untitled Reels"),
  hook: z.string().catch(""),
  scenes: z.array(reelsSceneSchema).min(1, "Minimal harus ada 1 scene"),
  caption: z.string().catch(""),
  hashtags: z.array(z.string()).catch([]),
  cta: z.string().catch(""),
});

export type ReelsJsonInput = z.infer<typeof reelsJsonSchema>;
