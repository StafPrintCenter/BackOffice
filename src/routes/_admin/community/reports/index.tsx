import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { TrendingUp, NotebookPen, LayoutGrid } from "lucide-react";
import { PageHeader } from "@/components/site";
import { SITE } from "@/data/site";
import { ReportDetailDialog, ReportsList } from "@/components/pages/community/reports";

export const Route = createFileRoute("/_admin/community/reports/")({
  validateSearch: (s: Record<string, unknown>): { report?: string } => ({
    report: typeof s.report === "string" && s.report ? s.report : undefined,
  }),
  head: () => (
    {
      meta: [
        { title: `${SITE.tool} - Signalements communauté | ${SITE.name}` },
        { name: "description", content: "Consultez les signalements de la communauté." },
      ]
    }),
  component: ReportsPage,
});

function ReportsPage() {
  const { report } = Route.useSearch();
  const navigate = useNavigate({ from: "/community/reports/" });
  const setReport = (id?: string) => navigate({ search: { report: id }, replace: true });

  return (
    <>
      <PageHeader
        title="Signalements de la communauté"
        description="File de modération et chiffres clés."
      />

      {/* Raccourci */}
      <div className="flex items-center gap-6 mb-4">
        <Link to="/community/posts" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <NotebookPen className="h-4 w-4" /> Publications
        </Link>

        <Link to="/community/categories" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <LayoutGrid className="h-4 w-4" /> Catégories
        </Link>

        <Link to="/community/stats" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <TrendingUp className="h-4 w-4" /> Statistiques
        </Link>
      </div>

      <ReportsList onOpenDetail={setReport} />
      <ReportDetailDialog reportId={report} onClose={() => setReport(undefined)} />
    </>
  );
}