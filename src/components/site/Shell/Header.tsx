import { BookOpen } from "lucide-react";
import { useInstructorAuth } from "@/hooks/useInstructorAuth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/pages/notifications/shared";
import { docsUrl } from "./config";
import { InstructorUserDropdown } from "./UserDropdown";

export function InstructorHeader({
  user,
  onDisconnectClick,
}: {
  user: ReturnType<typeof useInstructorAuth>["user"];
  onDisconnectClick: () => void;
}) {
  return (
    <header className="flex items-center gap-3 bg-card/80 backdrop-blur border-b px-5 h-14 shrink-0">
      <SidebarTrigger />
      <div className="font-display font-semibold text-sm">Formateur</div>

      <div className="ml-auto flex items-center gap-3">
        <NotificationBell />
        <a
          href={docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1 rounded-md hover:bg-accent"
        >
          <BookOpen className="size-3.5" />
          <span className="hidden sm:inline">Documentation</span>
        </a>

        <InstructorUserDropdown user={user} onDisconnectClick={onDisconnectClick} />
      </div>
    </header>
  );
}