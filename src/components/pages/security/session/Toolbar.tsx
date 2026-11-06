import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionsToolbarProps {
  othersCount: number;
  disabled?: boolean;
  onRevokeOthers: () => void;
  onRevokeAll: () => void;
}

export function SessionsToolbar({ othersCount, disabled, onRevokeOthers, onRevokeAll }: SessionsToolbarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" disabled={disabled || othersCount === 0} onClick={onRevokeOthers}>
        Fermer les autres sessions{othersCount > 0 ? ` (${othersCount})` : ""}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:bg-destructive/10"
        disabled={disabled}
        onClick={onRevokeAll}
      >
        <LogOut className="mr-1 h-4 w-4" /> Se déconnecter partout
      </Button>
    </div>
  );
}