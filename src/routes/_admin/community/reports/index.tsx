import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { TrendingUp, NotebookPen, LayoutGrid } from "lucide-react";
import { PageHeader } from "@/components/site";
import { SITE } from "@/data/site";
import { ReportsList } from "@/components/pages/community/reports";

export const Route = createFileRoute("/_admin/community/reports/")({
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
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Signalements de la communauté"
        description="File de modération et chiffres clés."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/community/posts" })}>
              <NotebookPen className="h-4 w-4" /> Publications
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/community/categories" })}>
              <LayoutGrid className="h-4 w-4" /> Catégories
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/community/stats" })}>
              <TrendingUp className="h-4 w-4" /> Statistiques
            </Button>
          </div>
        }
      />

      <ReportsList />
    </>
  );
}
