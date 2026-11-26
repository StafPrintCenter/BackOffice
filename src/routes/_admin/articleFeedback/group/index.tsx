import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sticker } from "lucide-react";
import { PageHeader, DataTable } from "@/components/site";
import { useAdminArticleFeedbackGroupsList } from "@/stores/useArticleFeedbackStore";
import type { APIAdminArticleFeedbackGroup } from "@/data/articleFeedback";
import { SITE } from "@/data/site";
import { getFeedbackGroupColumns } from "@/components/pages/articleFeedback/group/home";

export const Route = createFileRoute("/_admin/articleFeedback/group/")({
  head: () => ({
    meta: [
      { title: `Retours groupés par article | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminArticleFeedbackGroups,
});

type FeedbackGroupRow = APIAdminArticleFeedbackGroup & { id: string };

function AdminArticleFeedbackGroups() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminArticleFeedbackGroupsList({ perPage: 100 });

  const rows: FeedbackGroupRow[] = items.map((g) => ({ ...g, id: g.articleKey }));

  return (
    <>
      <PageHeader
        title="Retours groupés par article"
        description="Score de satisfaction agrégé pour chaque article de la documentation."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/articleFeedback/unique" })}>
              <Sticker className="h-4 w-4" /> Feedbacks uniques
            </Button>
          </div>
        }
      />

      <DataTable<FeedbackGroupRow>
        data={rows}
        isLoading={isLoading}
        searchKeys={["articleKey"]}
        onView={(r) => navigate({ to: "/articleFeedback/group/$articleKey", params: { articleKey: encodeURIComponent(r.articleKey) } })}
        columns={getFeedbackGroupColumns()}
      />
    </>
  );
}