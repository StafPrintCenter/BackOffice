import { LayoutDashboard, BookOpen, Users, ClipboardCheck, CalendarDays, Users2, Bell, Send } from "lucide-react";
import { SITE_LINK } from "@/data/site";

export const docsUrl = `${SITE_LINK.docsUrl}/docs/instructor/index`;

export type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  matchPrefixes?: string[];
};

export type NavGroup = { label: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Général",
    items: [
      { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
      { to: "/notifications", label: "Notifications", icon: Bell, matchPrefixes: ["/notifications"] },
    ],
  },
  {
    label: "Pilotage",
    items: [
      { to: "/trainings", label: "Mes formations", icon: BookOpen },
      { to: "/students", label: "Apprenants", icon: Users },
      { to: "/submissions", label: "Soumission", icon: Send },
      { to: "/corrections", label: "Corrections", icon: ClipboardCheck },
      { to: "/sessions", label: "Sessions", icon: CalendarDays },
    ],
  },
  {
    label: "Échanges",
    items: [
      { to: "/community", label: "Communauté", icon: Users2 },
    ],
  },
];

export const navItemClass =
  "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground " +
  "data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground " +
  "data-[active=true]:hover:bg-sidebar-primary data-[active=true]:hover:text-sidebar-primary-foreground";