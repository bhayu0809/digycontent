"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Loader2, Save, Sparkles } from "lucide-react";
import { brandRepository } from "@/features/brand/brand.repository";
import { carouselRepository } from "@/features/carousel/carousel.repository";
import { reelsRepository } from "@/features/reels/reels.repository";
import { buildDailyIdeasPrompt } from "./prompt-builder";
import { CarouselDraft } from "@/types/carousel";
import { ReelsDraft } from "@/types/reels";
import { BrandProfile } from "@/types/brand";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CopyButton } from "@/components/shared/CopyButton";
import { cn } from "@/lib/utils";

type GeneratedIdea = CarouselDraft | ReelsDraft;
type IdeaFormatMode = "mixed" | "carousel" | "reels";
type AudienceFocus = "umkm" | "education";

type GenerateIdeasResponse = {
  ideas?: GeneratedIdea[];
  message?: string;
};

export function DailyIdeaGenerator() {
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const brand = profile || brandRepository.getDefaultTemplate();
  const [postingDate, setPostingDate] = useState(getTodayDate());
  const [contentTitle, setContentTitle] = useState("");
  const [targetBusiness, setTargetBusiness] = useState("");
  const [audienceFocus, setAudienceFocus] = useState<AudienceFocus>("umkm");
  const [formatMode, setFormatMode] = useState<IdeaFormatMode>("mixed");
  const [carouselSlideCount, setCarouselSlideCount] = useState(6);
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setProfile(await brandRepository.getProfile("default"));
      } catch {
        setProfile(null);
      }
    }

    loadProfile();
  }, []);

  const fallbackPrompt = useMemo(() => {
    return buildDailyIdeasPrompt({ postingDate, targetBusiness, contentTitle, audienceFocus, formatMode, carouselSlideCount }, brand);
  }, [audienceFocus, brand, carouselSlideCount, contentTitle, formatMode, postingDate, targetBusiness]);

  const generateIdeas = async () => {
    const currentIdeaSummaries = ideas.map((idea) => {
      const firstContent = idea.format === "carousel"
        ? idea.slides[0]?.headline || idea.slides[0]?.body || ""
        : idea.hook || idea.scenes[0]?.voiceover || "";

      return [idea.title, idea.format, idea.pillar, idea.targetBusiness, firstContent].filter(Boolean).join(" | ");
    });

    setIsGenerating(true);
    setErrorMessage("");
    setIdeas([]);
    setSavedIds([]);

    try {
      const response = await fetch("/api/content-ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postingDate,
          targetBusiness,
          contentTitle,
          audienceFocus,
          formatMode,
          carouselSlideCount,
          brand,
          currentIdeaSummaries,
        }),
      });

      const result = (await response.json()) as GenerateIdeasResponse;

      if (!response.ok || !result.ideas?.length) {
        setErrorMessage(result.message || "AI belum berhasil membuat ide.");
        return;
      }

      setIdeas(result.ideas);
      toast.success(`${result.ideas.length} ide konten berhasil dibuat.`);
    } catch {
      setErrorMessage("Tidak bisa menghubungi API generate ide. Cek dev server dan koneksi internet.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveIdea = async (idea: GeneratedIdea) => {
    if (idea.format === "carousel") {
      await carouselRepository.save(idea);
    } else {
      await reelsRepository.save(idea);
    }

    setSavedIds((currentIds) => currentIds.includes(idea.id) ? currentIds : [...currentIds, idea.id]);
  };

  const handleSaveIdea = async (idea: GeneratedIdea) => {
    await saveIdea(idea);
    toast.success("Ide disimpan sebagai draft.");
  };

  const handleSaveAll = async () => {
    setIsSavingAll(true);

    try {
      for (const idea of ideas) {
        await saveIdea(idea);
      }
      toast.success("Semua ide disimpan sebagai draft.");
    } finally {
      setIsSavingAll(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-white shadow-sm">
      <CardHeader className="border-b border-primary/10 bg-primary/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate 3 Ide Hari Ini
            </CardTitle>
            <CardDescription className="mt-1 max-w-2xl text-slate-600">
              Isi judul/topik kalau sudah ada, atau kosongkan supaya AI memilih angle dari Brand Brain.
            </CardDescription>
          </div>
          <CopyButton text={fallbackPrompt} label="Copy Prompt Fallback" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
          <div className="space-y-2">
            <Label htmlFor="postingDate">Tanggal Posting</Label>
            <Input
              id="postingDate"
              type="date"
              value={postingDate}
              onChange={(event) => setPostingDate(event.target.value)}
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contentTitle">Judul / Topik Konten Opsional</Label>
            <Input
              id="contentTitle"
              value={contentTitle}
              onChange={(event) => setContentTitle(event.target.value)}
              placeholder="Contoh: Kenapa salon butuh website, bukan cuma Instagram"
              className="bg-white"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_170px_180px_180px_auto] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="targetBusiness">Target Bisnis Opsional</Label>
            <Input
              id="targetBusiness"
              value={targetBusiness}
              onChange={(event) => setTargetBusiness(event.target.value)}
              placeholder="Kosongkan agar AI memilih sendiri, contoh: pemilik cafe kecil"
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>Fokus Target</Label>
            <Select value={audienceFocus} onValueChange={(value) => setAudienceFocus(value as AudienceFocus)}>
              <SelectTrigger className="h-10 w-full bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="umkm">UMKM</SelectItem>
                <SelectItem value="education">Pendidikan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Format Konten</Label>
            <Select value={formatMode} onValueChange={(value) => setFormatMode(value as IdeaFormatMode)}>
              <SelectTrigger className="h-10 w-full bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mixed">Campuran</SelectItem>
                <SelectItem value="carousel">Carousel semua</SelectItem>
                <SelectItem value="reels">Reels semua</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="carouselSlideCount">Slide Carousel</Label>
            <Input
              id="carouselSlideCount"
              type="number"
              min={3}
              max={10}
              value={carouselSlideCount}
              disabled={formatMode === "reels"}
              onChange={(event) => setCarouselSlideCount(clampSlideCount(Number(event.target.value)))}
              className="bg-white"
            />
          </div>
          <Button onClick={generateIdeas} disabled={isGenerating || !postingDate} className="bg-primary text-white hover:bg-[#4F17CE]">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? "Generate..." : "Generate 3 Konten"}
          </Button>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Generate otomatis belum bisa dipakai.</p>
            <p className="mt-1">{errorMessage}</p>
            <p className="mt-2 text-red-600">
              Pakai tombol Copy Prompt Fallback untuk sementara, atau isi `GEMINI_API_KEY` di `.env.local`.
            </p>
          </div>
        )}

        {ideas.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <CalendarDays className="h-4 w-4 text-primary" />
                Ide untuk {postingDate}
              </div>
              <Button variant="outline" size="sm" onClick={handleSaveAll} disabled={isSavingAll}>
                <Save className="h-4 w-4" />
                {isSavingAll ? "Menyimpan..." : "Simpan Semua"}
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {ideas.map((idea) => {
                const isSaved = savedIds.includes(idea.id);

                return (
                  <div key={idea.id} className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="capitalize">{idea.format}</Badge>
                        <Badge variant="outline">{idea.pillar}</Badge>
                        {isSaved && <Badge className="bg-emerald-600 text-white">Tersimpan</Badge>}
                      </div>
                      <h3 className="text-base font-bold leading-snug text-slate-900">{idea.title}</h3>
                      <p className="text-xs text-slate-500">{idea.targetBusiness || "Target dipilih AI"}</p>
                    </div>

                    <p className="line-clamp-4 text-sm leading-relaxed text-slate-600">
                      {idea.format === "carousel" ? idea.slides[0]?.body : idea.hook}
                    </p>

                    {idea.notes && (
                      <div className="rounded-md border border-primary/20 bg-primary/5 p-2 text-xs leading-relaxed text-[#4F17CE]">
                        {idea.notes}
                      </div>
                    )}

                    <div className="mt-auto flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleSaveIdea(idea)} disabled={isSaved}>
                        <Save className="h-4 w-4" />
                        {isSaved ? "Tersimpan" : "Simpan Draft"}
                      </Button>
                      <Link
                        href={`/${idea.format}?draftId=${idea.id}`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), !isSaved && "pointer-events-none opacity-50")}
                        aria-disabled={!isSaved}
                      >
                        Buka
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function clampSlideCount(value: number) {
  if (Number.isNaN(value)) return 6;

  return Math.min(Math.max(Math.round(value), 3), 10);
}
