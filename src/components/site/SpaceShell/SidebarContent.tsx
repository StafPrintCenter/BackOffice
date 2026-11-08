import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Sidebar, useSidebar } from "@/components/ui/sidebar";
import { SpaceHeaderBrand, SpaceSidebarNav, SpaceSidebarFooter } from "./";

export function SpaceSidebarContent({
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
      <SpaceSidebarNav pathname={pathname} onNavClick={handleNavClick} />
      <SpaceSidebarFooter
        user={user}
        pathname={pathname}
        onNavClick={handleNavClick}
        onDisconnectClick={onDisconnectClick}
      />
    </Sidebar>
  );
}