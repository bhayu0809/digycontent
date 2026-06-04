"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Archive, CalendarDays, CheckCircle2, Clapperboard, Images, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { draftRepository } from "@/features/drafts/draft.repository";
import { ContentDraftBase } from "@/types/content";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [drafts, setDrafts] = useState<ContentDraftBase[] | null>(null);

  useEffect(() => {
    async function loadDrafts() {
      setDrafts(await draftRepository.getAll());
    }

    loadDrafts();
  }, []);

  if (!drafts) {
    return (
      <>
        <PageHeader
          title="Dashboard"
          description="Ringkasan produksi konten DigytaLab"
        />
        <div className="p-4 text-sm text-slate-500 sm:p-6 lg:p-8">Memuat ringkasan...</div>
      </>
    );
  }

  const stats = [
    {
      label: "Total Draft",
      value: drafts.length,
      icon: Archive,
      className: "text-slate-700",
    },
    {
      label: "Carousel",
      value: drafts.filter((draft) => draft.format === "carousel").length,
      icon: Images,
      className: "text-primary",
    },
    {
      label: "Reels",
      value: drafts.filter((draft) => draft.format === "reels").length,
      icon: Clapperboard,
      className: "text-sky-600",
    },
    {
      label: "Ready",
      value: drafts.filter((draft) => draft.status === "ready").length,
      icon: CheckCircle2,
      className: "text-emerald-600",
    },
    {
      label: "Posted",
      value: drafts.filter((draft) => draft.status === "posted").length,
      icon: Send,
      className: "text-violet-600",
    },
    {
      label: "Scheduled",
      value: drafts.filter((draft) => draft.scheduledAt).length,
      icon: CalendarDays,
      className: "text-rose-600",
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Ringkasan produksi konten DigytaLab"
      />
      <div className="space-y-6 p-4 sm:space-y-8 sm:p-6 lg:p-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">{item.label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900 sm:mt-2 sm:text-3xl">{item.value}</p>
                </div>
                <item.icon className={cn("h-6 w-6 shrink-0 sm:h-8 sm:w-8", item.className)} />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Shortcut Produksi</h2>
          <p className="mt-1 text-sm text-slate-500">
            Lanjutkan workflow utama dari prompt, draft, sampai jadwal posting.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/carousel" className={cn(buttonVariants({ variant: "default" }), "bg-primary hover:bg-[#4F17CE]")}>
              Buat Carousel
            </Link>
            <Link href="/reels" className={cn(buttonVariants({ variant: "outline" }))}>
              Buat Reels
            </Link>
            <Link href="/drafts" className={cn(buttonVariants({ variant: "outline" }))}>
              Draft Library
            </Link>
            <Link href="/calendar" className={cn(buttonVariants({ variant: "outline" }))}>
              Content Calendar
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
