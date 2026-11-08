import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { SpaceHeaderBrand, AdminSidebarNav, AdminSidebarFooter } from "./";

export function AdminSidebarContent({
  user,
  pathname,
  onDisconnectClick,
}: {
  user: ReturnType<typeof useAdminAuth>["user"];
  pathname: string;
  onDisconnectClick: () => void;
}) {
  const { setOpenMobile } = useSidebar();
  const handleNavClick = () => setOpenMobile(false);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <SpaceHeaderBrand onNavClick={handleNavClick} />
      <AdminSidebarNav pathname={pathname} onNavClick={handleNavClick} />
      <AdminSidebarFooter
        user={user}
        pathname={pathname}
        onNavClick={handleNavClick}
        onDisconnectClick={onDisconnectClick}
      />
    </Sidebar>
  );
}