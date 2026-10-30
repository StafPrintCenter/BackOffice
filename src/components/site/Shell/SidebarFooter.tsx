import { Link } from "@tanstack/react-router";
import { UserCircle, LogOut } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { SocialLinks } from "@/components/site/SocialLinks";
import { navItemClass } from "./config";

export function AdminSidebarFooter({
  user,
  pathname,
  onNavClick,
  onDisconnectClick,
}: {
  user: ReturnType<typeof useAdminAuth>["user"];
  pathname: string;
  onNavClick: () => void;
  onDisconnectClick: () => void;
}) {
  const profileActive = pathname.startsWith("/profile");

  return (
    <SidebarFooter className="border-t border-sidebar-border p-2 space-y-1">
      <div className="px-2 pt-1 group-data-[collapsible=icon]:hidden">
        <SocialLinks
          className="flex-wrap gap-1"
          linkClassName="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        />
      </div>

      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={profileActive} tooltip="Profil" className={navItemClass}>
            <Link to="/profile" onClick={onNavClick}>
              <UserCircle className="size-4 shrink-0" />
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                  <p className="text-xs font-medium truncate">
                    {user?.name && user.name !== "undefined undefined" ? user.name : "Profil"}
                  </p>
                  <p className="text-[10px] opacity-60 truncate">{user?.email}</p>
                </div>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => {
              onNavClick();
              onDisconnectClick();
            }}
            tooltip="Déconnexion"
            className="text-sidebar-foreground/80 hover:bg-destructive hover:text-white"
          >
            <LogOut className="size-4 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">Déconnexion</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}