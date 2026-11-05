import { useAdminAuth } from "@/hooks/useAdminAuth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/pages/notifications/shared";
import { AdminUserDropdown } from "./UserDropdown";

export function AdminHeader({
  user,
  onDisconnectClick,
}: {
  user: ReturnType<typeof useAdminAuth>["user"];
  onDisconnectClick: () => void;
}) {
  return (
    <header className="flex items-center gap-3 bg-card/80 backdrop-blur border-b px-5 h-14 shrink-0">
      <SidebarTrigger />
      <div className="font-display font-semibold text-sm">Admin</div>
      <div className="ml-auto flex items-center gap-3">
        <NotificationBell />
        <AdminUserDropdown user={user} onDisconnectClick={onDisconnectClick} />
      </div>
    </header>
  );
}