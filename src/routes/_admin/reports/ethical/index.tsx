import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { DataTable, PageHeader } from "@/components/site";
import { REPORT_STATUS_BADGES, REPORT_STATUS_LABELS, type APIAdminEthicalReport } from "@/data/reports";
import { ShieldAlert } from "lucide-react";
import { SITE } from "@/data/site";
import { useAdminEthicalReportsList } from "@/stores/useEthicalReportsStore";

export const Route = createFileRoute("/_admin/reports/ethical/")({
  head: () => ({
    meta: [
      { title: `Signalements éthiques | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminEthicalReports,
});

function AdminEthicalReports() {
  const navigate = useNavigate();
  const { items, isLoading, isError } = useAdminEthicalReportsList({ perPage: 100 });

  return (
    <>
      <PageHeader
        title="Signalements éthiques"
        description="Signalements reçus via le dispositif d’alerte éthique."
      />

      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link to="/articleFeedback/group" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ShieldAlert className="h-4 w-4" />
          Signalements du site
        </Link>
      </div>

      {isError ? (
        <p className="text-destructive">Erreur lors du chargement des signalements éthiques.</p>
      ) : (
        <DataTable<APIAdminEthicalReport>
          data={items}
          isLoading={isLoading}
          searchKeys={["trackingCode", "category", "concerned", "occurrencePeriod", "contact"]}
          onView={(report) =>
            navigate({ to: "/reports/ethical/$id", params: { id: report.id } })
          }
          columns={[
            {
              key: "trackingCode",
              label: "Référence",
              render: (report) => (
                <span className="font-mono text-xs font-medium text-primary">
                  {report.trackingCode}
                </span>
              ),
            },
            {
              key: "category",
              label: "Catégorie",
              render: (report) => <span className="text-xs font-medium">{report.category}</span>,
            },
            {
              key: "concerned",
              label: "Personne concernée",
              render: (report) => <span className="text-xs">{report.concerned || "-"}</span>,
            },
            {
              key: "anonymous",
              label: "Anonyme",
              render: (report) => <span className="text-xs">{report.anonymous ? "Oui" : "Non"}</span>,
            },
            {
              key: "createdAt",
              label: "Reçu le",
              render: (report) => (
                <span className="text-xs text-muted-foreground">
                  {new Date(report.createdAt.replace("Z", "")).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              ),
            },
            {
              key: "status",
              label: "Statut",
              render: (report) => (
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${REPORT_STATUS_BADGES[report.status]}`}
                >
                  {REPORT_STATUS_LABELS[report.status]}
                </span>
              ),
            },
          ]}
        />
      )}
    </>
  );
}
