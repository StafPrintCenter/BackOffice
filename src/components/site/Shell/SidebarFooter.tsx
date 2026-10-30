import { Link } from "@tanstack/react-router";
import { BookOpen, UserCircle, LogOut } from "lucide-react";
import { useInstructorAuth } from "@/hooks/useInstructorAuth";
import { SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { SocialLinks } from "@/components/site";
import { docsUrl, navItemClass } from "./config";

export function InstructorSidebarFooter({
  user,
  pathname,
  onNavClick,
  onDisconnectClick,
}: {
  user: ReturnType<typeof useInstructorAuth>["user"];
  pathname: string;
  onNavClick: () => void;
  onDisconnectClick: () => void;
}) {
  const profileActive = pathname.startsWith("/profil");

  return (
    <SidebarFooter className="border-t border-sidebar-border p-2 space-y-1">
      <div className="px-2 pt-1 group-data-[collapsible=icon]:hidden flex items-center justify-between gap-2">
        <a
          href={docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground py-1 px-2 rounded-md hover:bg-sidebar-accent transition-colors"
        >
          <BookOpen className="size-3.5 shrink-0" />
          <span>Doc</span>
        </a>

        <SocialLinks
          className="flex-wrap gap-0.5"
          linkClassName="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent p-1"
          iconClassName="size-3.5"
        />
      </div>

      <SidebarMenu>
        <SidebarMenuItem className="hidden group-data-[collapsible=icon]:block">
          <SidebarMenuButton asChild tooltip="Documentation" className={navItemClass}>
            <a href={docsUrl} target="_blank" rel="noopener noreferrer">
              <BookOpen className="size-4 shrink-0" />
              <span>Documentation</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={profileActive} tooltip="Profil" className={navItemClass}>
            <Link to="/profil" onClick={onNavClick}>
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