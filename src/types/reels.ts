import { ContentDraftBase } from "./content";

export type ReelsScene = {
  id: string;
  order: number;
  duration: string;
  visual: string;
  textOverlay: string;
  voiceover: string;
  imagePrompt: string;
};

export type ReelsDraft = ContentDraftBase & {
  format: "reels";
  hook: string;
  scenes: ReelsScene[];
};
