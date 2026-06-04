import { PageHeader } from "@/components/layout/PageHeader";
import { DailyIdeaGenerator } from "@/features/prompts/DailyIdeaGenerator";

export default function IdeasPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader 
        title="Content Ideas"
        description="Generate 3 ide konten harian yang sesuai scope DigytaLab."
      />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50">
        <DailyIdeaGenerator />
      </div>
    </div>
  );
}
