import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { PageHeader, ConfirmDelete, DataTable } from "@/components/site";
import { useAdminArticlesList, useDeleteAdminArticle, useAdminCategoriesList } from "@/stores";
import type { APIAdminArticleListItem } from "@/data/articles";
import { SITE } from "@/data/site";
import { ArticleCreateModal, getArticleTableColumns } from "@/components/pages/admin/articles/home";

export const Route = createFileRoute("/_admin/articles/")({
  head: () => ({
    meta: [
      { title: `Articles | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminArticles,
});

function AdminArticles() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminArticlesList({ perPage: 100 });
  const { items: categories } = useAdminCategoriesList({ perPage: 100 });

  const removeMutation = useDeleteAdminArticle();

  const [createOpen, setCreateOpen] = useState(false);
  const [toDelete, setToDelete] = useState<APIAdminArticleListItem | null>(null);

  const columns = useMemo(() => getArticleTableColumns(categories), [categories]);

  return (
    <>
      <PageHeader title="Articles" description="Blog du site." />

      <DataTable<APIAdminArticleListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["title", "category", "author"]}
        onCreate={() => setCreateOpen(true)}
        onView={(r) => navigate({ to: "/articles/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={columns}
      />

      <ArticleCreateModal open={createOpen} onOpenChange={setCreateOpen} categories={categories} />

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          removeMutation.mutate(toDelete.id, {
            onSuccess: () => {
              toast.success("Article supprimé");
              setToDelete(null);
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${toDelete?.title}" ?`}
      />
    </>
  );
}