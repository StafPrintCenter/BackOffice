import { Link, useRouterState, useNavigate, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Wrench, FolderKanban, FileText, MessagesSquare, LogOut, PanelLeftClose, Menu, X, UserCircle, Tags, BarChart3, HelpCircle, Link2, Inbox, ShieldAlert, CalendarClock, NotebookPen, UserRoundPen, UserCheck, UserStar, Mailbox } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/logos.json";
import { SITE } from "@/data/site";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Général",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Contenu",
    items: [
      { to: "/admin/categories", label: "Catégories", icon: Tags },
      { to: "/admin/services", label: "Services", icon: Wrench },
      { to: "/admin/projects", label: "Projets", icon: FolderKanban },
      { to: "/admin/trainings", label: "Formations", icon: NotebookPen },
      { to: "/admin/articles", label: "Articles", icon: FileText },
      { to: "/admin/faqs", label: "FAQ", icon: HelpCircle },
      { to: "/admin/testimonials", label: "Témoignages", icon: MessagesSquare },
      { to: "/admin/stats", label: "Statistiques", icon: BarChart3 },
    ],
  },
  {
    label: "Communauté",
    items: [
      { to: "/admin/messages", label: "Messages", icon: Inbox },
      { to: "/admin/appointments", label: "Rendez-vous", icon: CalendarClock },
      { to: "/admin/reports", label: "Newsletter", icon: Mailbox },
      { to: "/admin/reports", label: "Signalements", icon: ShieldAlert },
    ],
  },
  {
    label: "Outils",
    items: [{ to: "/admin/shortlinks", label: "Liens courts", icon: Link2 }],
  },
  {
    label: "Membre",
    items: [
      { to: "/admin/messages", label: "Utilisateurs", icon: UserCheck },
      { to: "/admin/appointments", label: "Apprenants", icon: UserRoundPen },
      { to: "/admin/reports", label: "Administrateurs", icon: UserStar },
    ],
  },
];

export function AdminShell({ children }: { children?: React.ReactNode }) {
  const { user, ready, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (ready && !isAuthenticated) navigate({ to: "/auth/login" });
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
    navigate({ to: "/auth/login" });
  };

  const width = collapsed ? "md:w-16" : "md:w-64";
  const profileActive = pathname.startsWith("/admin/profile");

  const renderItem = (n: NavItem) => {
    const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
    const Icon = n.icon;
    return (
      <Link
        key={n.to}
        to={n.to as "/admin"}
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

            <div className="text-[10px] opacity-60 truncate">Admin dashboard</div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-4 overflow-y-auto no-scrollbar">
        {NAV_GROUPS.map((g) => (
          <div key={g.label} className="space-y-1">
            {!collapsed && (
              <div className="px-3 pt-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {g.label}
              </div>
            )}
            {g.items.map(renderItem)}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-2 space-y-1">
        <Link
          to="/admin/profile"
          title={collapsed ? "Profil" : undefined}
          className={
            "flex items-center gap-3 rounded-lg text-sm transition-colors " +
            (collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2") + " " +
            (profileActive
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")
          }
        >
          <UserCircle className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate">{user?.name ?? "Profil"}</div>
              <div className="text-[10px] opacity-60 truncate">{user?.email}</div>
            </div>
          )}
        </Link>
        <button
          onClick={handleLogout}
          title={collapsed ? "Déconnexion" : undefined}
          className={
            "flex items-center gap-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-destructive cursor-pointer hover:text-sidebar-accent-foreground " +
            (collapsed ? "justify-center h-10 w-10 mx-auto" : "w-full px-3 py-2")
          }
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen flex bg-muted/30 overflow-hidden">
      <aside className={"hidden md:flex flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-200 h-screen sticky top-0 shrink-0 " + width}>
        {SidebarInner}
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground flex flex-col">
            <button className="absolute top-3 right-3 opacity-70" onClick={() => setMobileOpen(false)}>
              <X className="h-4 w-4" />
            </button>
            {SidebarInner}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="flex items-center gap-3 bg-card/80 backdrop-blur border-b px-4 h-14 shrink-0">
          <button
            className="hidden md:inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted"
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Étendre" : "Réduire"}
          >
            <ChevronLeft className={"h-4 w-4 transition-transform " + (collapsed ? "rotate-180" : "")} />
          </button>
          <button
            className="md:hidden inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="font-display font-semibold text-sm">Admin</div>
          <div className="ml-auto text-xs text-muted-foreground hidden sm:block">{user?.email}</div>
        </header>
        <main className="flex-1 p-6 md:p-10 overflow-y-auto overflow-x-hidden">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
}

