import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, DataTable } from "@/components/site";
import { useAdminInternshipRequestsList } from "@/stores/useInternshipRequestsStore";
import type { APIAdminInternshipRequest } from "@/data/internshipRequests";
import { INTERNSHIP_REQUEST_STATUS_LABELS, getInternshipRequestStatusBadge } from "@/data/internshipRequests";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/internships/")({
  head: () => ({
    meta: [
      { title: `Demandes de stage | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminInternshipRequests,
});

function AdminInternshipRequests() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminInternshipRequestsList({ perPage: 100 });

  return (
    <>
      <PageHeader title="Demandes de stage" description="Candidatures reçues pour des stages." />
      <DataTable<APIAdminInternshipRequest>
        data={items}
        isLoading={isLoading}
        searchKeys={["firstName", "lastName", "email", "institution", "fieldOfStudy"]}
        onView={(r) => navigate({ to: "/internships/$id", params: { id: r.id } })}
        columns={[
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
            key: "institution",
            label: "Établissement",
            render: (r) => (
              <div>
                <div className="text-xs font-medium">{r.institution || "-"}</div>
                <div className="text-xs text-muted-foreground">{r.fieldOfStudy || ""}</div>
              </div>
            ),
          },
          {
            key: "duration",
            label: "Durée souhaitée",
            render: (r) => <span className="text-xs">{r.duration || "-"}</span>,
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
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getInternshipRequestStatusBadge(r.status)}`}>
                {INTERNSHIP_REQUEST_STATUS_LABELS[r.status]}
              </span>
            ),
          },
        ]}
      />
    </>
  );
}
