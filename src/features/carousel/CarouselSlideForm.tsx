"use client";

import type { ChangeEvent } from "react";
import { CarouselSlide, DEFAULT_CAROUSEL_LOGO } from "@/types/carousel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/CopyButton";
import { buildDigytalabImagePrompt } from "@/features/prompts/prompt-builder";
import { ImagePlus, RotateCcw, Trash2 } from "lucide-react";

interface CarouselSlideFormProps {
  slide: CarouselSlide;
  onChange: (updated: CarouselSlide, options?: { persist?: boolean; successMessage?: string }) => void;
}

export function CarouselSlideForm({ slide, onChange }: CarouselSlideFormProps) {
  
  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ ...slide, [name]: value });
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageDataUrl = event.target?.result;
        if (typeof imageDataUrl !== "string") return;

        onChange(
          { ...slide, imageDataUrl },
          { persist: true, successMessage: "Gambar tersimpan. Aman saat refresh." }
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    onChange(
      { ...slide, imageDataUrl: undefined },
      { persist: true, successMessage: "Gambar dihapus dari draft." }
    );
  };

  const updateLogoVisibility = (checked: boolean) => {
    onChange({ ...slide, showLogo: checked });
  };

  const updateLogoSize = (value: string) => {
    onChange({ ...slide, logoSize: Number(value) });
  };

  const resetLogoPosition = () => {
    onChange({
      ...slide,
      showLogo: DEFAULT_CAROUSEL_LOGO.showLogo,
      logoX: DEFAULT_CAROUSEL_LOGO.logoX,
      logoY: DEFAULT_CAROUSEL_LOGO.logoY,
      logoSize: DEFAULT_CAROUSEL_LOGO.logoSize,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-slate-700">Headline</Label>
        <Input 
          name="headline" 
          value={slide.headline} 
          onChange={handleTextChange} 
          className="border-slate-200 focus-visible:ring-primary text-lg font-bold"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700">Body / Penjelasan</Label>
        <Textarea 
          name="body" 
          value={slide.body} 
          onChange={handleTextChange} 
          rows={3}
          className="border-slate-200 focus-visible:ring-primary resize-none"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label className="text-slate-700">Image Prompt (Untuk AI)</Label>
          <CopyButton
            text={buildDigytalabImagePrompt(slide.imagePrompt)}
            label="Copy Prompt"
            className="h-7 border-primary/20 text-[#4F17CE] hover:bg-primary/5"
          />
        </div>
        <Textarea 
          name="imagePrompt" 
          value={slide.imagePrompt} 
          onChange={handleTextChange} 
          rows={2}
          className="border-slate-200 bg-slate-50 text-slate-600 focus-visible:ring-primary resize-none text-xs font-mono"
        />
      </div>

      <div className="space-y-2 p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50">
        <Label className="text-slate-700 block mb-2">Background Image</Label>
        {slide.imageDataUrl ? (
          <div className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 bg-cover bg-center rounded" 
                style={{ backgroundImage: `url(${slide.imageDataUrl})` }} 
              />
              <span className="text-sm text-slate-600">Gambar Terpasang</span>
            </div>
            <Button variant="ghost" size="icon" onClick={removeImage} className="text-red-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden" 
              id={`upload-${slide.id}`} 
            />
            <Label 
              htmlFor={`upload-${slide.id}`}
              className="flex items-center justify-center w-full p-4 border border-slate-200 bg-white rounded cursor-pointer hover:bg-slate-100 transition-colors text-slate-600"
            >
              <ImagePlus className="w-5 h-5 mr-2 text-slate-400" />
              Upload Gambar
            </Label>
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label htmlFor={`show-logo-${slide.id}`} className="text-slate-700">Logo DigytaLab</Label>
            <p className="mt-1 text-xs text-slate-500">Geser logo langsung di preview.</p>
          </div>
          <input
            id={`show-logo-${slide.id}`}
            type="checkbox"
            checked={slide.showLogo ?? true}
            onChange={(event) => updateLogoVisibility(event.target.checked)}
            className="h-4 w-4 accent-[#673DE6]"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={`logo-size-${slide.id}`} className="text-slate-700">Ukuran Logo</Label>
            <span className="text-xs font-semibold text-slate-500">{Math.max(slide.logoSize ?? DEFAULT_CAROUSEL_LOGO.logoSize, 20)}%</span>
          </div>
          <input
            id={`logo-size-${slide.id}`}
            type="range"
            min="20"
            max="42"
            step="1"
            value={Math.max(slide.logoSize ?? DEFAULT_CAROUSEL_LOGO.logoSize, 20)}
            onChange={(event) => updateLogoSize(event.target.value)}
            className="w-full accent-[#673DE6]"
          />
        </div>

        <Button variant="outline" size="sm" onClick={resetLogoPosition} className="w-full">
          <RotateCcw className="h-4 w-4" />
          Reset Logo
        </Button>
      </div>
    </div>
  );
}
