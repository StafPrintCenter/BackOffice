import { useState } from "react";
import { Link, useRouterState, useNavigate, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Wrench, FolderKanban, FileText, MessagesSquare, LogOut, Tags, BarChart3, HelpCircle, Link2, Form, Inbox, ShieldAlert, CalendarClock, GraduationCap, UserRoundPen, UserCheck, UserStar, UserCog, Mailbox, Flag, BriefcaseBusiness } from "lucide-react";

import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logos.json";
import { SITE } from "@/data/site";
import { ConfirmDisconnect } from "@/components/site/AdminBits";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarInset, } from "@/components/ui/sidebar";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean; matchPrefixes?: string[]; };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Général",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Contenu",
    items: [
      { to: "/categories", label: "Catégories", icon: Tags },
      { to: "/services", label: "Services", icon: Wrench },
      { to: "/projects", label: "Projets", icon: FolderKanban },
      { to: "/trainings/catalogs", label: "Formations", icon: GraduationCap, matchPrefixes: ["/trainings"] },
      { to: "/articles", label: "Articles", icon: FileText },
      { to: "/faqs", label: "FAQ", icon: HelpCircle },
      { to: "/testimonials", label: "Témoignages", icon: MessagesSquare },
      { to: "/stats", label: "Statistiques", icon: BarChart3 },
    ],
  },
  {
    label: "Communauté",
    items: [
      { to: "/messages", label: "Messages", icon: Inbox },
      { to: "/appointments", label: "Rendez-vous", icon: CalendarClock },
      { to: "/reports", label: "Signalements", icon: ShieldAlert },
      { to: "/newsletter/subscribers", label: "Newsletter", icon: Mailbox, matchPrefixes: ["/newsletter"] },
    ],
  },
  {
    label: "Outils",
    items: [
      { to: "/shortlinks", label: "Liens courts", icon: Link2 },
      { to: "/announces", label: "Annonces", icon: Flag },
      { to: "/reviews/forms", label: "Formulaires d'avis", icon: Form, matchPrefixes: ["/reviews"] },
    ],
  },
  {
    label: "Recrutements",
    items: [
      { to: "/jobs/offers", label: "Offres d'emploi", icon: BriefcaseBusiness, matchPrefixes: ["/jobs"] },
      { to: "/internships", label: "Stages", icon: BriefcaseBusiness, },
    ],
  },
  {
    label: "Membres",
    items: [
      { to: "/members/users", label: "Utilisateurs", icon: UserCheck },
      { to: "/members/students", label: "Apprenants", icon: UserRoundPen },
      { to: "/members/instructors", label: "Instructeurs", icon: UserStar },
      { to: "/members/admins", label: "Administrateurs", icon: UserCog },
    ],
  },
];

export function AdminShell({ children }: { children?: React.ReactNode }) {
  const { user, ready, isAuthenticated, logout } = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmDisconnectOpen, setConfirmDisconnectOpen] = useState(false);

  useEffect(() => {
    if (ready && !isAuthenticated) navigate({ to: "/login" });
  }, [ready, isAuthenticated, navigate]);

  if (!ready || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement...</div>;
  }

  const handleLogout = async () => {
    await logout();
    toast.success("Déconnecté");
    navigate({ to: "/login" });
  };

  const isLinkActive = (n: NavItem) =>
    n.exact ? pathname === n.to : n.matchPrefixes ? n.matchPrefixes.some((prefix) => pathname.startsWith(prefix)) : pathname.startsWith(n.to);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <SidebarHeader className="px-3 py-4">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center">
              <img src={logo.mw} alt="Logo SPC" className="h-9 w-auto" />
            </span>
            <span className="flex flex-col group-data-[collapsible=icon]:hidden min-w-0">
              <span className="font-display font-bold text-sm truncate">{SITE.name}</span>
              <span className="text-[10px] opacity-60 truncate">{user?.level}</span>
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          {NAV_GROUPS.map((g) => (
            <SidebarGroup key={g.label}>
              <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase tracking-wider text-[10px]">
                {g.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {g.items.map((item) => {
                    const active = isLinkActive(item);
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                          <Link to={item.to as "/dashboard"}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-2 space-y-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/profile")} tooltip="Profil">
                <Link to="/admin/profile">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                      <p className="text-xs font-medium truncate">{user?.name ?? "Profil"}</p>
                      <p className="text-[10px] opacity-60 truncate">{user?.email}</p>
                    </div>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setConfirmDisconnectOpen(true)}
                tooltip="Déconnexion"
                className="text-sidebar-foreground/80 hover:bg-destructive hover:text-white"
              >
                <LogOut className="size-4 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">Déconnexion</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="flex items-center gap-3 bg-card/80 backdrop-blur border-b px-4 h-14 shrink-0">
          <SidebarTrigger />
          <div className="font-display font-semibold text-sm">Admin</div>
          <div className="ml-auto text-xs text-muted-foreground hidden sm:block">{user?.email}</div>
        </header>
        <main className="flex-1 p-6 md:p-10 overflow-y-auto overflow-x-hidden">
          {children ?? <Outlet />}
        </main>
      </div>

      <ConfirmDisconnect
        open={confirmDisconnectOpen}
        onOpenChange={setConfirmDisconnectOpen}
        onConfirm={handleLogout}
      />
    </div>
  );
}
