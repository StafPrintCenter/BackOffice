import { useState, useEffect } from "react";
import { useRouterState, useNavigate, Outlet } from "@tanstack/react-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "sonner";
import { ConfirmDisconnect } from "@/components/site/AdminBits";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebarContent, AdminHeader } from "./Shell";

export function AdminShell({ children }: { children?: React.ReactNode }) {
  const { user, ready, isAuthenticated, logout } = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
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

  return (
    <SidebarProvider>
      <AdminSidebarContent
        user={user}
        pathname={pathname}
        onDisconnectClick={() => setConfirmDisconnectOpen(true)}
      />

      <SidebarInset className="flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader
          user={user}
          onDisconnectClick={() => setConfirmDisconnectOpen(true)}
        />

        <main className="flex-1 p-6 md:p-10 overflow-y-auto overflow-x-hidden bg-muted/30">
          {children ?? <Outlet />}
        </main>
      </SidebarInset>

      <ConfirmDisconnect
        open={confirmDisconnectOpen}
        onOpenChange={setConfirmDisconnectOpen}
        onConfirm={handleLogout}
      />
    </SidebarProvider>
  );
}
