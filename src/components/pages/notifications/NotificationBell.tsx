import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, CheckCheck, Settings2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "./";
import { useMarkAllAsRead, useNotificationsList, useUnreadCount } from "@/stores/useAdminNotificationsStore";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { count } = useUnreadCount();
  const { items, isLoading } = useNotificationsList({ page: 1, perPage: 8 }, open);
  const markAll = useMarkAllAsRead();

  const openNotification = (id: string) => {
    setOpen(false);
    navigate({ to: "/notifications/$id", params: { id } });
  };

  const handleMarkAll = () =>
    markAll.mutate(undefined, {
      onSuccess: (message) => toast.success(message),
      onError: (e) => toast.error(e.message),
    });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Notifications${count > 0 ? ` (${count} non lues)` : ""}`}
        className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <Bell className="h-4.5 w-4.5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85vh] max-w-lg flex-col overflow-hidden p-0">
          {/* En-tête fixe */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4" /> Notifications
              {count > 0 && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{count} non lue{count > 1 ? "s" : ""}</span>}
            </DialogTitle>
          </DialogHeader>

          {/* Liste scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
              </div>
            ) : items.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Aucune notification pour le moment.</p>
            ) : (
              items.map((n) => <NotificationItem key={n.id} notification={n} onClick={() => openNotification(n.id)} />)
            )}
          </div>

          {/* Pied de page fixe */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/20 px-6 py-4">
            <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={count === 0 || markAll.isPending}>
              <CheckCheck className="mr-1 h-4 w-4" /> Tout marquer comme lu
            </Button>
            <div className="flex gap-2">
              <Button asChild variant="ghost" size="sm" onClick={() => setOpen(false)}>
                <Link to="/notifications/preferences"><Settings2 className="mr-1 h-4 w-4" /> Préférences</Link>
              </Button>
              <Button asChild size="sm" onClick={() => setOpen(false)}>
                <Link to="/notifications">Voir tout</Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
