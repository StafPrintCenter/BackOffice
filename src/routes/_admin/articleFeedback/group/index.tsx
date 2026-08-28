import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site";
import { Sticker } from "lucide-react";
import { DataTable } from "@/components/site/DataTable";
import { useAdminArticleFeedbackGroupsList } from "@/stores/useArticleFeedbackStore";
import type { APIAdminArticleFeedbackGroup } from "@/data/articleFeedback";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/articleFeedback/group/")({
  head: () => ({
    meta: [
      { title: `Retours groupés par article | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminArticleFeedbackGroups,
});

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

// DataTable exige un champ id: string — articleKey en tient lieu ici (identifiant
// naturel de la ressource), le type de données réel reste inchangé.
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
      />

      {/* Raccourci */}
      <div className="mb-4">
        <Link to="/articleFeedback/unique"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Sticker className="h-4 w-4"
          />
          Aller aux Feedbacks uniques
        </Link>
      </div>

      <DataTable<FeedbackGroupRow>
        data={rows}
        isLoading={isLoading}
        searchKeys={["articleKey"]}
        onView={(r) => navigate({ to: "/articleFeedback/group/$articleKey", params: { articleKey: encodeURIComponent(r.articleKey) } })}
        columns={[
          {
            key: "articleKey",
            label: "Article",
            render: (r) => <code className="text-xs font-medium">{r.articleKey}</code>,
          },
          {
            key: "positiveVotes",
            label: "Positifs",
            render: (r) => <span className="text-emerald-600 font-medium">{r.positiveVotes}</span>,
          },
          {
            key: "negativeVotes",
            label: "Négatifs",
            render: (r) => <span className="text-destructive font-medium">{r.negativeVotes}</span>,
          },
          {
            key: "totalVotes",
            label: "Total",
            render: (r) => <span className="font-semibold">{r.totalVotes}</span>,
          },
          {
            key: "commentsCount",
            label: "Commentaires",
            render: (r) => <span className="text-xs text-muted-foreground">{r.commentsCount}</span>,
          },
          {
            key: "satisfactionRate",
            label: "Satisfaction",
            render: (r) => (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${r.satisfactionRate >= 50 ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
                {r.satisfactionRate}%
              </span>
            ),
          },
          {
            key: "lastFeedbackAt",
            label: "Dernier retour",
            render: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.lastFeedbackAt)}</span>,
          },
        ]}
      />
    </>
  );
}