import { LayoutDashboard, Brain, Lightbulb, Images, Clapperboard, Archive, CalendarDays, LucideIcon } from "lucide-react";

export interface NavItem {
  name: string;
  shortName: string;
  href: string;
  icon: LucideIcon;
}

export const navigation: NavItem[] = [
  { name: "Dashboard", shortName: "Home", href: "/", icon: LayoutDashboard },
  { name: "Brand Brain", shortName: "Brand", href: "/brand", icon: Brain },
  { name: "Content Ideas", shortName: "Ideas", href: "/ideas", icon: Lightbulb },
  { name: "Carousel Studio", shortName: "Carousel", href: "/carousel", icon: Images },
  { name: "Reels Studio", shortName: "Reels", href: "/reels", icon: Clapperboard },
  { name: "Draft Library", shortName: "Drafts", href: "/drafts", icon: Archive },
  { name: "Content Calendar", shortName: "Calendar", href: "/calendar", icon: CalendarDays },
];
