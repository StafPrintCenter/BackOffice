import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, ConfirmDelete, DataTable } from "@/components/site";
import { useAdminAnnouncementsList, useDeleteAdminAnnouncement } from "@/stores/useAnnouncementsStore";
import type { APIAdminAnnouncement } from "@/data/announcements";
import { SITE } from "@/data/site";
import { AnnouncementCreateModal, announcementTableColumns } from "@/components/pages/admin/announces/home";

export const Route = createFileRoute("/_admin/announces/")({
  head: () => ({
    meta: [
      { title: `Annonces | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminAnnouncements,
});

function AdminAnnouncements() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminAnnouncementsList({ perPage: 100 });
  const removeMutation = useDeleteAdminAnnouncement();

  const [createOpen, setCreateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<APIAdminAnnouncement | null>(null);

  return (
    <>
      <PageHeader title="Annonces" description="Bannières, pop-ups et notifications affichées sur le site." />

      <DataTable<APIAdminAnnouncement>
        data={items}
        isLoading={isLoading}
        searchKeys={["title", "message", "type"]}
        onCreate={() => setCreateOpen(true)}
        onView={(r) => navigate({ to: "/announces/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={announcementTableColumns}
      />

      <AnnouncementCreateModal open={createOpen} onOpenChange={setCreateOpen} />

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          removeMutation.mutate(toDelete.id, {
            onSuccess: () => { toast.success("Annonce supprimée"); setToDelete(null); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${toDelete?.title}" ?`}
      />
    </>
  );
}