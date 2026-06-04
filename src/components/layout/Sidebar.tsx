"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionUser } from "@/lib/session";
import { navigation } from "./navigation";

interface SidebarProps {
  user: SessionUser;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="hidden h-full w-64 shrink-0 flex-col bg-white border-r border-slate-200 lg:flex">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200">
        <h1 className="text-xl font-black tracking-tight text-primary">
          Digy<span className="text-slate-900">Content</span>
        </h1>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
        <nav className="flex-1 space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-[#4F17CE]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors duration-200",
                    isActive ? "text-primary" : "text-slate-400 group-hover:text-primary"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="shrink-0 border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
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
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{user.email}</p>
          </div>
          <a
            href="/api/auth/logout"
            title="Sign out"
            className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <LogOut className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
