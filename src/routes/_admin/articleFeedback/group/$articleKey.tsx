import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  useAdminArticleFeedbackGroupDetail,
  fetchAdminArticleFeedbackGroupDetail,
} from "@/stores/useArticleFeedbackStore";
import { SITE } from "@/data/site";
import {
  FeedbackGroupDetailHeader,
  FeedbackGroupSatisfactionCard,
  FeedbackGroupItemsList,
  FeedbackGroupDocCard,
  FeedbackGroupStatsCard,
  FeedbackGroupTimestampCard,
  FeedbackGroupLoadingState,
  FeedbackGroupNotFoundState,
} from "@/components/pages/articleFeedback/group/detail";

export const Route = createFileRoute("/_admin/articleFeedback/group/$articleKey")({
  loader: async ({ params }) => {
    const articleKey = decodeURIComponent(params.articleKey);
    const item = await fetchAdminArticleFeedbackGroupDetail(articleKey);
    return { item };
  },
  head: ({ loaderData }) => {
    const headTitle = loaderData?.item?.articleKey;
    return {
      meta: [
        {
          title: headTitle
            ? `Retours : ${headTitle} | ${SITE.name}`
            : `Retours sur article | ${SITE.name}`,
        },
        { name: "robots", content: "noindex text" },
      ],
    };
  },
  component: ArticleFeedbackGroupDetail,
});

function ArticleFeedbackGroupDetail() {
  const { articleKey: encodedKey } = Route.useParams();
  const articleKey = decodeURIComponent(encodedKey);
  const navigate = useNavigate();
  const { item: group, isLoading } = useAdminArticleFeedbackGroupDetail(articleKey);

  if (isLoading) {
    return <FeedbackGroupLoadingState />;
  }

  if (!group) {
    return <FeedbackGroupNotFoundState onBack={() => navigate({ to: "/articleFeedback/group" })} />;
  }

  return (
    <div className="space-y-6">
      <FeedbackGroupDetailHeader group={group} articleKey={articleKey} onBack={() => navigate({ to: "/articleFeedback/group" })} />

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        <div className="space-y-6 lg:col-span-8">
          <FeedbackGroupSatisfactionCard group={group} />
          <FeedbackGroupItemsList feedbacks={group.feedbacks} />
        </div>

        <div className="space-y-6 lg:col-span-4">
          <FeedbackGroupDocCard group={group} articleKey={articleKey} />
          <FeedbackGroupStatsCard group={group} />
          <FeedbackGroupTimestampCard group={group} />
        </div>
      </div>
    </div>
  );
}