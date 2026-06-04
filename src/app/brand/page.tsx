import { PageHeader } from "@/components/layout/PageHeader";
import { BrandBrainForm } from "@/features/brand/BrandBrainForm";

export default function BrandBrainPage() {
  return (
    <div className="flex flex-col min-h-full">
      <PageHeader 
        title="Brand Brain" 
        description="Identitas dan panduan utama DigytaLab untuk generate konten."
      />
      <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <BrandBrainForm />
        </div>
      </div>
    </div>
  );
}
