import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { AdminShell, PageHeader, DataTable } from "@/components/site";
import { useAdminJobApplicationsList } from "@/stores/useJobApplicationsStore";
import type { APIAdminJobApplication } from "@/data/jobApplications";
import { JOB_APPLICATION_STATUS_LABELS, getJobApplicationStatusBadge } from "@/data/jobApplications";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/jobs/applications/")({
  head: () => ({
    meta: [
      { title: `Candidatures | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminJobApplications,
});

function AdminJobApplications() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminJobApplicationsList({ perPage: 100 });

  return (
    <AdminShell>
      <PageHeader title="Candidatures" description="Candidatures reçues pour les offres d'emploi." />

      <div className="mb-4">
        <Link to="/admin/jobs/offers" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Briefcase className="h-4 w-4" /> Voir les offres d'emploi
        </Link>
      </div>

      <DataTable<APIAdminJobApplication>
        data={items}
        isLoading={isLoading}
        searchKeys={["firstName", "lastName", "email", "jobOffer"]}
        onView={(r) => navigate({ to: "/admin/jobs/applications/$id", params: { id: r.id } })}
        columns={[
          {
            key: "jobOffer",
            label: "Offre",
            render: (r) => <span className="text-xs font-medium">{r.jobOffer}</span>,
          },
          {
            key: "firstName",
            label: "Candidat",
            render: (r) => (
              <div>
                <div className="font-medium">{r.firstName} {r.lastName}</div>
                <div className="text-xs text-muted-foreground">{r.email}</div>
              </div>
            ),
          },
          {
            key: "educationLevel",
            label: "Niveau",
            render: (r) => <span className="text-xs">{r.educationLevel}</span>,
          },
          {
            key: "createdAt",
            label: "Reçue le",
            render: (r) => (
              <span className="text-xs text-muted-foreground">
                {new Date(r.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
              </span>
            ),
          },
          {
            key: "status",
            label: "Statut",
            render: (r) => (
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getJobApplicationStatusBadge(r.status)}`}>
                {JOB_APPLICATION_STATUS_LABELS[r.status]}
              </span>
            ),
          },
        ]}
      />
    </AdminShell>
  );
}