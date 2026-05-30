"use client";

import { ReelsScene } from "@/types/reels";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CopyButton } from "@/components/shared/CopyButton";
import { buildDigytalabImagePrompt } from "@/features/prompts/prompt-builder";

interface ReelsSceneFormProps {
  scene: ReelsScene;
  onChange: (updated: ReelsScene) => void;
}

export function ReelsSceneForm({ scene, onChange }: ReelsSceneFormProps) {
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...scene, [name]: value });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-700">Durasi Perkiraan</Label>
          <Input 
            name="duration" 
            value={scene.duration} 
            onChange={handleTextChange} 
            placeholder="0-3s"
            className="border-slate-200 focus-visible:ring-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700">Visual / B-Roll / Action</Label>
        <Textarea 
          name="visual" 
          value={scene.visual} 
          onChange={handleTextChange} 
          rows={2}
          className="border-slate-200 focus-visible:ring-primary resize-none font-semibold text-slate-800"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700">Voiceover (Dialog)</Label>
        <Textarea 
          name="voiceover" 
          value={scene.voiceover} 
          onChange={handleTextChange} 
          rows={3}
          className="border-slate-200 bg-primary/5 border-primary/10 focus-visible:ring-primary resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700">Text Overlay (Tulisan di layar)</Label>
        <Textarea 
          name="textOverlay" 
          value={scene.textOverlay} 
          onChange={handleTextChange} 
          rows={2}
          className="border-slate-200 focus-visible:ring-primary resize-none"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label className="text-slate-700">Image / Video Prompt (Jika butuh AI)</Label>
          <CopyButton
            text={buildDigytalabImagePrompt(scene.imagePrompt)}
            label="Copy Prompt"
            className="h-7 border-primary/20 text-[#4F17CE] hover:bg-primary/5"
          />
        </div>
        <Textarea 
          name="imagePrompt" 
          value={scene.imagePrompt} 
          onChange={handleTextChange} 
          rows={2}
          className="border-slate-200 bg-slate-50 text-slate-600 focus-visible:ring-primary resize-none text-xs font-mono"
        />
      </div>
    </div>
  );
}
