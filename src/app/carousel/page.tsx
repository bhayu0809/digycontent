import { PageHeader } from "@/components/layout/PageHeader";
import { CarouselEditor } from "@/features/carousel/CarouselEditor";

export default function CarouselPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader 
        title="Carousel Studio" 
        description="Buat, edit, dan export carousel Instagram secara instan."
      />
      <div className="flex-1 overflow-hidden">
        <CarouselEditor />
      </div>
    </div>
  );
}
