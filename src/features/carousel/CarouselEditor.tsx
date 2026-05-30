"use client";

import { useEffect, useRef, useState } from "react";
import { CarouselDraft, CarouselSlide, withDefaultCarouselLogo } from "@/types/carousel";
import { CarouselSlideForm } from "./CarouselSlideForm";
import { CarouselSlidePreview } from "./CarouselSlidePreview";
import { JsonImporter } from "./JsonImporter";
import { CopyButton } from "@/components/shared/CopyButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Archive, Download, Save, Plus, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { carouselRepository } from "./carousel.repository";
import { exportElementToPng } from "@/lib/image-export";
import { exportElementsToZip } from "@/lib/zip-export";
import { generateId } from "@/lib/id";
import { buildCarouselImageBatchPrompt } from "@/features/prompts/prompt-builder";

export function CarouselEditor() {
  const [draft, setDraft] = useState<CarouselDraft | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const loadedDraftIdRef = useRef<string | null>(null);

  useEffect(() => {
    const draftId = new URLSearchParams(window.location.search).get("draftId");
    if (!draftId || loadedDraftIdRef.current === draftId) return;

    loadedDraftIdRef.current = draftId;
    const selectedDraftId = draftId;

    async function loadDraft() {
      const savedDraft = await carouselRepository.getById(selectedDraftId);

      if (!savedDraft) {
        toast.error("Draft carousel tidak ditemukan.");
        return;
      }

      setDraft(normalizeCarouselDraft(savedDraft));
      setCurrentIndex(0);
      toast.success("Draft carousel dibuka.");
    }

    loadDraft();
  }, []);

  const handleImport = (newDraft: CarouselDraft) => {
    setDraft(normalizeCarouselDraft(newDraft));
    setCurrentIndex(0);
  };

  const updateSlide = (updatedSlide: CarouselSlide, options?: { persist?: boolean; successMessage?: string }) => {
    if (!draft) return;
    const newSlides = [...draft.slides];
    const slideIndex = newSlides.findIndex((slide) => slide.id === updatedSlide.id);

    if (slideIndex === -1) return;

    newSlides[slideIndex] = updatedSlide;
    const nextDraft = { ...draft, slides: newSlides };
    setDraft(nextDraft);

    if (options?.persist) {
      void persistDraft(nextDraft, options.successMessage || "Draft otomatis disimpan.");
    }
  };

  const addSlide = () => {
    if (!draft) return;
    const newSlide: CarouselSlide = withDefaultCarouselLogo({
      id: generateId(),
      order: draft.slides.length,
      headline: "New Headline",
      body: "Text for the new slide",
      imagePrompt: "",
    });
    setDraft({ ...draft, slides: [...draft.slides, newSlide] });
    setCurrentIndex(draft.slides.length);
  };

  const removeSlide = () => {
    if (!draft || draft.slides.length <= 1) {
      toast.error("Minimal harus ada 1 slide.");
      return;
    }
    const newSlides = draft.slides.filter((_, idx) => idx !== currentIndex);
    // re-order
    newSlides.forEach((s, i) => s.order = i);
    setDraft({ ...draft, slides: newSlides });
    if (currentIndex >= newSlides.length) {
      setCurrentIndex(newSlides.length - 1);
    }
  };

  const saveDraft = async () => {
    if (!draft) return;

    await persistDraft(draft, "Draft berhasil disimpan!");
  };

  const persistDraft = async (nextDraft: CarouselDraft, successMessage: string) => {
    setIsSaving(true);
    try {
      await carouselRepository.save(nextDraft);
      toast.success(successMessage);
    } catch {
      toast.error("Gagal menyimpan draft.");
    } finally {
      setIsSaving(false);
    }
  };

  const exportCurrentPng = async () => {
    if (!draft) return;
    setIsExporting(true);
    const filename = `slide-${currentIndex + 1}-${draft.title.replace(/\\s+/g, '-').toLowerCase()}`;
    
    const success = await exportElementToPng(`hidden-slide-${draft.slides[currentIndex].id}`, filename);
    if (success) toast.success("Gambar berhasil didownload!");
    else toast.error("Gagal mendownload gambar.");
    setIsExporting(false);
  };

  const exportAllZip = async () => {
    if (!draft) return;
    setIsExporting(true);
    toast.info("Sedang memproses ZIP, mohon tunggu...");
    
    // To export all slides, they all need to be rendered in the DOM.
    // In this MVP we render a hidden container with all slides for ZIP export.
    const elementIds = draft.slides.map(s => `hidden-slide-${s.id}`);
    const filename = `carousel-${draft.title.replace(/\\s+/g, '-').toLowerCase()}`;
    
    // Give DOM a tick to render the hidden slides
    setTimeout(async () => {
      const success = await exportElementsToZip(elementIds, filename);
      if (success) toast.success("ZIP berhasil didownload!");
      else toast.error("Gagal mendownload ZIP.");
      setIsExporting(false);
    }, 500);
  };

  if (!draft) {
    return <JsonImporter onImport={handleImport} />;
  }

  const currentSlide = draft.slides[currentIndex];
  const allSlideImagePrompt = buildCarouselImageBatchPrompt(draft.title, draft.slides);

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
            <CopyButton
              text={allSlideImagePrompt}
              label="Copy Prompt Semua"
              className="border-primary/20 text-[#4F17CE] hover:bg-primary/5"
            />
            <Button variant="outline" size="sm" onClick={saveDraft} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Menyimpan..." : "Simpan Draft"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="slide" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 bg-white border-b border-slate-200 shrink-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="slide">Edit Slide {currentIndex + 1}</TabsTrigger>
              <TabsTrigger value="caption">Caption & Detail</TabsTrigger>
            </TabsList>
          </div>
          
          <ScrollArea className="flex-1 p-6">
            <TabsContent value="slide" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-semibold text-slate-600">
                    Slide {currentIndex + 1} of {draft.slides.length}
                  </span>
                  <Button variant="outline" size="icon" onClick={() => setCurrentIndex(Math.min(draft.slides.length - 1, currentIndex + 1))} disabled={currentIndex === draft.slides.length - 1}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={addSlide} className="text-primary hover:text-[#4F17CE] hover:bg-primary/5">
                    <Plus className="w-4 h-4 mr-1" /> Tambah
                  </Button>
                  <Button variant="ghost" size="sm" onClick={removeSlide} className="text-red-600 hover:text-red-700 hover:bg-red-50" disabled={draft.slides.length <= 1}>
                    <Trash2 className="w-4 h-4 mr-1" /> Hapus
                  </Button>
                </div>
              </div>
              
              <CarouselSlideForm 
                key={currentSlide.id}
                slide={currentSlide} 
                onChange={updateSlide} 
              />
            </TabsContent>

            <TabsContent value="caption" className="m-0 space-y-6 focus-visible:outline-none focus-visible:ring-0">
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

      {/* RIGHT: Preview */}
      <div className="w-[500px] flex flex-col shrink-0 bg-slate-100 overflow-hidden relative">
        <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
          <span className="font-semibold text-slate-800">Preview 1080x1350</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCurrentPng} disabled={isExporting}>
              <Download className="w-4 h-4 mr-2 text-primary" /> PNG Slide {currentIndex + 1}
            </Button>
            <Button size="sm" onClick={exportAllZip} disabled={isExporting} className="bg-primary hover:bg-[#4F17CE]">
              <Archive className="w-4 h-4 mr-2" /> ZIP Semua Slide
            </Button>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto bg-slate-200/50">
          <div id="carousel-preview-container" className="shadow-2xl ring-1 ring-slate-900/5">
            <CarouselSlidePreview 
              slide={currentSlide} 
              currentSlideIndex={currentIndex}
              totalSlides={draft.slides.length}
              onChange={updateSlide}
            />
          </div>
        </div>

        {/* HIDDEN CONTAINER FOR ZIP EXPORT */}
        <div className="absolute top-[-9999px] left-[-9999px]">
          {draft.slides.map((slide, i) => (
            <div id={`hidden-slide-${slide.id}`} key={`hidden-${slide.id}`}>
              <CarouselSlidePreview 
                slide={slide} 
                currentSlideIndex={i}
                totalSlides={draft.slides.length}
                showPagination={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function normalizeCarouselDraft(draft: CarouselDraft): CarouselDraft {
  return {
    ...draft,
    slides: draft.slides.map(withDefaultCarouselLogo),
  };
}
