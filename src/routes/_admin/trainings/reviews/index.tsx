import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Clock, ListChecks, BookOpen, Calendar, UserRoundPlus, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { usePendingContentReviews, useCreateAdminContentReview } from "@/stores/useContentReviewsStore";
import { getLessonKindIcon, LESSON_KIND_LABELS, getContentCreator } from "@/data/trainingModules";
import type { APIAdminTrainingModule, APIAdminLesson } from "@/data/trainingModules";
import type { ContentReviewableType, ContentReviewDecision } from "@/data/contentReviews";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/trainings/reviews/")({
  head: () => ({
    meta: [
      { title: `Soumissions en attente | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminContentReviews,
});

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

interface ReviewTarget {
  type: ContentReviewableType;
  id: string;
  title: string;
}

function AdminContentReviews() {
  const { modules, lessons, isLoading } = usePendingContentReviews();
  const reviewMutation = useCreateAdminContentReview();

  const [dialog, setDialog] = useState<{ open: boolean; target?: ReviewTarget; decision?: ContentReviewDecision }>({ open: false });
  const [comment, setComment] = useState("");

  const openReview = (target: ReviewTarget, decision: ContentReviewDecision) => {
    setComment("");
    setDialog({ open: true, target, decision });
  };

  const submitReview = () => {
    if (!dialog.target || !dialog.decision) return;
    reviewMutation.mutate(
      {
        reviewable_type: dialog.target.type,
        reviewable_id: dialog.target.id,
        decision: dialog.decision,
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(dialog.decision === "approved" ? "Contenu approuvé" : "Contenu rejeté");
          setDialog({ open: false });
        },
        onError: () => toast.error("Erreur lors de l'enregistrement de la décision"),
      }
    );
  };

  const totalPending = modules.length + lessons.length;

  return (
    <>
      <PageHeader
        title="Soumissions en attente"
        description="Modules et leçons créés par les instructeurs, en attente de validation."
      />

      {/* Raccourci */}
      <div className="flex items-center gap-6 mb-4">
        <div>
          <Link to="/trainings/catalogs"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
            <GraduationCap className="h-4 w-4"
            />
            Voir le catalogue des formations
          </Link>
        </div>
        <div>
          <Link to="/trainings/registrations"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
            <UserRoundPlus className="h-4 w-4"
            />
            Voir les inscriptions
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      ) : totalPending === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          Aucune soumission en attente pour le moment.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Modules en attente */}
          {modules.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2 font-semibold">
                <BookOpen className="h-4 w-4 text-primary" /> Modules ({modules.length})
              </div>
              <div className="space-y-2">
                {modules.map((m: APIAdminTrainingModule) => {
                  const creator = getContentCreator(m.createdByAdmin, m.createdByInstructor);
                  return (
                    <div key={m.id} className="rounded-xl border bg-card p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <Link
                            to="/trainings/manage/$id"
                            params={{ id: m.trainingId }}
                            className="font-medium text-primary hover:underline"
                          >
                            {m.title}
                          </Link>
                          {m.description && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{m.description}</p>}
                          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                            <span>{m.lessonsCount} leçon{m.lessonsCount !== 1 ? "s" : ""}</span>
                            {creator && <span>Soumis par {creator.label}</span>}
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {formatDate(m.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button
                            size="sm"
                            onClick={() => openReview({ type: "module", id: m.id, title: m.title }, "approved")}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => openReview({ type: "module", id: m.id, title: m.title }, "rejected")}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Rejeter
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Leçons en attente */}
          {lessons.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2 font-semibold">
                <ListChecks className="h-4 w-4 text-primary" /> Leçons ({lessons.length})
              </div>
              <div className="space-y-2">
                {lessons.map((l: APIAdminLesson) => {
                  const Icon = getLessonKindIcon(l.kind);
                  const creator = getContentCreator(l.createdByAdmin, l.createdByInstructor);
                  return (
                    <div key={l.id} className="rounded-xl border bg-card p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <Icon className="h-3.5 w-3.5 text-primary" />
                            <span className="font-medium">{l.title}</span>
                          </div>
                          {l.brief && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{l.brief}</p>}
                          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                            <span>{LESSON_KIND_LABELS[l.kind] ?? l.kind}</span>
                            {l.durationMinutes != null && (
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {l.durationMinutes} min
                              </span>
                            )}
                            {creator && <span>Soumise par {creator.label}</span>}
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {formatDate(l.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button
                            size="sm"
                            onClick={() => openReview({ type: "lesson", id: l.id, title: l.title }, "approved")}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => openReview({ type: "lesson", id: l.id, title: l.title }, "rejected")}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Rejeter
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialog.decision === "approved" ? "Approuver" : "Rejeter"} "{dialog.target?.title}"
            </DialogTitle>
            <DialogDescription>
              {dialog.decision === "approved"
                ? "Ce contenu sera marqué comme publié et visible."
                : "Ce contenu sera rejeté ; l'auteur pourra le corriger et le resoumettre."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Commentaire (optionnel)</Label>
              <Textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Précisez votre décision..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Annuler</Button>
            <Button
              variant={dialog.decision === "rejected" ? "destructive" : "default"}
              onClick={submitReview}
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}