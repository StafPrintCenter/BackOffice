import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CATEGORY_META, formatNotificationDate, type APINotificationListItem } from "@/data/notifications";
import { useMarkAsRead } from "@/stores/useAdminNotificationsStore";

interface NotificationItemProps {
  notification: APINotificationListItem;
  onClick: () => void;
}

export function NotificationItem({ notification: n, onClick }: NotificationItemProps) {
  const meta = CATEGORY_META[n.category];
  const Icon = meta.icon;
  const markAsRead = useMarkAsRead();

  const handleMarkAsRead = () =>
    markAsRead.mutate(n.id, {
      onSuccess: (message) => toast.success(message),
      onError: (e) => toast.error(e.message),
    });

  return (
    <div
      className={`flex items-stretch gap-1 rounded-lg border transition ${n.isRead ? "border-border bg-card" : "border-primary/30 bg-primary/5"
        }`}
    >
      <button
        onClick={onClick}
        className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-l-lg px-4 py-3 text-left transition hover:bg-muted/60"
      >
        <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.className}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-sm ${n.isRead ? "font-medium" : "font-semibold"}`}>{n.title}</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {meta.label} · {formatNotificationDate(n.deliveredAt)}
          </span>
        </span>
        {!n.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Non lue" />}
      </button>

      {!n.isRead && (
        <button
          onClick={handleMarkAsRead}
          disabled={markAsRead.isPending}
          title="Marquer comme lue"
          aria-label="Marquer comme lue"
          className="flex w-11 shrink-0 cursor-pointer items-center justify-center rounded-r-lg text-muted-foreground transition hover:bg-primary/10 hover:text-primary disabled:opacity-50"
        >
          {markAsRead.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}