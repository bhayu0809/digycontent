import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/sonner";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto flex flex-col relative">
        {children}
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
