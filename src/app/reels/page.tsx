import { PageHeader } from "@/components/layout/PageHeader";
import { ReelsEditor } from "@/features/reels/ReelsEditor";

export default function ReelsPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader 
        title="Reels Studio" 
        description="Buat script, susun scene, dan rancang hook reels."
      />
      <div className="flex-1 overflow-hidden">
        <ReelsEditor />
      </div>
    </div>
  );
}
