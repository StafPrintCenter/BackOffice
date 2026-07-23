import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Calendar,
  Folder,
  FileText,
  User,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  MessageSquare,
  ExternalLink,
  Star,
} from "lucide-react";
import { AdminShell } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdminReviewResponseDetail,
  useUpdateAdminReviewResponsePublication,
} from "@/stores/useReviewResponsesStore";
import { useAdminReviewFormDetail } from "@/stores/useReviewFormsStore";
import {
  type ReviewPublicationStatus,
  REVIEW_PUBLICATION_STATUS_BADGES,
  REVIEW_PUBLICATION_STATUS_LABELS,
} from "@/data/reviewResponses";
import {
  REVIEW_QUESTION_TYPE_LABELS,
  REVIEW_QUESTION_TYPE_BADGES,
} from "@/data/reviewsForms";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/reviews/responses/$id")({
  head: () => ({
    meta: [
      { title: `Réponse | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResponseDetail,
});

const ALL_STATUSES: ReviewPublicationStatus[] = [
  "pending",
  "approved",
  "rejected",
  "hidden",
  "featured",
];
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
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Erreur lors de la mise à jour"
          ),
      }
    );
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr.replace("Z", "")).toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/admin/reviews/responses" })}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Réponse introuvable.</p>
      </AdminShell>
    );
  }

  const getQuestion = (questionId: string) =>
    reviewForm?.questions.find((q) => q.id === questionId);

  const formatAnswer = (value: unknown, questionType?: string) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-muted-foreground italic">— Non renseigné —</span>;
    }

    if (questionType === "rating" && typeof value === "number") {
      return (
        <div className="flex items-center gap-1 text-amber-500 font-semibold">
          <span>{value}</span>
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        </div>
      );
    }

    if (typeof value === "boolean") {
      return value ? (
        <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
          Oui
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 font-medium text-rose-600">
          Non
        </span>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {value.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded-md bg-background px-2 py-0.5 text-xs font-medium border"
            >
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    const strVal = String(value);
    if (strVal.startsWith("http://") || strVal.startsWith("https://")) {
      return (
        <a
          href={strVal}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
        >
          Voir la pièce jointe / lien <ExternalLink className="h-3.5 w-3.5" />
        </a>
      );
    }

    return <div className="whitespace-pre-wrap leading-relaxed">{strVal}</div>;
  };

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: "/admin/reviews/responses" })}
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour
        </Button>
      </div>

      <div className="max-w-5xl space-y-6">
        {/* En-tête de la réponse */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-6">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${REVIEW_PUBLICATION_STATUS_BADGES[response.publicationStatus] ??
                  "bg-muted text-muted-foreground"
                  }`}
              >
                {REVIEW_PUBLICATION_STATUS_LABELS[response.publicationStatus] ??
                  response.publicationStatus}
              </span>
              <span className="text-xs text-muted-foreground">• ID: {response.id.slice(0, 8)}</span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              {response.clientName || "Client anonyme"}
            </h1>
            {response.clientEmail && (
              <a
                href={`mailto:${response.clientEmail}`}
                className="mt-1 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Mail className="h-3.5 w-3.5" /> {response.clientEmail}
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-4 py-2 text-xs">
            {response.allowPublication ? (
              <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <ShieldCheck className="h-4 w-4" /> Autorisation de publication accordée
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-600 font-medium">
                <ShieldAlert className="h-4 w-4" /> Publication non autorisée
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Contenu des réponses aux questions */}
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-4 rounded-2xl border bg-card p-6">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2 font-display text-lg font-semibold">
                  <MessageSquare className="h-5 w-5 text-primary" /> Réponses au formulaire
                </div>
                <span className="text-xs text-muted-foreground">
                  {Object.keys(response.answers).length} question(s)
                </span>
              </div>

              {/* Méta-informations secondaires */}
              <div className="grid gap-3 rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>
                    Formulaire : <b className="text-foreground">{response.reviewForm}</b>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-primary" />
                  <span>
                    Projet : <b className="text-foreground">{response.project ?? response.projectName ?? "—"}</b>
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>
                    Soumis le : <b className="text-foreground">{formatDate(response.submittedAt)}</b>
                  </span>
                </div>
              </div>

              {/* Liste des paires question/réponse */}
              <div className="space-y-4 pt-2">
                {Object.entries(response.answers).map(([questionId, value]) => {
                  const q = getQuestion(questionId);
                  const qType = q?.type ?? "";
                  return (
                    <div
                      key={questionId}
                      className="rounded-xl border bg-muted/40 p-4 transition-colors hover:border-border"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="text-xs font-semibold text-foreground">
                          {q?.title ?? questionId}
                        </div>
                        {qType && (
                          <span
                            className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${REVIEW_QUESTION_TYPE_BADGES[qType] ??
                              "bg-muted text-muted-foreground"
                              }`}
                          >
                            {REVIEW_QUESTION_TYPE_LABELS[qType] ?? qType}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-foreground">
                        {formatAnswer(value, qType)}
                      </div>
                    </div>
                  );
                })}

                {Object.keys(response.answers).length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Aucune réponse enregistrée dans cette soumission.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Panneau latéral : Gestion de la publication */}
          <div className="space-y-6">
            <div className="space-y-4 rounded-2xl border bg-card p-6">
              <div className="border-b pb-3 font-display font-semibold">
                Statut de publication
              </div>

              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground">
                  Sélectionnez le statut
                </Label>
                <Select
                  value={response.publicationStatus}
                  onValueChange={(v) => handleStatusChange(v as ReviewPublicationStatus)}
                  disabled={updateMutation.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_STATUSES.map((s) => (
                      <SelectItem
                        key={s}
                        value={s}
                        disabled={
                          REQUIRES_PUBLICATION_CONSENT.has(s) &&
                          !response.allowPublication
                        }
                      >
                        {REVIEW_PUBLICATION_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {!response.allowPublication && (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      Le client n'a pas autorisé la publication. Les statuts{" "}
                      <b>"Approuvé"</b> et <b>"Mise en avant"</b> sont désactivés.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}