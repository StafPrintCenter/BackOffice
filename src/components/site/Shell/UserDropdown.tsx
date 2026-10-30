import { Link } from "@tanstack/react-router";
import { UserCircle, Bell, ChevronDown, LogOut } from "lucide-react";
import { useInstructorAuth } from "@/hooks/useInstructorAuth";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function InstructorUserDropdown({ user, onDisconnectClick, }: {
  user: ReturnType<typeof useInstructorAuth>["user"];
  onDisconnectClick: () => void;
}) {
  const displayName = user?.name && user.name !== "undefined undefined" ? user.name : "Formateur";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserCircle className="size-4" />
          </div>
          <div className="text-left hidden sm:block max-w-37.5">
            <p className="text-xs font-medium text-foreground truncate">{displayName}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
          </div>
          <ChevronDown className="size-3.5 text-muted-foreground hidden sm:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-medium leading-none truncate">{displayName}</p>
            <p className="text-[11px] text-muted-foreground leading-none truncate">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/profil">
            <UserCircle className="mr-2 size-4" />
            <span>Mon profil</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/notifications">
            <Bell className="mr-2 size-4" />
            <span>Notifications</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onDisconnectClick}
          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="mr-2 size-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}