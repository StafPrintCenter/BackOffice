import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, FileText, ThumbsUp, ThumbsDown, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminArticleFeedbackGroupDetail } from "@/stores/useArticleFeedbackStore";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/articleFeedback/group/$articleKey")({
  head: () => ({
    meta: [
      { title: `Retours sur article | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ArticleFeedbackGroupDetail,
});

function ArticleFeedbackGroupDetail() {
  const { articleKey: encodedKey } = Route.useParams();
  const articleKey = decodeURIComponent(encodedKey);
  const navigate = useNavigate();
  const { item: group, isLoading } = useAdminArticleFeedbackGroupDetail(articleKey);

  const pct = group && group.totalVotes > 0 ? Math.round((group.positiveVotes / group.totalVotes) * 100) : 0;

  return (
    <>
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/articleFeedback/group" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      ) : !group ? (
        <p className="text-muted-foreground">Aucun retour trouvé pour cet article.</p>
      ) : (
        <div className="max-w-2xl space-y-6">
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h1 className="font-display text-xl font-bold">{group.articleKey}</h1>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border bg-background/50 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <ThumbsUp className="h-4 w-4 text-emerald-600" /> Votes positifs
                </div>
                <div className="mt-1 text-2xl font-bold text-emerald-600">{group.positiveVotes}</div>
              </div>
              <div className="rounded-xl border bg-background/50 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <ThumbsDown className="h-4 w-4 text-destructive" /> Votes négatifs
                </div>
                <div className="mt-1 text-2xl font-bold text-destructive">{group.negativeVotes}</div>
              </div>
              <div className="rounded-xl border bg-background/50 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <BarChart3 className="h-4 w-4 text-primary" /> Total
                </div>
                <div className="mt-1 text-2xl font-bold">{group.totalVotes}</div>
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="text-xs font-medium text-muted-foreground">Taux de satisfaction</div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${pct >= 50 ? "bg-emerald-500" : "bg-destructive"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="mt-1 text-sm font-semibold">{pct}%</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}