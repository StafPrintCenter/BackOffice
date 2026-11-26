import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader, DataTable } from "@/components/site";
import { useAdminReportsList } from "@/stores/useReportsStore";
import { Scale } from "lucide-react";
import { REPORT_STATUS_BADGES, REPORT_STATUS_LABELS, getReportReasonLabel, getReportableTypeLabel, type APIAdminReport, } from "@/data/reports";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/reports/site/")({
  head: () => ({
    meta: [
      { title: `Signalements de contenus | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: AdminReports,
});

function AdminReports() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminReportsList({ perPage: 100 });

  return (
    <>
      <PageHeader
        title="Signalements de contenus"
        description="Contenus signalés par les visiteurs."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/reports/ethical" })}>
              <Scale className="h-4 w-4" /> Signalements ethiques
            </Button>
          </div>
        }
      />

      <DataTable<APIAdminReport>
        data={items}
        isLoading={isLoading}
        searchKeys={["reason", "reportableType", "reporterEmail"]}
        onView={(r) => navigate({ to: "/reports/site/$id", params: { id: r.id } })}
        columns={[
          {
            key: "id",
            label: "ID",
            render: (r) => (<span className="font-mono text-xs font-medium text-primary">{r.id}</span>
            ),
          },
          {
            key: "reportableType",
            label: "Cible",
            render: (r) => (
              <div className="text-xs font-medium text-foreground">
                {getReportableTypeLabel(r.reportableType)}
              </div>
            ),
          },
          {
            key: "reason",
            label: "Motif",
            render: (r) => (
              <span className="text-xs font-medium">
                {getReportReasonLabel(r.reason)}
              </span>
            ),
          },
          {
            key: "reporterEmail",
            label: "Signalé par",
            render: (r) => <span className="text-xs">{r.reporterEmail || "-"}</span>,
          },
          {
            key: "createdAt",
            label: "Reçu le",
            render: (r) => (
              <span className="text-xs text-muted-foreground">
                {new Date(r.createdAt.replace("Z", "")).toLocaleString("fr-FR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            ),
          },
          {
            key: "status",
            label: "Statut",
            render: (r) => (
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${REPORT_STATUS_BADGES[r.status]}`}>
                {REPORT_STATUS_LABELS[r.status]}
              </span>
            ),
          },
        ]}
      />
    </>
  );
}