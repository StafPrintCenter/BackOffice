import { CheckCheck, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CleanupSettingsDialog } from "@/components/pages/notifications";
import { Link } from "@tanstack/react-router";

interface NotificationsHeaderProps {
  total: number;
  unread: number;
  onMarkAll: () => void;
  isMarkAllPending: boolean;
  onDeleteAllClick: () => void;
}

export function NotificationsHeader({
  total,
  unread,
  onMarkAll,
  isMarkAllPending,
  onDeleteAllClick,
}: NotificationsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {total > 0
            ? `${total} notification${total > 1 ? "s" : ""} au total · ${unread} non lue${unread > 1 ? "s" : ""}`
            : "Chargement des métadonnées…"}
        </p>
      </div>

      {/* Boutons d'actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={unread === 0 || isMarkAllPending}
          onClick={onMarkAll}
        >
          <CheckCheck className="mr-1.5 h-4 w-4 text-primary" /> Tout marquer comme lu
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={total === 0}
          onClick={onDeleteAllClick}
        >
          <Trash2 className="mr-1.5 h-4 w-4" /> Tout supprimer
        </Button>

        <Button asChild size="sm" variant="outline">
          <Link to="/notifications/preferences">
            <Settings2 className="mr-1.5 h-4 w-4" /> Préférences
          </Link>
        </Button>

        <CleanupSettingsDialog />
      </div>
    </div>
  );
}