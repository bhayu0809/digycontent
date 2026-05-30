import { useState } from "react";
import { reelsJsonSchema } from "./reels.schema";
import { mapReelsJsonToDraft } from "./reels.mapper";
import { ReelsDraft } from "@/types/reels";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FileJson } from "lucide-react";

interface ReelsJsonImporterProps {
  onImport: (draft: ReelsDraft) => void;
}

export function ReelsJsonImporter({ onImport }: ReelsJsonImporterProps) {
  const [jsonString, setJsonString] = useState("");

  const handleImport = () => {
    if (!jsonString.trim()) {
      toast.error("JSON masih kosong.");
      return;
    }

    try {
      const parsed = JSON.parse(jsonString);
      const validation = reelsJsonSchema.safeParse(parsed);

      if (!validation.success) {
        toast.error("Format JSON tidak valid. Pastikan format dari ChatGPT benar.");
        console.error(validation.error);
        return;
      }

      const draft = mapReelsJsonToDraft(validation.data);
      onImport(draft);
      toast.success("Berhasil mengimpor JSON Reels!");
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
          Import JSON Reels
        </h3>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">Paste output JSON script reels dari ChatGPT ke sini.</p>
      </div>
      <div className="flex-1 p-4">
        <Textarea 
          value={jsonString}
          onChange={(e) => setJsonString(e.target.value)}
          placeholder='{\n  "title": "...",\n  "scenes": [...]\n}'
          className="h-full w-full font-mono text-sm resize-none focus-visible:ring-primary border-slate-200"
        />
      </div>
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <Button onClick={handleImport} className="w-full bg-primary hover:bg-[#4F17CE] text-white font-bold transition-all shadow-sm">
          Import & Mulai Edit Script
        </Button>
      </div>
    </div>
  );
}
