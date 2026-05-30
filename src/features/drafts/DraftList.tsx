"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { draftRepository } from "@/features/drafts/draft.repository";
import { ContentStatus, ContentFormat, ContentDraftBase } from "@/types/content";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, Copy, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function DraftList() {
  const [drafts, setDrafts] = useState<ContentDraftBase[] | null>(null);
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState<ContentFormat | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">("all");

  const loadDrafts = useCallback(async () => {
    try {
      setDrafts(await draftRepository.getAll());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat draft.");
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
        toast.error(error instanceof Error ? error.message : "Gagal memuat draft.");
        setDrafts([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus draft ini?")) {
      await draftRepository.delete(id);
      await loadDrafts();
      toast.success("Draft berhasil dihapus.");
    }
  };

  const handleDuplicate = async (id: string) => {
    await draftRepository.duplicate(id);
    await loadDrafts();
    toast.success("Draft berhasil diduplikasi.");
  };

  const handleStatusChange = async (id: string, status: ContentStatus) => {
    await draftRepository.updateStatus(id, status);
    await loadDrafts();
    toast.success("Status diperbarui.");
  };

  const handleScheduleChange = async (id: string, date: string) => {
    const scheduledAt = date ? new Date(`${date}T00:00:00`).toISOString() : undefined;
    await draftRepository.updateScheduledAt(id, scheduledAt);
    await loadDrafts();
    toast.success(date ? "Jadwal tampil diperbarui." : "Jadwal tampil dikosongkan.");
  };

  if (!drafts) return <div className="text-slate-500 flex justify-center py-10">Memuat draft...</div>;

  if (drafts.length === 0) return (
    <div className="bg-white rounded-lg border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
      <Archive className="w-12 h-12 mx-auto mb-4 text-slate-300" />
      <p>Belum ada draft konten tersimpan.</p>
    </div>
  );

  const filteredDrafts = drafts.filter((draft) => {
    const matchesSearch = draft.title.toLowerCase().includes(search.toLowerCase().trim());
    const matchesFormat = formatFilter === "all" || draft.format === formatFilter;
    const matchesStatus = statusFilter === "all" || draft.status === statusFilter;

    return matchesSearch && matchesFormat && matchesStatus;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_180px_180px]">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari judul draft..."
          className="border-slate-200 bg-white"
        />
        <Select value={formatFilter} onValueChange={(value) => setFormatFilter(value as ContentFormat | "all")}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Filter format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua format</SelectItem>
            <SelectItem value="carousel">Carousel</SelectItem>
            <SelectItem value="reels">Reels</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ContentStatus | "all")}>
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="idea">Idea</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="posted">Posted</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filteredDrafts.length === 0 ? (
        <div className="p-10 text-center text-sm text-slate-500">
          Tidak ada draft yang cocok dengan filter.
        </div>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
            <tr>
              <th className="px-6 py-4">Judul Konten</th>
              <th className="px-6 py-4">Format</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Jadwal Tampil</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDrafts.map(draft => (
              <tr key={draft.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{draft.title}</td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className="bg-slate-100 text-slate-700 capitalize">
                    {draft.format}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Select value={draft.status} onValueChange={(v) => handleStatusChange(draft.id, v as ContentStatus)}>
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idea">Idea</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="posted">Posted</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  <div className="flex flex-col gap-1">
                    <Input
                      type="date"
                      value={draft.scheduledAt ? format(new Date(draft.scheduledAt), "yyyy-MM-dd") : ""}
                      onChange={(event) => handleScheduleChange(draft.id, event.target.value)}
                      className="h-8 w-36 text-xs"
                    />
                    <span className="text-xs">
                      {draft.scheduledAt ? format(new Date(draft.scheduledAt), "dd MMM yyyy", { locale: id }) : "Belum dijadwalkan"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/${draft.format}?draftId=${draft.id}`}
                      title="Buka draft"
                      className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                    >
                      <ExternalLink className="w-4 h-4 text-slate-500" />
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => handleDuplicate(draft.id)} title="Duplicate">
                      <Copy className="w-4 h-4 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(draft.id)} title="Delete">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
