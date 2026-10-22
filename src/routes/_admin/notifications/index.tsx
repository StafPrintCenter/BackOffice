import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCheck, ChevronLeft, ChevronRight, Loader2, Settings2, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationItem, DeleteAllDialog } from "@/components/pages/notifications";
import { ConfirmDelete } from "@/components/site/AdminBits";
import {
  CATEGORY_META,
  NOTIFICATION_CATEGORIES,
  type NotificationCategory,
} from "@/data/notifications";
import { useMarkAllAsRead, useNotificationsList, useBulkDeleteNotifications } from "@/stores/useNotificationsStore";
import { CleanupSettingsDialog } from "@/components/pages/notifications";

export const Route = createFileRoute("/_admin/notifications/")({
  head: () => ({
    meta: [{ title: "Notifications - Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<NotificationCategory | "all">("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { items, meta, isLoading } = useNotificationsList({ page, perPage: 20 });
  const markAll = useMarkAllAsRead();

  // Filtres appliqués sur la page chargée
  const filtered = useMemo(
    () =>
      items.filter(
        (n) => (category === "all" || n.category === category) && (!unreadOnly || !n.isRead),
      ),
    [items, category, unreadOnly],
  );

  const unread = meta?.unreadTotal ?? 0;

  const [selected, setSelected] = useState<string[]>([]);
  const [confirmSelected, setConfirmSelected] = useState(false);
  const [deleteAllOpen, setDeleteAllOpen] = useState(false);
  const bulk = useBulkDeleteNotifications();

  const toggleSelect = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const allVisibleSelected = filtered.length > 0 && filtered.every((n) => selected.includes(n.id));
  const toggleAllVisible = () =>
    setSelected(allVisibleSelected ? [] : filtered.map((n) => n.id));

  return (
    <>
      <div className="mx-auto max-w-4xl pb-16 space-y-6">
        {/* En-tête de la page */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {meta
                ? `${meta.total} notification${meta.total > 1 ? "s" : ""} au total · ${unread} non lue${unread > 1 ? "s" : ""}`
                : "Chargement des métadonnées…"}
            </p>
          </div>

          {/* Boutons d'actions globales */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={unread === 0 || markAll.isPending}
              onClick={() =>
                markAll.mutate(undefined, {
                  onSuccess: (m) => toast.success(m),
                  onError: (e) => toast.error(e.message),
                })
              }
            >
              <CheckCheck className="mr-1.5 h-4 w-4 text-primary" /> Tout marquer comme lu
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={(meta?.total ?? 0) === 0}
              onClick={() => setDeleteAllOpen(true)}
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

        {/* Barre de filtres et d'actions par lot */}
        <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3">
          {/* Catégories sous forme de puces */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(["all", ...NOTIFICATION_CATEGORIES] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`cursor-pointer shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${category === c
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                {c === "all" ? "Toutes les catégories" : CATEGORY_META[c].label}
              </button>
            ))}
          </div>

          {/* Options secondaires : Case Non lues & Sélection globale */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t text-xs">
            <div className="flex items-center gap-6">
              <label className="flex cursor-pointer items-center gap-2 font-medium text-foreground hover:opacity-80">
                <input
                  type="checkbox"
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                  checked={unreadOnly}
                  onChange={(e) => setUnreadOnly(e.target.checked)}
                />
                Afficher uniquement les non lues
              </label>

              {filtered.length > 0 && (
                <label className="flex cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground">
                  <input
                    type="checkbox"
                    className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                  />
                  Tout sélectionner sur cette page
                </label>
              )}
            </div>

            {selected.length > 0 && (
              <Button size="sm" variant="destructive" onClick={() => setConfirmSelected(true)} className="h-7 text-xs">
                <Trash2 className="mr-1 h-3 w-3" /> Supprimer la sélection ({selected.length})
              </Button>
            )}
          </div>
        </div>

        {/* Liste des notifications */}
        <div className="space-y-2.5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-sm text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Chargement des notifications…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-card/50 py-20 text-center text-sm text-muted-foreground space-y-2">
              <Filter className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p>Aucune notification ne correspond aux filtres sélectionnés.</p>
            </div>
          ) : (
            filtered.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                selectable
                selected={selected.includes(n.id)}
                onToggleSelect={toggleSelect}
                onClick={() => navigate({ to: "/notifications/$id", params: { id: n.id } })}
              />
            ))
          )}

          {/* Pagination */}
          {meta && meta.lastPage > 1 && (
            <div className="flex items-center justify-between pt-4 text-sm border-t mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Précédent
              </Button>
              <span className="text-muted-foreground text-xs font-medium">
                Page {meta.currentPage} sur {meta.lastPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.lastPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Modales de confirmation */}
        <ConfirmDelete
          open={confirmSelected}
          onOpenChange={setConfirmSelected}
          onConfirm={() =>
            bulk.mutate(
              { scope: "selected", ids: selected },
              {
                onSuccess: ({ message, deleted }) => {
                  toast.success(message, { description: `${deleted} notification(s) supprimée(s)` });
                  setSelected([]);
                  setConfirmSelected(false);
                },
                onError: (e) => toast.error(e.message),
              },
            )
          }
          title={`Supprimer ${selected.length} notification(s) ?`}
        />

        <DeleteAllDialog
          open={deleteAllOpen}
          onOpenChange={setDeleteAllOpen}
          defaultCategory={category === "all" ? "" : category}
          onDone={() => { setSelected([]); setPage(1); }}
        />
      </div>
    </>
  );
}
