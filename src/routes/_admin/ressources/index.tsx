import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDelete, DataTable, PageHeader } from "@/components/site";
import { ResourceCreateModal, getResourceTableColumns } from "@/components/pages/resources/home";
import type { APIAdminResourceListItem } from "@/data/resources";
import { SITE } from "@/data/site";
import { useAdminResourcesList, useDeleteAdminResource } from "@/stores/useResourcesStore";

export const Route = createFileRoute("/_admin/ressources/")({
  head: () => ({
    meta: [
      { title: `Ressources | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminResources,
});

function AdminResources() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminResourcesList({ perPage: 100 });
  const removeMutation = useDeleteAdminResource();
  const [createOpen, setCreateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<APIAdminResourceListItem | null>(null);
  const columns = useMemo(() => getResourceTableColumns(), []);

  return (
    <>
      <PageHeader title="Ressources" description="Gérez les fichiers téléchargeables proposés sur le site." />
      <DataTable<APIAdminResourceListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["title", "category", "status", "short"]}
        onCreate={() => setCreateOpen(true)}
        createLabel="Nouvelle ressource"
        onView={(resource) => navigate({ to: "/ressources/$id", params: { id: resource.id } })}
        onDelete={setToDelete}
        columns={columns}
      />

      <ResourceCreateModal open={createOpen} onOpenChange={setCreateOpen} />
      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          removeMutation.mutate(toDelete.id, {
            onSuccess: () => {
              toast.success("Ressource supprimée");
              setToDelete(null);
            },
            onError: (error) => toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer « ${toDelete?.title} » ?`}
      />
    </>
  );
}
