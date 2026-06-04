import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  label?: string;
  className?: string;
}

export function LoadingScreen({ label = "Memuat...", className }: LoadingScreenProps) {
  return (
    <div className={cn("flex min-h-full flex-1 flex-col items-center justify-center gap-3 p-8 text-slate-500", className)}>
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
