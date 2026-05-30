import { useState } from "react";
import { carouselJsonSchema } from "./carousel.schema";
import { mapCarouselJsonToDraft } from "./carousel.mapper";
import { CarouselDraft } from "@/types/carousel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileJson } from "lucide-react";

interface JsonImporterProps {
  onImport: (draft: CarouselDraft) => void;
}

export function JsonImporter({ onImport }: JsonImporterProps) {
  const [jsonString, setJsonString] = useState("");

  const handleImport = () => {
    if (!jsonString.trim()) {
      toast.error("JSON masih kosong.");
      return;
    }

    try {
      const parsed = JSON.parse(jsonString);
      const validation = carouselJsonSchema.safeParse(parsed);

      if (!validation.success) {
        toast.error("Format JSON tidak valid. Pastikan format dari ChatGPT benar.");
        console.error(validation.error);
        return;
      }

      const draft = mapCarouselJsonToDraft(validation.data);
      onImport(draft);
      toast.success("Berhasil mengimpor JSON!");
      setJsonString("");
    } catch {
      toast.error("Gagal melakukan parse JSON. Pastikan teks yang di-paste adalah JSON murni tanpa ada sisa markdown.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <FileJson className="w-5 h-5 text-primary" />
          Import JSON
        </h3>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">Paste output JSON dari prompt generator ke sini untuk mulai mengedit slide.</p>
      </div>
      <div className="flex-1 p-4">
        <Textarea 
          value={jsonString}
          onChange={(e) => setJsonString(e.target.value)}
          placeholder='{\n  "title": "...",\n  "slides": [...]\n}'
          className="h-full w-full font-mono text-sm resize-none focus-visible:ring-primary border-slate-200"
        />
      </div>
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <Button onClick={handleImport} className="w-full bg-primary hover:bg-[#4F17CE] text-white font-bold transition-all shadow-sm">
          Import & Mulai Edit
        </Button>
      </div>
    </div>
  );
}
