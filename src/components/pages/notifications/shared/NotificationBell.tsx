import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, CheckCheck, Settings2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NotificationItem, CleanupSettingsDialog } from "./";
import { useMarkAllAsRead, useNotificationsList, useUnreadCount } from "@/stores/useNotificationsStore";

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
        <DialogContent className="flex max-h-[85vh] w-[95vw] max-w-lg flex-col overflow-hidden p-0 sm:w-full rounded-xl">
          {/* En-tête */}
          <DialogHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-3 sm:px-6 sm:pt-6 sm:pb-4 border-b space-y-0">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Bell className="h-4 w-4" /> Notifications
              {count > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] sm:text-xs text-primary">
                  {count} non lue{count > 1 ? "s" : ""}
                </span>
              )}
            </DialogTitle>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAll}
              disabled={count === 0 || markAll.isPending}
              className="h-8 px-2 text-xs"
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" /> Tout lire
            </Button>
          </DialogHeader>

          {/* Liste scrollable */}
          <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4 space-y-2">
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

          {/* Pied de page responsive */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t bg-muted/20 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <Button asChild variant="outline" size="sm" onClick={() => setOpen(false)} className="flex-1 sm:flex-initial">
                <Link to="/notifications/preferences">
                  <Settings2 className="mr-1 h-3.5 w-3.5" /> Préférences
                </Link>
              </Button>
              <CleanupSettingsDialog variant="outline" size="sm" />
            </div>

            <Button asChild size="sm" onClick={() => setOpen(false)} className="w-full sm:w-auto">
              <Link to="/notifications">Voir tout</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
