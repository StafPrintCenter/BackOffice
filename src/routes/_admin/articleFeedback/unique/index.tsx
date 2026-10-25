import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, ConfirmDelete, DataTable } from "@/components/site";
import { useAdminArticleFeedbacksList, useDeleteAdminArticleFeedback } from "@/stores/useArticleFeedbackStore";
import type { APIAdminArticleFeedback } from "@/data/articleFeedback";
import { SITE } from "@/data/site";
import { FeedbackUniqueShortcut, getFeedbackUniqueColumns } from "@/components/pages/articleFeedback/unique/home";

export const Route = createFileRoute("/_admin/articleFeedback/unique/")({
  head: () => ({
    meta: [
      { title: `Retours sur articles | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminArticleFeedback,
});

function AdminArticleFeedback() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminArticleFeedbacksList({ perPage: 100 });
  const removeMutation = useDeleteAdminArticleFeedback();

  const [toDelete, setToDelete] = useState<APIAdminArticleFeedback | null>(null);

  return (
    <>
      <PageHeader
        title="Retours sur articles"
        description="Votes et commentaires laissés par les visiteurs sur les articles de la documentation."
      />

      <FeedbackUniqueShortcut />

      <DataTable<APIAdminArticleFeedback>
        data={items}
        isLoading={isLoading}
        searchKeys={["articleKey", "comment"]}
        onView={(r) => navigate({ to: "/articleFeedback/unique/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={getFeedbackUniqueColumns()}
      />

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          removeMutation.mutate(toDelete.id, {
            onSuccess: () => { toast.success("Retour supprimé"); setToDelete(null); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer ce retour sur "${toDelete?.articleKey}" ?`}
      />
    </>
  );
}