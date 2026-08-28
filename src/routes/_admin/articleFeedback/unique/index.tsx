import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Folders } from "lucide-react";
import { PageHeader, ConfirmDelete } from "@/components/site";
import { DataTable } from "@/components/site/DataTable";
import { useAdminArticleFeedbacksList, useDeleteAdminArticleFeedback } from "@/stores/useArticleFeedbackStore";
import { getArticleFeedbackVoteBadge, getArticleFeedbackVoteLabel } from "@/data/articleFeedback";
import type { APIAdminArticleFeedback } from "@/data/articleFeedback";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/articleFeedback/unique/")({
  head: () => ({
    meta: [
      { title: `Retours sur articles | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminArticleFeedback,
});

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

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

      {/* Raccourci */}
      <div className="mb-4">
        <Link to="/articleFeedback/group"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Folders className="h-4 w-4"
          />
          Aller aux Feedbacks groupés
        </Link>
      </div>

      <DataTable<APIAdminArticleFeedback>
        data={items}
        isLoading={isLoading}
        searchKeys={["articleKey", "comment"]}
        onView={(r) => navigate({ to: "/articleFeedback/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={[
          {
            key: "articleKey",
            label: "Article",
            render: (r) => <code className="text-xs font-medium">{r.articleKey}</code>,
          },
          {
            key: "vote",
            label: "Vote",
            render: (r) => (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getArticleFeedbackVoteBadge(r.vote)}`}>
                {getArticleFeedbackVoteLabel(r.vote)}
              </span>
            ),
          },
          {
            key: "comment",
            label: "Commentaire",
            render: (r) => <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{r.comment || "-"}</span>,
          },
          {
            key: "createdAt",
            label: "Reçu le",
            render: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>,
          },
        ]}
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