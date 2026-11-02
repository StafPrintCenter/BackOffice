import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SITE } from "@/data/site";
import { ReportDetailDialog, ReportsList } from "@/components/pages/community/reports";

export const Route = createFileRoute("/_admin/community/reports/")({
  validateSearch: (s: Record<string, unknown>): { report?: string } => ({
    report: typeof s.report === "string" && s.report ? s.report : undefined,
  }),
  head: () => ({ meta: [{ title: `Signalements communauté | ${SITE.name}` }, { name: "robots", content: "noindex" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { report } = Route.useSearch();
  const navigate = useNavigate({ from: "/community/reports/" });
  const setReport = (id?: string) => navigate({ search: { report: id }, replace: true });

  return (
    <>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold">Signalements de la communauté</h1>
        <p className="text-sm text-muted-foreground">File de modération et chiffres clés.</p>
      </div>
      <ReportsList onOpenDetail={setReport} />
      <ReportDetailDialog reportId={report} onClose={() => setReport(undefined)} />
    </>
  );
}