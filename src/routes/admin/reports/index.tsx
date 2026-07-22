import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminShell, PageHeader, DataTable } from "@/components/site";
import { useAdminReportsList } from "@/stores/useReportsStore";
import type { APIAdminReport, ReportStatus } from "@/data/reports";

export const Route = createFileRoute("/admin/reports/")({
  head: () => ({ meta: [{ title: "Signalements — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminReports,
});

const statusBadge = (s: ReportStatus) =>
({
  pending: "bg-red-100 text-red-700",
  in_review: "bg-amber-100 text-amber-700",
  resolved: "bg-emerald-100 text-emerald-700",
  dismissed: "bg-muted text-muted-foreground",
}[s]);

const statusLabel = (s: ReportStatus) =>
  ({ pending: "Ouvert", in_review: "En cours", resolved: "Résolu", dismissed: "Rejeté" }[s]);

function AdminReports() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminReportsList({ perPage: 100 });

  return (
    <AdminShell>
      <PageHeader title="Signalements" description="Contenus signalés par les visiteurs." />
      <DataTable<APIAdminReport>
        data={items}
        isLoading={isLoading}
        searchKeys={["reason", "reportableType", "reporterEmail"]}
        onView={(r) => navigate({ to: "/admin/reports/$id", params: { id: r.id } })}
        columns={[
          {
            key: "id",
            label: "ID",
            render: (r) => (
              <span className="font-mono text-xs font-medium text-primary hover:underline">
                #{r.id.slice(0, 6)}
              </span>
            ),
          },
          {
            key: "reportableType",
            label: "Type",
            render: (r) => (
              <div>
                <div className="text-xs font-medium">{r.reportableType}</div>
                <div className="text-[10px] text-muted-foreground">{r.reportableId}</div>
              </div>
            ),
          },
          {
            key: "reason",
            label: "Motif",
            render: (r) => <div className="max-w-xs line-clamp-2 text-xs">{r.reason}</div>,
          },
          {
            key: "reporterEmail",
            label: "Signalé par",
            render: (r) => <span className="text-xs">{r.reporterEmail || "—"}</span>,
          },
          {
            key: "status",
            label: "Statut",
            render: (r) => (
              <span className={"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " + statusBadge(r.status)}>
                {statusLabel(r.status)}
              </span>
            ),
          },
        ]}
      />
    </AdminShell>
  );
}
