"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Brain, Lightbulb, Images, Clapperboard, Archive, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Brand Brain", href: "/brand", icon: Brain },
  { name: "Content Ideas", href: "/ideas", icon: Lightbulb },
  { name: "Carousel Studio", href: "/carousel", icon: Images },
  { name: "Reels Studio", href: "/reels", icon: Clapperboard },
  { name: "Draft Library", href: "/drafts", icon: Archive },
  { name: "Content Calendar", href: "/calendar", icon: CalendarDays },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-slate-200">
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
    </div>
  );
}
