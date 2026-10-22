import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ExternalLink, Loader2, Clock, CheckCircle2, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CATEGORY_META, formatNotificationDate } from "@/data/notifications";
import { useNotificationDetail, useDeleteNotification } from "@/stores/useNotificationsStore";
import { ConfirmDelete } from "@/components/site/AdminBits";

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
      className="group -ml-2 text-muted-foreground hover:text-foreground transition-colors"
      onClick={() => navigate({ to: "/notifications" })}
    >
      <ArrowLeft className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
      Retour aux notifications
    </Button>
  );

  if (isLoading) {
    return (
      <>
        <div className="flex flex-col items-center justify-center gap-3 py-32 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm font-medium">Chargement de la notification…</p>
        </div>
      </>
    );
  }

  if (!n) {
    return (
      <>
        <div className="max-w-md mx-auto mt-16 text-center">
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
      </>
    );
  }

  const meta = CATEGORY_META[n.category] || { label: n.category, className: "bg-muted text-foreground", icon: Clock };
  const Icon = meta.icon;
  const dataEntries = n.data ? Object.entries(n.data) : [];

  return (
    <>
      <div className="max-w-3xl mx-auto pb-12 space-y-6">
        {/* En-tête avec bouton retour et suppression */}
        <div className="flex items-center justify-between gap-3">
          {back}
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="mr-1 h-4 w-4" /> Supprimer
          </Button>
        </div>

        {/* Carte principale */}
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-all">
          {/* En-tête de la notification */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b bg-muted/20 p-6 sm:px-8">
            <div className="flex items-start gap-4">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-xs ${meta.className}`}>
                <Icon className="h-6 w-6" />
              </span>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}>
                    {meta.label}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground bg-background/80 px-2 py-0.5 rounded border">
                    {n.type}
                  </span>
                </div>
                <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {n.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Corps du message */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {n.body}
            </div>

            {/* Action associée */}
            {n.actionUrl && (
              <div className="pt-2">
                <Button
                  onClick={() => navigate({ to: n.actionUrl as never })}
                  className="shadow-xs gap-2"
                >
                  Ouvrir l'élément concerné
                  <ExternalLink className="h-4 w-4 opacity-70" />
                </Button>
              </div>
            )}
          </div>

          {/* Pied de carte : Dates et Horodatage */}
          <div className="border-t bg-muted/10 px-6 py-4 sm:px-8 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 opacity-70" />
              <span>Reçue le {formatNotificationDate(n.deliveredAt)}</span>
            </div>

            {n.readAt && (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Lue le {formatNotificationDate(n.readAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Section des détails techniques (Payload / Data) */}
        {dataEntries.length > 0 && (
          <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Détails techniques
              </h2>
              <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
                {dataEntries.length} paramètre(s)
              </span>
            </div>

            <dl className="grid grid-cols-1 gap-2 text-sm">
              {dataEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-2 px-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors gap-1 sm:gap-4"
                >
                  <dt className="font-medium text-xs text-muted-foreground shrink-0">{key}</dt>
                  <dd className="break-all font-mono text-xs text-foreground bg-background/80 px-2 py-1 rounded border sm:max-w-[65%]">
                    {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

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
    </>
  );
}
