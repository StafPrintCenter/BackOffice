import { CATEGORY_META, formatNotificationDate, type APINotificationListItem } from "@/data/notifications";

interface NotificationItemProps {
  notification: APINotificationListItem;
  onClick: () => void;
}

export function NotificationItem({ notification: n, onClick }: NotificationItemProps) {
  const meta = CATEGORY_META[n.category];
  const Icon = meta.icon;

  return (
    <button
      onClick={onClick}
      className={`flex w-full cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-left transition hover:bg-muted/60 ${n.isRead ? "border-border bg-card" : "border-primary/30 bg-primary/5"
        }`}
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
  );
}