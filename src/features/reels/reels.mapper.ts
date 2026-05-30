import { ReelsJsonInput } from "./reels.schema";
import { ReelsDraft, ReelsScene } from "@/types/reels";
import { generateId } from "@/lib/id";

export function mapReelsJsonToDraft(json: ReelsJsonInput): ReelsDraft {
  const scenes: ReelsScene[] = json.scenes.map((scene, index) => ({
    id: generateId(),
    order: index,
    duration: scene.duration,
    visual: scene.visual,
    textOverlay: scene.text_overlay,
    voiceover: scene.voiceover,
    imagePrompt: scene.image_prompt,
  }));

  return {
    id: generateId(),
    title: json.title || "Untitled Reels",
    format: "reels",
    pillar: "",
    targetBusiness: "",
    status: "draft",
    caption: json.caption || "",
    hashtags: json.hashtags || [],
    cta: json.cta || "",
    hook: json.hook || "",
    scenes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
