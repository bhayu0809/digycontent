import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { getSession } from "@/lib/session";

export async function AppShell({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (!session) {
    return (
      <>
        {children}
        <Toaster richColors position="top-right" />
      </>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans">
      <Sidebar user={session} />
      <main className="flex-1 overflow-y-auto flex flex-col relative">
        {children}
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
