import { Link } from "@tanstack/react-router";
import { SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuBadge } from "@/components/ui/sidebar";
import { useUnreadCount } from "@/stores/useNotificationsStore";
import { NAV_GROUPS, navItemClass, NavItem } from "./config";

export function InstructorSidebarNav({
  pathname,
  onNavClick,
}: {
  pathname: string;
  onNavClick: () => void;
}) {
  const { count: unreadCount } = useUnreadCount();

  const isLinkActive = (n: NavItem) =>
    n.exact
      ? pathname === n.to
      : n.matchPrefixes
        ? n.matchPrefixes.some((prefix) => pathname.startsWith(prefix))
        : pathname.startsWith(n.to);

  return (
    <SidebarContent className="px-1">
      {NAV_GROUPS.map((g) => (
        <SidebarGroup key={g.label}>
          <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase tracking-wider text-[10px] px-2">
            {g.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {g.items.map((item) => {
                const active = isLinkActive(item);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label} className={navItemClass}>
                      <Link to={item.to as "/dashboard"} onClick={onNavClick}>
                        <item.icon className="size-4 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.to === "/notifications" && unreadCount > 0 && (
                      <SidebarMenuBadge className="bg-destructive text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
}