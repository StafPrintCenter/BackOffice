import { useState } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDelete } from "@/components/site/AdminBits";
import { CATEGORY_META, formatNotificationDate, type APINotificationListItem } from "@/data/notifications";
import { useDeleteNotification, useMarkAsRead } from "@/stores/useNotificationsStore";

interface NotificationItemProps {
  notification: APINotificationListItem;
  onClick: () => void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
}

export function NotificationItem({ notification: n, onClick, selectable, selected, onToggleSelect }: NotificationItemProps) {
  const meta = CATEGORY_META[n.category];
  const Icon = meta.icon;
  const markAsRead = useMarkAsRead();
  const remove = useDeleteNotification();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead.mutate(n.id, {
      onSuccess: (message) => toast.success(message),
      onError: (e) => toast.error(e.message),
    });
  };

  const handleDelete = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    remove.mutate(n.id, {
      onSuccess: () => { toast.success("Notification supprimée"); setConfirmOpen(false); },
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <div
      onClick={onClick}
      className={`group relative flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition sm:gap-3 sm:px-4 sm:py-3 ${selected
        ? "border-primary bg-primary/10"
        : n.isRead
          ? "border-border bg-card hover:bg-muted/50"
          : "border-primary/30 bg-primary/5 hover:bg-primary/10"
        }`}
    >
      {selectable && (
        <label
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            className="rounded border-input text-primary focus:ring-primary h-4 w-4"
            checked={!!selected}
            onChange={() => onToggleSelect?.(n.id)}
            aria-label="Sélectionner la notification"
          />
        </label>
      )}

      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.className}`}>
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`block truncate text-sm ${n.isRead ? "font-medium" : "font-semibold"}`}>{n.title}</span>
          {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-primary sm:hidden" aria-label="Non lue" />}
        </div>
        <span className="mt-0.5 block text-xs text-muted-foreground truncate">
          {meta.label} · {formatNotificationDate(n.deliveredAt)}
        </span>
      </div>

      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        {!n.isRead && (
          <button
            onClick={handleMarkAsRead}
            disabled={markAsRead.isPending}
            title="Marquer comme lue"
            aria-label="Marquer comme lue"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-primary/10 hover:text-primary disabled:opacity-50"
          >
            {markAsRead.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </button>
        )}

        <button
          onClick={() => setConfirmOpen(true)}
          title="Supprimer"
          aria-label="Supprimer la notification"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {!n.isRead && <span className="hidden h-2 w-2 shrink-0 rounded-full bg-primary sm:block" aria-label="Non lue" />}

      <ConfirmDelete
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() => handleDelete()}
        title="Supprimer cette notification ?"
      />
    </div>
  );
}