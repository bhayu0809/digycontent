import { PageHeader } from "@/components/layout/PageHeader";
import { CalendarBoard } from "@/features/calendar/CalendarBoard";

export default function CalendarPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader 
        title="Content Calendar" 
        description="Jadwal publikasi konten DigytaLab berdasarkan draft."
      />
      <div className="flex-1 p-8 bg-slate-50">
        <CalendarBoard />
      </div>
    </div>
  );
}
