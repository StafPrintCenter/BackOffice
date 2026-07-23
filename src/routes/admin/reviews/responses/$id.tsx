import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AdminShell } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminReviewResponseDetail, useUpdateAdminReviewResponsePublication } from "@/stores/useReviewResponsesStore";
import { useAdminReviewFormDetail } from "@/stores/useReviewFormsStore";
import { type ReviewPublicationStatus, REVIEW_PUBLICATION_STATUS_BADGES, REVIEW_PUBLICATION_STATUS_LABELS, } from "@/data/reviewResponses";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/reviews/responses/$id")({
  head: () => ({
    meta: [
      { title: `Réponse | ${SITE.name}` },
      { name: "robots", content: "noindex" }],
  }),
  component: ResponseDetail,
});

const ALL_STATUSES: ReviewPublicationStatus[] = ["pending", "approved", "rejected", "hidden", "featured"];
const REQUIRES_PUBLICATION_CONSENT = new Set(["approved", "featured"]);

function ResponseDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: response, isLoading } = useAdminReviewResponseDetail(id);
  const { item: reviewForm } = useAdminReviewFormDetail(response?.reviewFormId);
  const updateMutation = useUpdateAdminReviewResponsePublication();

  const handleStatusChange = (status: ReviewPublicationStatus) => {
    if (!response) return;
    updateMutation.mutate(
      { id: response.id, payload: { publication_status: status } },
      {
        onSuccess: () => toast.success("Statut de publication mis à jour"),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Erreur lors de la mise à jour"),
      }
    );
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement...
        </div>
      </AdminShell>
    );
  }

  if (!response) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/reviews/responses" })}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Réponse introuvable.</p>
      </AdminShell>
    );
  }

  const questionTitle = (questionId: string) =>
    reviewForm?.questions.find((q) => q.id === questionId)?.title ?? questionId;

  const formatAnswer = (value: unknown) => {
    if (value === null || value === undefined || value === "") return "—";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? "Oui" : "Non";
    return String(value);
  };

  return (
    <AdminShell>
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/reviews/responses" })}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour
        </Button>
      </div>

      <div className="grid max-w-4xl gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center justify-between">
              <h1 className="font-display text-2xl font-bold">{response.clientName}</h1>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${REVIEW_PUBLICATION_STATUS_BADGES[response.publicationStatus] ?? "bg-muted text-muted-foreground"}`}>
                {REVIEW_PUBLICATION_STATUS_LABELS[response.publicationStatus] ?? response.publicationStatus}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">{response.clientEmail}</div>
            <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
              <div>Formulaire : <b className="text-foreground">{response.reviewForm}</b></div>
              <div>Projet : <b className="text-foreground">{response.project ?? response.projectName ?? "—"}</b></div>
              <div>Soumise le : <b className="text-foreground">{new Date(response.submittedAt).toLocaleString()}</b></div>
              <div>
                Autorisation de publication :{" "}
                <b className={response.allowPublication ? "text-emerald-600" : "text-foreground"}>
                  {response.allowPublication ? "Accordée" : "Non accordée"}
                </b>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <h2 className="font-display text-lg font-semibold mb-4">Réponses</h2>
            <div className="space-y-3">
              {Object.entries(response.answers).map(([questionId, value]) => (
                <div key={questionId} className="rounded-lg bg-muted/50 p-3">
                  <div className="text-xs font-medium text-muted-foreground">{questionTitle(questionId)}</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm">{formatAnswer(value)}</div>
                </div>
              ))}
              {Object.keys(response.answers).length === 0 && (
                <p className="text-sm text-muted-foreground">Aucune réponse enregistrée.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-6 space-y-3">
            <Label>Statut de publication</Label>
            <Select value={response.publicationStatus} onValueChange={(v) => handleStatusChange(v as ReviewPublicationStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s} disabled={REQUIRES_PUBLICATION_CONSENT.has(s) && !response.allowPublication}>
                    {REVIEW_PUBLICATION_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!response.allowPublication && (
              <p className="text-xs text-muted-foreground">
                Le client n'a pas autorisé la publication : "Approuvée" et "Mise en avant" restent indisponibles.
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}