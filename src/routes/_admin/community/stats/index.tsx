import { createFileRoute, Link } from "@tanstack/react-router";
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
  return (
    <>
      <PageHeader
        title="Statistiques de la communauté"
        description="Vue d'ensemble et chiffres clés."
      />

      {/* Raccourci */}
      <div className="flex items-center gap-6 mb-4">
        <Link to="/community/posts" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <NotebookPen className="h-4 w-4" /> Publications
        </Link>

        <Link to="/community/categories" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <LayoutGrid className="h-4 w-4" /> Catégories
        </Link>

        <Link to="/community/reports" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Flag className="h-4 w-4" /> Signalement
        </Link>
      </div>

      <CommunityStatsPanel />
    </>
  );
}