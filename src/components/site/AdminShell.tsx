import { Link, useRouterState, useNavigate, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Wrench, FolderKanban, FileText, MessagesSquare, LogOut, PanelLeftClose, Menu, X, UserCircle, Tags, BarChart3, HelpCircle, Link2, Form, Inbox, ShieldAlert, CalendarClock, GraduationCap, UserRoundPen, UserCheck, UserStar, UserCog, Mailbox, Flag, BriefcaseBusiness } from "lucide-react";

import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logos.json";
import { SITE } from "@/data/site";
import { ConfirmDisconnect } from "@/components/site/AdminBits";

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("admin_sidebar_collapsed");
    if (saved === "1") setCollapsed(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("admin_sidebar_collapsed", collapsed ? "1" : "0");
    }
  }, [collapsed]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (!ready || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement...</div>;
  }

  const handleLogout = async () => {
    await logout();
    toast.success("Déconnecté");
    navigate({ to: "/login" });
  };

  const width = collapsed ? "md:w-16" : "md:w-64";
  const profileActive = pathname.startsWith("/admin/profile");

  const renderItem = (n: NavItem) => {
    const active = n.exact ? pathname === n.to : n.matchPrefixes ? n.matchPrefixes.some((prefix) => pathname.startsWith(prefix)) : pathname.startsWith(n.to);
    const Icon = n.icon;
    return (
      <Link
        key={n.to}
        to={n.to as "/dashboard"}
        title={collapsed ? n.label : undefined}
        className={
          "flex items-center gap-3 rounded-lg text-sm transition-colors " +
          (collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2") + " " +
          (active
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")
        }
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="truncate">{n.label}</span>}
      </Link>
    );
  };

  const SidebarInner = (
    <>
      <div className={"border-b border-sidebar-border flex items-center gap-2 " + (collapsed ? "p-3 justify-center" : "p-5")}>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center">
          <img src={logo.mw} alt="Logo SPC" className="h-10 w-auto" />
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-display font-bold text-sm truncate"> {SITE.name} </div>

            <div className="text-[10px] opacity-60 truncate">{user?.level}</div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-4 overflow-y-auto no-scrollbar">
        {NAV_GROUPS.map((g) => (
          <div key={g.label} className="space-y-1">
            {!collapsed && (
              <div className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
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
