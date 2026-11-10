import { Link } from "@tanstack/react-router";
import { ChevronDown, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/site/UserAvatar";
import { ScoreRing } from "@/components/pages/health/ScoreRing";
import { useAdminProfileHealth } from "@/stores/useProfileHealthStore";
import { USER_DROPDOWN_ITEMS } from "./config";

type SpaceDropdownProps = {
  user: { name?: string | null; email?: string | null; photo?: string | null } | null;
  onDisconnectClick: () => void;
  defaultRoleName?: string;
};

export function SpaceUserDropdown({ user, onDisconnectClick, defaultRoleName = "Admininsitrateur" }: SpaceDropdownProps) {
  const displayName = user?.name && user.name !== "undefined undefined" ? user.name : defaultRoleName;
  const { health } = useAdminProfileHealth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
          <div className="relative">
            <ScoreRing percent={health?.score ?? 0} level={health?.level} size={38} strokeWidth={3}>
              <UserAvatar
                name={displayName}
                photo={user?.photo}
                className="size-7 border-2 border-card"
                fallbackClassName="bg-primary/10 text-xs font-semibold text-primary"
              />
            </ScoreRing>
            {health && (
              <span className="absolute -bottom-1 -right-1 rounded-full border bg-card px-1 text-[9px] font-semibold leading-4 text-foreground">
                {health.score}%
              </span>
            )}
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

        {USER_DROPDOWN_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem key={item.to} asChild className="cursor-pointer">
              <Link to={item.to as any}>
                <Icon className="mr-2 size-4" />
                <span>{item.label}</span>
                {item.to === "/health" && health && (
                  <span className="ml-auto text-xs font-semibold text-muted-foreground">{health.score}%</span>
                )}
              </Link>
            </DropdownMenuItem>
          );
        })}

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