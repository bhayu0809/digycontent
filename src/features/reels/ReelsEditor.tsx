"use client";

import { useEffect, useRef, useState } from "react";
import { ReelsDraft, ReelsScene } from "@/types/reels";
import { ReelsSceneForm } from "./ReelsSceneForm";
import { ReelsJsonImporter } from "./ReelsJsonImporter";
import { CopyButton } from "@/components/shared/CopyButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { reelsRepository } from "./reels.repository";
import { generateId } from "@/lib/id";

export function ReelsEditor() {
  const [draft, setDraft] = useState<ReelsDraft | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const loadedDraftIdRef = useRef<string | null>(null);

  useEffect(() => {
    const draftId = new URLSearchParams(window.location.search).get("draftId");
    if (!draftId || loadedDraftIdRef.current === draftId) return;

    loadedDraftIdRef.current = draftId;
    const selectedDraftId = draftId;

    async function loadDraft() {
      const savedDraft = await reelsRepository.getById(selectedDraftId);

      if (!savedDraft) {
        toast.error("Draft reels tidak ditemukan.");
        return;
      }

      setDraft(savedDraft);
      setCurrentIndex(0);
      toast.success("Draft reels dibuka.");
    }

    loadDraft();
  }, []);

  const handleImport = (newDraft: ReelsDraft) => {
    setDraft(newDraft);
    setCurrentIndex(0);
  };

  const updateScene = (updatedScene: ReelsScene) => {
    if (!draft) return;
    const newScenes = [...draft.scenes];
    newScenes[currentIndex] = updatedScene;
    setDraft({ ...draft, scenes: newScenes });
  };

  const addScene = () => {
    if (!draft) return;
    const newScene: ReelsScene = {
      id: generateId(),
      order: draft.scenes.length,
      duration: "0-3s",
      visual: "B-Roll Baru",
      textOverlay: "",
      voiceover: "",
      imagePrompt: "",
    };
    setDraft({ ...draft, scenes: [...draft.scenes, newScene] });
    setCurrentIndex(draft.scenes.length);
  };

  const removeScene = () => {
    if (!draft || draft.scenes.length <= 1) {
      toast.error("Minimal harus ada 1 scene.");
      return;
    }
    const newScenes = draft.scenes.filter((_, idx) => idx !== currentIndex);
    // re-order
    newScenes.forEach((s, i) => s.order = i);
    setDraft({ ...draft, scenes: newScenes });
    if (currentIndex >= newScenes.length) {
      setCurrentIndex(newScenes.length - 1);
    }
  };

  const saveDraft = async () => {
    if (!draft) return;
    setIsSaving(true);
    try {
      await reelsRepository.save(draft);
      toast.success("Draft script berhasil disimpan!");
    } catch {
      toast.error("Gagal menyimpan draft.");
    } finally {
      setIsSaving(false);
    }
  };

  const generateFullScript = () => {
    if (!draft) return "";
    let script = `[TITLE]: ${draft.title}\n`;
    script += `[HOOK]: ${draft.hook}\n\n`;
    draft.scenes.forEach((s, i) => {
      script += `--- SCENE ${i + 1} (${s.duration}) ---\n`;
      if (s.visual) script += `Visual: ${s.visual}\n`;
      if (s.textOverlay) script += `Text: ${s.textOverlay}\n`;
      if (s.voiceover) script += `VO: ${s.voiceover}\n`;
      script += `\n`;
    });
    script += `[CAPTION]:\n${draft.caption}\n\n`;
    script += `[HASHTAGS]: ${draft.hashtags.join(" ")}\n`;
    script += `[CTA]: ${draft.cta}\n`;
    return script;
  };

  if (!draft) {
    return <ReelsJsonImporter onImport={handleImport} />;
  }

  const currentScene = draft.scenes[currentIndex];

  return (
    <div className="flex flex-col lg:flex-row h-full bg-white border-t border-slate-200">
      {/* LEFT: Editor Form */}
      <div className="flex-1 flex flex-col border-r border-slate-200 min-w-0 bg-slate-50 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white shrink-0">
          <Input 
            value={draft.title}
            onChange={(e) => setDraft({...draft, title: e.target.value})}
            className="font-bold text-lg border-transparent hover:border-slate-200 focus-visible:ring-primary max-w-sm"
          />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={saveDraft} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Menyimpan..." : "Simpan Draft"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="scene" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 bg-white border-b border-slate-200 shrink-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scene">Edit Scene {currentIndex + 1}</TabsTrigger>
              <TabsTrigger value="caption">Hook & Detail</TabsTrigger>
            </TabsList>
          </div>
          
          <ScrollArea className="flex-1 p-6">
            <TabsContent value="scene" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-semibold text-slate-600">
                    Scene {currentIndex + 1} of {draft.scenes.length}
                  </span>
                  <Button variant="outline" size="icon" onClick={() => setCurrentIndex(Math.min(draft.scenes.length - 1, currentIndex + 1))} disabled={currentIndex === draft.scenes.length - 1}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={addScene} className="text-primary hover:text-[#4F17CE] hover:bg-primary/5">
                    <Plus className="w-4 h-4 mr-1" /> Tambah
                  </Button>
                  <Button variant="ghost" size="sm" onClick={removeScene} className="text-red-600 hover:text-red-700 hover:bg-red-50" disabled={draft.scenes.length <= 1}>
                    <Trash2 className="w-4 h-4 mr-1" /> Hapus
                  </Button>
                </div>
              </div>
              
              <ReelsSceneForm 
                key={currentScene.id}
                scene={currentScene} 
                onChange={updateScene} 
              />
            </TabsContent>

            <TabsContent value="caption" className="m-0 space-y-6 focus-visible:outline-none focus-visible:ring-0">
              <div className="space-y-2">
                <Label>Hook Video</Label>
                <Input 
                  value={draft.hook}
                  onChange={(e) => setDraft({...draft, hook: e.target.value})}
                  className="border-slate-200 focus-visible:ring-primary font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label>Caption Instagram</Label>
                <Textarea 
                  value={draft.caption}
                  onChange={(e) => setDraft({...draft, caption: e.target.value})}
                  rows={8}
                  className="resize-none border-slate-200 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label>Hashtags (pisahkan koma)</Label>
                <Input 
                  value={draft.hashtags.join(", ")}
                  onChange={(e) => setDraft({...draft, hashtags: e.target.value.split(",").map(h => h.trim())})}
                  className="border-slate-200 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label>Call to Action (CTA)</Label>
                <Input 
                  value={draft.cta}
                  onChange={(e) => setDraft({...draft, cta: e.target.value})}
                  className="border-slate-200 focus-visible:ring-primary"
                />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      {/* RIGHT: Script Preview */}
      <div className="w-[500px] flex flex-col shrink-0 bg-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
          <span className="font-semibold text-slate-800">Preview Script</span>
          <CopyButton text={generateFullScript()} label="Copy Script" className="border-primary/20 text-[#4F17CE] hover:bg-primary/5" />
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <pre className="font-sans text-[13px] leading-relaxed text-slate-700 whitespace-pre-wrap">
            {generateFullScript()}
          </pre>
        </div>
      </div>
    </div>
  );
}
