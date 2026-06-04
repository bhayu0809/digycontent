"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { draftRepository } from "@/features/drafts/draft.repository";
import { ContentDraftBase, ContentStatus } from "@/types/content";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek, compareAsc } from "date-fns";
import { id } from "date-fns/locale";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function CalendarBoard() {
  const [drafts, setDrafts] = useState<ContentDraftBase[] | null>(null);

  const loadDrafts = useCallback(async () => {
    try {
      setDrafts(await draftRepository.getAll());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat kalender.");
      setDrafts([]);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    draftRepository.getAll()
      .then((nextDrafts) => {
        if (isMounted) setDrafts(nextDrafts);
      })
      .catch((error: unknown) => {
        if (!isMounted) return;
        toast.error(error instanceof Error ? error.message : "Gagal memuat kalender.");
        setDrafts([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!drafts) return <LoadingScreen label="Memuat kalender..." />;

  const scheduledDrafts = drafts.filter(d => d.scheduledAt);
  const agendaDrafts = [...scheduledDrafts].sort((a, b) =>
    compareAsc(new Date(a.scheduledAt as string), new Date(b.scheduledAt as string))
  );
  const handleStatusChange = async (draftId: string, status: ContentStatus) => {
    await draftRepository.updateStatus(draftId, status);
    await loadDrafts();
    toast.success("Status kalender diperbarui.");
  };

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  
  // Fill calendar grid including empty days
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <>
      {/* MOBILE: agenda list */}
      <div className="lg:hidden space-y-4">
        <h2 className="text-lg font-bold text-slate-800 capitalize">
          {format(today, "MMMM yyyy", { locale: id })}
        </h2>
        {agendaDrafts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Belum ada konten terjadwal.
          </div>
        ) : (
          <div className="space-y-3">
            {agendaDrafts.map((draft) => (
              <div key={draft.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <span className="capitalize">
                    {format(new Date(draft.scheduledAt as string), "EEEE, d MMM yyyy", { locale: id })}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-slate-800 line-clamp-2">{draft.title}</span>
                  <Link
                    href={`/${draft.format}?draftId=${draft.id}`}
                    title="Buka draft"
                    className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "shrink-0")}
                  >
                    <ExternalLink className="w-4 h-4 text-slate-500" />
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded capitalize">{draft.format}</span>
                  <Select value={draft.status} onValueChange={(value) => handleStatusChange(draft.id, value as ContentStatus)}>
                    <SelectTrigger className={cn("h-8 flex-1 text-xs font-semibold capitalize", getStatusClassName(draft.status))}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="posted">Posted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DESKTOP: month grid */}
      <div className="hidden lg:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6">
        <h2 className="text-xl font-bold mb-6 text-slate-800 capitalize">
          {format(today, "MMMM yyyy", { locale: id })}
        </h2>
        <div className="grid grid-cols-7 gap-4">
        {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map(day => (
          <div key={day} className="text-center font-semibold text-slate-500 text-sm py-2">
            {day}
          </div>
        ))}
        {days.map(day => {
          const isCurrentMonth = day.getMonth() === today.getMonth();
          const dayDrafts = scheduledDrafts.filter(d => d.scheduledAt && isSameDay(new Date(d.scheduledAt), day));
          
          return (
            <div 
              key={day.toISOString()} 
              className={`min-h-40 border border-slate-100 rounded-lg p-2 transition-colors ${isCurrentMonth ? "bg-slate-50 hover:bg-slate-100" : "bg-slate-50/30 opacity-50"}`}
            >
              <div className="text-right text-xs font-medium text-slate-500 mb-2">
                {format(day, "d")}
              </div>
              <div className="space-y-1.5">
                {dayDrafts.map(draft => (
                  <div key={draft.id} className="text-xs p-2 bg-white border border-slate-200 rounded shadow-sm flex flex-col gap-2 overflow-hidden">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-primary line-clamp-2">{draft.title}</span>
                      <Link
                        href={`/${draft.format}?draftId=${draft.id}`}
                        title="Buka draft"
                        className={cn(buttonVariants({ variant: "ghost", size: "icon-xs" }), "shrink-0")}
                      >
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </Link>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-[9px] px-1 py-0.5 bg-slate-100 text-slate-600 rounded capitalize">{draft.format}</span>
                      <span className={cn("text-[9px] px-1 py-0.5 rounded capitalize font-semibold", getStatusClassName(draft.status))}>
                        {draft.status}
                      </span>
                    </div>
                    <Select value={draft.status} onValueChange={(value) => handleStatusChange(draft.id, value as ContentStatus)}>
                      <SelectTrigger className={cn("h-7 w-full text-[11px] font-semibold capitalize", getStatusClassName(draft.status))}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="idea">Idea</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="posted">Posted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </>
  );
}

function getStatusClassName(status: ContentStatus) {
  if (status === "idea") return "border-sky-200 bg-sky-50 text-sky-700";
  if (status === "draft") return "border-slate-200 bg-slate-100 text-slate-700";
  if (status === "ready") return "border-amber-200 bg-amber-50 text-amber-700";

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}
