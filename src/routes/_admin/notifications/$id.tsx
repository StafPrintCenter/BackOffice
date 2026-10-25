import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Loader2, Clock, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CATEGORY_META } from "@/data/notifications";
import { useNotificationDetail, useDeleteNotification } from "@/stores/useNotificationsStore";
import { ConfirmDelete } from "@/components/site/AdminBits";
import { NotificationDetailCard, NotificationTechnicalDetails } from "@/components/pages/notifications/detail";

export const Route = createFileRoute("/_admin/notifications/$id")({
  head: () => ({
    meta: [{ title: "Notification - Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: NotificationDetail,
});

function NotificationDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { notification: n, isLoading } = useNotificationDetail(id);
  const remove = useDeleteNotification();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const back = (
    <Button
      variant="outline"
      size="sm"
      className="group -ml-1 sm:-ml-2 text-muted-foreground hover:text-foreground transition-colors text-xs sm:text-sm"
      onClick={() => navigate({ to: "/notifications" })}
    >
      <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      <span className="hidden xs:inline">Retour aux notifications</span>
      <span className="xs:hidden">Retour</span>
    </Button>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-32 text-muted-foreground px-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm font-medium">Chargement de la notification…</p>
      </div>
    );
  }

  if (!n) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center px-4">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ShieldAlert className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="font-display text-lg font-bold">Notification introuvable</h2>
        <p className="mt-1 text-sm text-muted-foreground mb-6">
          L'élément demandé n'existe pas ou a peut-être été supprimé.
        </p>
        <Button asChild>
          <Link to="/notifications">Retour à la liste</Link>
        </Button>
      </div>
    );
  }

  const meta = CATEGORY_META[n.category] || { label: n.category, className: "bg-muted text-foreground", icon: Clock };
  const dataEntries = n.data ? Object.entries(n.data) : [];

  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-6 px-4 sm:px-0">
      <div className="flex items-center justify-between gap-3">
        {back}
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10 text-xs sm:text-sm"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="mr-1 h-4 w-4" /> Supprimer
        </Button>
      </div>

      <NotificationDetailCard
        notification={n}
        meta={meta}
        onActionClick={(url) => navigate({ to: url as never })}
      />

      <NotificationTechnicalDetails dataEntries={dataEntries} />

      <ConfirmDelete
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={() =>
          remove.mutate(n.id, {
            onSuccess: () => { toast.success("Notification supprimée"); navigate({ to: "/notifications" }); },
            onError: (e) => toast.error(e.message),
          })
        }
        title="Supprimer cette notification ?"
      />
    </div>
  );
}
