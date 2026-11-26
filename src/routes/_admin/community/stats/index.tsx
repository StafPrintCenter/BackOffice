import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Flag, NotebookPen, LayoutGrid } from "lucide-react";
import { PageHeader } from "@/components/site";
import { SITE } from "@/data/site";
import { CommunityStatsPanel } from "@/components/pages/community/stats";

export const Route = createFileRoute("/_admin/community/stats/")({
  validateSearch: (s: Record<string, unknown>): { report?: string } => ({
    report: typeof s.report === "string" && s.report ? s.report : undefined,
  }),
  head: () => (
    {
      meta: [
        { title: `${SITE.tool} - Statistiques de la communauté | ${SITE.name}` },
        { name: "description", content: "Consultez les statistiques de la communauté." },
      ]
    }),
  component: StatsPage,
});

function StatsPage() {
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Statistiques de la communauté"
        description="Vue d'ensemble et chiffres clés."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/community/posts" })}>
              <NotebookPen className="h-4 w-4" /> Publications
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/community/categories" })}>
              <LayoutGrid className="h-4 w-4" /> Catégories
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/community/reports" })}>
              <Flag className="h-4 w-4" /> Signalement
            </Button>
          </div>
        }
      />

      <CommunityStatsPanel />
    </>
  );
}