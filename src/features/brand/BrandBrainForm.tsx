"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save, RefreshCw } from "lucide-react";
import { brandRepository } from "./brand.repository";
import { BrandProfile } from "@/types/brand";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export function BrandBrainForm() {
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm<BrandProfile>({
    defaultValues: brandRepository.getDefaultTemplate(),
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await brandRepository.getProfile("default");
        reset(profile || brandRepository.getDefaultTemplate());
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Gagal memuat Brand Brain.");
        reset(brandRepository.getDefaultTemplate());
      }
    }

    loadProfile();
  }, [reset]);

  const onSubmit = async (data: BrandProfile) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await brandRepository.saveProfile(payload);
      toast.success("Brand Brain berhasil disimpan.");
    } catch {
      toast.error("Gagal menyimpan Brand Brain.");
    } finally {
      setIsSaving(false);
    }
  };

  const loadDefault = () => {
    reset(brandRepository.getDefaultTemplate());
    toast.info("Template default dimuat. Klik Simpan untuk memperbarui.");
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-slate-800">Profil Brand</CardTitle>
            <CardDescription className="text-slate-500">Informasi ini akan selalu disisipkan dalam prompt AI.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadDefault} className="text-slate-600 hover:text-primary hover:bg-primary/5">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset ke Default
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form id="brand-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700">Nama Brand</Label>
              <Input id="name" {...register("name")} placeholder="Contoh: DigytaLab" className="border-slate-200 focus-visible:ring-primary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toneOfVoice" className="text-slate-700">Tone of Voice</Label>
              <Input id="toneOfVoice" {...register("toneOfVoice")} placeholder="Santai, edukatif..." className="border-slate-200 focus-visible:ring-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="positioning" className="text-slate-700">Positioning / Bio</Label>
            <Textarea id="positioning" {...register("positioning")} rows={3} placeholder="Membantu UMKM..." className="border-slate-200 focus-visible:ring-primary resize-none" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetAudience" className="text-slate-700">Target Audience</Label>
            <Textarea id="targetAudience" {...register("targetAudience")} rows={2} placeholder="Pemilik bisnis lokal..." className="border-slate-200 focus-visible:ring-primary resize-none" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cta" className="text-slate-700">Call to Action Utama</Label>
            <Input id="cta" {...register("cta")} placeholder="Mau dibantu rapihin alur digital? Chat kami." className="border-slate-200 focus-visible:ring-primary" />
          </div>
        </form>
      </CardContent>
      <CardFooter className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
        <Button 
          type="submit" 
          form="brand-form" 
          disabled={isSaving}
          className="bg-primary hover:bg-[#4F17CE] text-white font-semibold shadow-sm transition-all"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Menyimpan..." : "Simpan Profil"}
        </Button>
      </CardFooter>
    </Card>
  );
}
