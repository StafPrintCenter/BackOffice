import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Clock, Calendar, UserRoundPlus, GraduationCap, Search, ChevronLeft, ChevronRight, ShieldCheck, ShieldOff, ArrowUpDown, FolderKanban, ExternalLink, Timer, Award, FileQuestion } from "lucide-react";
import { PageHeader } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { usePendingContentReviews, useCreateAdminContentReview } from "@/stores/useContentReviewsStore";
import { getLessonKindIcon, LESSON_KIND_LABELS, getContentCreator, getContentStatusBadgeClass, getContentStatusLabel } from "@/data/trainingModules";
import { getTrainingLevelBadgeClass, getTrainingStatusBadgeClass, getTrainingStatusLabel } from "@/data/trainings";
import type { PendingReviewModule, PendingReviewLesson, PendingReviewsParams } from "@/data/contentReviews";
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

const SORT_BY_LABELS: Record<NonNullable<PendingReviewsParams["sort_by"]>, string> = {
  created_at: "Date de création",
  title: "Titre",
  updated_at: "Dernière modification",
};

function AdminContentReviews() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<NonNullable<PendingReviewsParams["sort_by"]>>("created_at");
  const [sortOrder, setSortOrder] = useState<NonNullable<PendingReviewsParams["sort_order"]>>("desc");
  const [page, setPage] = useState(1);

  const { trainingGroups, meta, isLoading } = usePendingContentReviews({
    query: search || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
    per_page: 15,
    page,
  });
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

  const toggleSortOrder = () => setSortOrder((o) => (o === "asc" ? "desc" : "asc"));

  const totalModules = trainingGroups.reduce((acc, g) => acc + g.modules.length, 0);
  const totalLessons = trainingGroups.reduce(
    (acc, g) => acc + g.modules.reduce((lacc, m) => lacc + m.lessons.length, 0),
    0
  );
  const totalQuizzes = trainingGroups.reduce(
    (acc, g) =>
      acc +
      g.modules.reduce(
        (macc, m) =>
          macc +
          m.lessons.reduce((lacc, l) => lacc + (l.quiz && l.quiz.status === "pending_review" ? 1 : 0), 0),
        0
      ),
    0
  );

  return (
    <>
      <PageHeader
        title="Soumissions en attente"
        description="Modules, leçons et quiz créés par les instructeurs en attente de validation, groupés par formation."
      />

      {/* Raccourcis */}
      <div className="flex items-center gap-6 mb-4">
        <Link to="/trainings/catalogs" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <GraduationCap className="h-4 w-4" /> Voir le catalogue des formations
        </Link>
        <Link to="/trainings/registrations" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <UserRoundPlus className="h-4 w-4" /> Voir les inscriptions
        </Link>
      </div>

      {/* Recherche + tri */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1 min-w-50">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Rechercher une formation, un module, une leçon ou un quiz..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <Select value={sortBy} onValueChange={(v) => { setSortBy(v as NonNullable<PendingReviewsParams["sort_by"]>); setPage(1); }}>
          <SelectTrigger className="w-50"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_BY_LABELS).map(([k, l]) => (<SelectItem key={k} value={k}>{l}</SelectItem>))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={() => { toggleSortOrder(); setPage(1); }}>
          <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
          {sortOrder === "asc" ? "Croissant" : "Décroissant"}
        </Button>

        {meta && (
          <span className="ml-auto text-xs text-muted-foreground shrink-0">
            {totalModules} module{totalModules !== 1 ? "s" : ""} · {totalLessons} leçon{totalLessons !== 1 ? "s" : ""} · {totalQuizzes} quiz en attente sur {meta.total} formation{meta.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      ) : trainingGroups.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-muted-foreground">
          Aucune soumission en attente pour le moment.
        </div>
      ) : (
        <div className="space-y-6">
          {trainingGroups.map((group) => (
            <div
              key={group.training.id}
              className="rounded-2xl border bg-card overflow-hidden border-l-4"
              style={{ borderLeftColor: group.training.coverColor ?? undefined }}
            >
              {/* En-tête formation */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/20 p-4">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <Link
                      to="/trainings/catalogs/$id/manage"
                      params={{ id: group.training.id }}
                      className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline group"
                    >
                      <span>{group.training.title}</span>
                      <ExternalLink className="h-3.5 w-3.5 opacity-70 transition-opacity group-hover:opacity-100 shrink-0" />
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-medium ${getTrainingLevelBadgeClass(group.training.level)}`}>
                        {group.training.level}
                      </span>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-medium ${getTrainingStatusBadgeClass(group.training.status)}`}>
                        {getTrainingStatusLabel(group.training.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {group.modules.length} module{group.modules.length !== 1 ? "s" : ""} dans cette section
                </span>
              </div>

              {/* Modules de cette formation */}
              <div className="divide-y">
                {group.modules.map((m: PendingReviewModule) => (
                  <div key={m.id} className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <FolderKanban className="h-4 w-4 shrink-0 text-primary" />
                          <span className="font-semibold">{m.title}</span>
                          <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getContentStatusBadgeClass(m.status)}`}>
                            {getContentStatusLabel(m.status)}
                          </span>
                          <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${m.isEnabled ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                            {m.isEnabled ? <ShieldCheck className="h-2.5 w-2.5" /> : <ShieldOff className="h-2.5 w-2.5" />}
                            {m.isEnabled ? "Activé" : "Désactivé"}
                          </span>
                        </div>
                        {m.description && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 pl-6">{m.description}</p>}
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pl-6">
                          <span>{m.lessons.length} leçon{m.lessons.length !== 1 ? "s" : ""} · Ordre {m.sortOrder}</span>
                          {(() => {
                            const creator = getContentCreator(m.createdByAdmin, m.createdByInstructor);
                            return creator && <span>Soumis par {creator.label} ({creator.role === "admin" ? "Admin" : "Instructeur"})</span>;
                          })()}
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {formatDate(m.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Boutons d'action : uniquement si status === 'pending_review' */}
                      {m.status === "pending_review" && (
                        <div className="flex shrink-0 gap-2">
                          <Button size="sm" onClick={() => openReview({ type: "module", id: m.id, title: m.title }, "approved")}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approuver Module
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => openReview({ type: "module", id: m.id, title: m.title }, "rejected")}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" /> Rejeter Module
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Leçons du module */}
                    {m.lessons.length > 0 && (
                      <div className="mt-3 space-y-3 border-l-2 border-primary/20 pl-4 ml-2">
                        {m.lessons.map((l: PendingReviewLesson) => {
                          const LessonIcon = getLessonKindIcon(l.kind);
                          const creator = getContentCreator(l.createdByAdmin, l.createdByInstructor);
                          const q = l.quiz;
                          const qCreator = q ? getContentCreator(q.createdByAdmin, q.createdByInstructor) : null;

                          return (
                            <div key={l.id} className="rounded-lg border bg-muted/10 p-3 space-y-2">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1 rounded bg-background border text-primary shrink-0">
                                      <LessonIcon className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="text-sm font-medium">{l.title}</span>
                                    {l.isMandatory && <span className="text-destructive text-xs font-bold" title="Obligatoire">*</span>}
                                    <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getContentStatusBadgeClass(l.status)}`}>
                                      {getContentStatusLabel(l.status)}
                                    </span>
                                  </div>
                                  {l.brief && <p className="mt-1 text-xs text-muted-foreground line-clamp-2 pl-7">{l.brief}</p>}
                                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pl-7">
                                    <span className="font-medium text-foreground/80">{LESSON_KIND_LABELS[l.kind] ?? l.kind}</span>
                                    <span>· Ordre {l.sortOrder}</span>
                                    {l.durationMinutes != null && (
                                      <span className="inline-flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {l.durationMinutes} min
                                      </span>
                                    )}
                                    {creator && <span>Soumise par {creator.label} ({creator.role === "admin" ? "Admin" : "Instructeur"})</span>}
                                    <span className="inline-flex items-center gap-1">
                                      <Calendar className="h-3 w-3" /> {formatDate(l.createdAt)}
                                    </span>
                                  </div>
                                </div>

                                {/* Boutons pour la leçon uniquement si status === 'pending_review' */}
                                {l.status === "pending_review" && (
                                  <div className="flex shrink-0 gap-2">
                                    <Button size="sm" onClick={() => openReview({ type: "lesson", id: l.id, title: l.title }, "approved")}>
                                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approuver Leçon
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-destructive hover:bg-destructive/10"
                                      onClick={() => openReview({ type: "lesson", id: l.id, title: l.title }, "rejected")}
                                    >
                                      <XCircle className="h-3.5 w-3.5 mr-1" /> Rejeter Leçon
                                    </Button>
                                  </div>
                                )}
                              </div>

                              {/* Affichage du Quiz attaché s'il existe */}
                              {q && (
                                <div className="mt-2 ml-6 rounded-md border border-amber-500/30 bg-amber-500/5 p-2.5">
                                  <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <FileQuestion className="h-4 w-4 text-amber-600 shrink-0" />
                                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                                          Quiz associé ({q.mode})
                                        </span>
                                        <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getContentStatusBadgeClass(q.status)}`}>
                                          {getContentStatusLabel(q.status)}
                                        </span>
                                      </div>
                                      <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pl-6">
                                        {q.timeLimitSec != null && (
                                          <span className="inline-flex items-center gap-1">
                                            <Timer className="h-3 w-3" /> {Math.round(q.timeLimitSec / 60)} min
                                          </span>
                                        )}
                                        {q.passScore != null && (
                                          <span className="inline-flex items-center gap-1">
                                            <Award className="h-3 w-3" /> Score requis : {q.passScore}%
                                          </span>
                                        )}
                                        {q.maxAttempts != null && <span>{q.maxAttempts} tentative(s) max</span>}
                                        {qCreator && <span>Créé par {qCreator.label}</span>}
                                        <span className="inline-flex items-center gap-1">
                                          <Calendar className="h-3 w-3" /> {formatDate(q.createdAt)}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Boutons d'action pour le Quiz uniquement si q.status === 'pending_review' */}
                                    {q.status === "pending_review" && (
                                      <div className="flex shrink-0 gap-1.5">
                                        <Button
                                          size="sm"
                                          className="bg-amber-600 hover:bg-amber-700 text-white"
                                          onClick={() => openReview({ type: "quiz", id: q.id, title: `Quiz de ${l.title}` }, "approved")}
                                        >
                                          <CheckCircle2 className="h-3 w-3 mr-1" /> Approuver Quiz
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-destructive hover:bg-destructive/10 border-amber-500/30"
                                          onClick={() => openReview({ type: "quiz", id: q.id, title: `Quiz de ${l.title}` }, "rejected")}
                                        >
                                          <XCircle className="h-3 w-3 mr-1" /> Rejeter Quiz
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {meta && meta.lastPage > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <span className="text-xs text-muted-foreground">
                {meta.from}–{meta.to} sur {meta.total}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.currentPage >= meta.lastPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialogue de validation/rejet */}
      <Dialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialog.decision === "approved" ? "Approuver" : "Rejeter"} "{dialog.target?.title}"
            </DialogTitle>
            <DialogDescription>
              {dialog.decision === "approved"
                ? "Ce contenu sera marqué comme publié et disponible."
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