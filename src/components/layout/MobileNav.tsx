"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionUser } from "@/lib/session";
import { navigation } from "./navigation";

interface MobileNavProps {
  user: SessionUser;
}

export function MobileTopBar({ user }: MobileNavProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm pt-[env(safe-area-inset-top)] lg:hidden">
      <Link href="/" className="text-lg font-black tracking-tight text-primary">
        Digy<span className="text-slate-900">Content</span>
      </Link>
      <div className="flex items-center gap-2">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <a
          href="/api/auth/logout"
          title="Sign out"
          aria-label="Sign out"
          className="rounded-md p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <LogOut className="h-5 w-5" />
        </a>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="grid grid-cols-7">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 px-0.5 py-1.5 text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-slate-400"
              )}
            >
              <item.icon
                className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-slate-400")}
                aria-hidden="true"
              />
              <span className="leading-tight">{item.shortName}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
