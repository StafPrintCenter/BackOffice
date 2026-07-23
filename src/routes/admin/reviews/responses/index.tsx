import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AdminShell, PageHeader, DataTable } from "@/components/site";
import { Button } from "@/components/ui/button";
import { useAdminReviewResponsesList } from "@/stores/useReviewResponsesStore";
import {
  type APIAdminReviewResponseListItem,
  REVIEW_PUBLICATION_STATUS_BADGES,
  REVIEW_PUBLICATION_STATUS_LABELS,
} from "@/data/reviewResponses";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/reviews/responses/")({
  head: () => ({
    meta: [{ title: `Réponses | ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: AdminReviewResponses,
});

function AdminReviewResponses() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminReviewResponsesList({ perPage: 100 });

  return (
    <AdminShell>
      <div className="mb-4">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/reviews" })}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour
        </Button>
      </div>
      <PageHeader title="Réponses" description="Consultez les réponses reçues et gérez leur publication." />

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
            label: "Autorisation",
            render: (r) => (
              <span className={"text-xs " + (r.allowPublication ? "text-emerald-600" : "text-muted-foreground")}>
                {r.allowPublication ? "Publication autorisée" : "Non autorisée"}
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