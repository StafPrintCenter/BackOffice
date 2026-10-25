import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, ConfirmDelete, DataTable } from "@/components/site";
import { useAdminCategoriesList, useCreateAdminCategory, useUpdateAdminCategory, useDeleteAdminCategory } from "@/stores/useCategoriesStore";
import type { APIAdminCategory, AdminCategoryPayload } from "@/data/categories";
import { SITE } from "@/data/site";
import { CategoryCreateModal, categoryTableColumns } from "@/components/pages/categories/home";

export const Route = createFileRoute("/_admin/categories/")({
  head: () => ({
    meta: [
      { title: `Catégories | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminCategories,
});

function AdminCategories() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminCategoriesList({ perPage: 100 });
  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();
  const removeMutation = useDeleteAdminCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<APIAdminCategory | undefined>(undefined);
  const [toDelete, setToDelete] = useState<APIAdminCategory | null>(null);

  const handleOpenCreate = () => {
    setSelectedCategory(undefined);
    setDialogOpen(true);
  };

  const handleOpenEdit = (row: APIAdminCategory) => {
    setSelectedCategory(row);
    setDialogOpen(true);
  };

  const handleSave = (payload: AdminCategoryPayload) => {
    if (selectedCategory) {
      updateMutation.mutate(
        { id: selectedCategory.id, payload },
        {
          onSuccess: () => {
            toast.success("Catégorie modifiée");
            setDialogOpen(false);
          },
          onError: () => toast.error("Erreur lors de la modification"),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Catégorie créée");
          setDialogOpen(false);
        },
        onError: () => toast.error("Erreur lors de la création"),
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Catégories"
        description="Utilisées par formations, projets, articles, newsletter et FAQ."
      />

      <DataTable<APIAdminCategory>
        data={items}
        isLoading={isLoading}
        searchKeys={["name", "slug"]}
        onCreate={handleOpenCreate}
        onEdit={handleOpenEdit}
        onDelete={(r) => setToDelete(r)}
        onView={(r) => navigate({ to: "/categories/$id", params: { id: r.id } })}
        columns={categoryTableColumns}
      />

      <CategoryCreateModal
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={selectedCategory}
        onSubmit={handleSave}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          removeMutation.mutate(toDelete.id, {
            onSuccess: () => {
              toast.success("Catégorie supprimée");
              setToDelete(null);
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${toDelete?.name}" ?`}
      />
    </>
  );
}