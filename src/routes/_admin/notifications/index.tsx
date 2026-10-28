import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDelete } from "@/components/site/AdminBits";
import { type NotificationCategory } from "@/data/notifications";
import { useMarkAllAsRead, useNotificationsList, useBulkDeleteNotifications } from "@/stores/useNotificationsStore";
import { DeleteAllDialog } from "@/components/pages/notifications/shared";
import { NotificationsHeader, NotificationsFilterBar, NotificationsList } from "@/components/pages/notifications/home";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/notifications/")({
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Notifications | ${SITE.name}` },
      { name: "description", content: "Consultez les notifications liées à vos formations, vos activités et vos travaux." },
    ],
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
    <div className="mx-auto max-w-4xl pb-16 space-y-6 px-4 sm:px-0">
      <NotificationsHeader
        total={meta?.total ?? 0}
        unread={unread}
        onMarkAll={() =>
          markAll.mutate(undefined, {
            onSuccess: (m) => toast.success(m),
            onError: (e) => toast.error(e.message),
          })
        }
        isMarkAllPending={markAll.isPending}
        onDeleteAllClick={() => setDeleteAllOpen(true)}
      />

      <NotificationsFilterBar
        category={category}
        setCategory={setCategory}
        unreadOnly={unreadOnly}
        setUnreadOnly={setUnreadOnly}
        allVisibleSelected={allVisibleSelected}
        toggleAllVisible={toggleAllVisible}
        hasFilteredItems={filtered.length > 0}
        selectedCount={selected.length}
        onDeleteSelected={() => setConfirmSelected(true)}
      />

      <NotificationsList
        isLoading={isLoading}
        filtered={filtered}
        selected={selected}
        toggleSelect={toggleSelect}
        onItemClick={(id) => navigate({ to: "/notifications/$id", params: { id } })}
        meta={meta}
        page={page}
        setPage={setPage}
      />

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
  );
}