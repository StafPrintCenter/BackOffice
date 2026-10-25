import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ConfirmDelete } from "@/components/site";
import {
  useAdminArticleFeedbackDetail,
  useDeleteAdminArticleFeedback,
  fetchAdminArticleFeedbackById,
} from "@/stores/useArticleFeedbackStore";
import { SITE } from "@/data/site";
import {
  FeedbackUniqueDetailHeader,
  FeedbackUniqueMainCard,
  FeedbackUniqueSidebarVote,
  FeedbackUniqueSidebarTimestamp,
  FeedbackUniqueLoadingState,
  FeedbackUniqueNotFoundState,
} from "@/components/pages/articleFeedback/unique/detail";

export const Route = createFileRoute("/_admin/articleFeedback/unique/$id")({
  loader: async ({ params }) => {
    const item = await fetchAdminArticleFeedbackById(params.id);
    return { item };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.item?.articleKey
          ? `Retour : ${loaderData.item.articleKey} | ${SITE.name}`
          : `Retour sur article | ${SITE.name}`,
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ArticleFeedbackDetail,
});

function ArticleFeedbackDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: feedback, isLoading } = useAdminArticleFeedbackDetail(id);
  const removeMutation = useDeleteAdminArticleFeedback();

  const [toDelete, setToDelete] = useState(false);

  if (isLoading) {
    return <FeedbackUniqueLoadingState />;
  }

  if (!feedback) {
    return <FeedbackUniqueNotFoundState onBack={() => navigate({ to: "/articleFeedback/unique" })} />;
  }

  return (
    <div className="space-y-6">
      <FeedbackUniqueDetailHeader
        onBack={() => navigate({ to: "/articleFeedback/unique" })}
        onDelete={() => setToDelete(true)}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <FeedbackUniqueMainCard feedback={feedback} />
        </div>

        <div className="space-y-6">
          <FeedbackUniqueSidebarVote feedback={feedback} />
          <FeedbackUniqueSidebarTimestamp feedback={feedback} />
        </div>
      </div>

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(feedback.id, {
            onSuccess: () => {
              toast.success("Retour supprimé");
              navigate({ to: "/articleFeedback/unique" });
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer le retour sur "${feedback.articleKey}" ?`}
      />
    </div>
  );
}