import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Send, FileText } from "lucide-react";
import { AdminShell, PageHeader, DataTable } from "@/components/site";
import { useAdminReviewResponsesList } from "@/stores/useReviewResponsesStore";
import { type APIAdminReviewResponseListItem, REVIEW_PUBLICATION_STATUS_BADGES, REVIEW_PUBLICATION_STATUS_LABELS, } from "@/data/reviewResponses";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/reviews/responses/")({
  head: () => ({
    meta: [
      { title: `Réponses | ${SITE.name}` },
      { name: "robots", content: "noindex" }
    ],
  }),
  component: AdminReviewResponses,
});

function AdminReviewResponses() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminReviewResponsesList({ perPage: 100 });

  return (
    <AdminShell>
      <PageHeader title="Réponses" description="Consultez les réponses reçues et gérez leur publication." />

      {/* Raccourci */}
      <div className="flex items-center gap-6 mb-4">
        <div>
          <Link to="/admin/reviews/forms"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
            <FileText className="h-4 w-4"
            />
            Gérer les formulaire
          </Link>
        </div>
        <div>
          <Link to="/admin/reviews/invites"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
            <Send className="h-4 w-4"
            />
            Inviter un client
          </Link>
        </div>
      </div>

      <DataTable<APIAdminReviewResponseListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["clientName", "clientEmail", "reviewForm", "projectName"]}
        onView={(r) => navigate({ to: "/admin/reviews/responses/$id", params: { id: r.id } })}
        columns={[
          {
            key: "clientName",
            label: "Client",
            render: (r) => (
              <div>
                <div className="font-medium">{r.clientName}</div>
                <div className="text-xs text-muted-foreground">{r.clientEmail}</div>
              </div>
            ),
          },
          { key: "reviewForm", label: "Formulaire", render: (r) => <span className="text-xs">{r.reviewForm}</span> },
          { key: "project", label: "Projet", render: (r) => <span className="text-xs">{r.project ?? r.projectName ?? "—"}</span> },
          {
            key: "allowPublication",
            label: "Publication",
            render: (r) => (
              <span className={"text-xs " + (r.allowPublication ? "text-emerald-600" : "text-muted-foreground")}>
                {r.allowPublication ? "Autorisée" : "Réfusée"}
              </span>
            ),
          },
          {
            key: "publicationStatus",
            label: "Statut",
            render: (r) => (
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${REVIEW_PUBLICATION_STATUS_BADGES[r.publicationStatus] ?? "bg-muted text-muted-foreground"}`}>
                {REVIEW_PUBLICATION_STATUS_LABELS[r.publicationStatus] ?? r.publicationStatus}
              </span>
            ),
          },
          {
            key: "submittedAt",
            label: "Soumise le",
            render: (r) => <span className="text-xs text-muted-foreground">{new Date(r.submittedAt).toLocaleString()}</span>,
          },
        ]}
      />
    </AdminShell>
  );
}