import { PageHeader } from "@/components/layout/PageHeader";
import { DraftList } from "@/features/drafts/DraftList";

export default function DraftsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader 
        title="Draft Library" 
        description="Daftar semua konten yang sedang dikerjakan atau sudah selesai."
      />
      <div className="flex-1 p-8 bg-slate-50">
        <DraftList />
      </div>
    </div>
  );
}
