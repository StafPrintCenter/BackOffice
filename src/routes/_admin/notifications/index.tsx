import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCheck, ChevronLeft, ChevronRight, Loader2, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationItem, DeleteAllDialog } from "@/components/pages/notifications";
import { ConfirmDelete } from "@/components/site/AdminBits";
import {
  CATEGORY_META,
  NOTIFICATION_CATEGORIES,
  type NotificationCategory,
} from "@/data/notifications";
import { useMarkAllAsRead, useNotificationsList, useBulkDeleteNotifications } from "@/stores/useNotificationsStore";

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

  // Filtres appliqués sur la page chargée (l'API de liste n'expose pas de filtre)
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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {meta
              ? `${meta.total} notification${meta.total > 1 ? "s" : ""} · ${unread} non lue${unread > 1 ? "s" : ""}`
              : "Chargement…"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline" size="sm"
            className="text-destructive hover:bg-destructive/10"
            disabled={(meta?.total ?? 0) === 0}
            onClick={() => setDeleteAllOpen(true)}
          >
            <Trash2 className="mr-1 h-4 w-4" /> Tout supprimer
          </Button>

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
            <CheckCheck className="mr-1 h-4 w-4" /> Tout marquer comme lu
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/notifications/preferences">
              <Settings2 className="mr-1 h-4 w-4" /> Préférences
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", ...NOTIFICATION_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition ${category === c
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card hover:border-primary"
              }`}
          >
            {c === "all" ? "Toutes" : CATEGORY_META[c].label}
          </button>
        ))}

        <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
          />
          Non lues uniquement
        </label>

        {filtered.length > 0 && (
          <div className="flex max-w-3xl items-center gap-3 text-xs">
            <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
              <input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} />
              Tout sélectionner (page)
            </label>
            {selected.length > 0 && (
              <Button size="sm" variant="destructive" onClick={() => setConfirmSelected(true)}>
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Supprimer la sélection ({selected.length})
              </Button>
            )}
          </div>
        )}
      </div>


      <div className="max-w-3xl space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
            Aucune notification ne correspond à ce filtre.
          </p>
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

        {meta && meta.lastPage > 1 && (
          <div className="flex items-center justify-between pt-4 text-sm">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Précédent
            </Button>
            <span className="text-muted-foreground">
              Page {meta.currentPage} / {meta.lastPage}
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

      <ConfirmDelete
        open={confirmSelected}
        onOpenChange={setConfirmSelected}
        onConfirm={() =>
          bulk.mutate(
            { scope: "selected", ids: selected },
            {
              onSuccess: ({ message, deleted }) => { toast.success(message, { description: `${deleted} supprimée(s)` }); setSelected([]); setConfirmSelected(false); },
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
    </>
  );
}
