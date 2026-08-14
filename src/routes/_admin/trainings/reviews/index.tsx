import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Calendar,
  UserRoundPlus,
  GraduationCap,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { usePendingContentReviews, useCreateAdminContentReview } from "@/stores/useContentReviewsStore";
import { getLessonKindIcon, LESSON_KIND_LABELS, getContentCreator } from "@/data/trainingModules";
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
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

interface ReviewTarget {
  type: ContentReviewableType;
  id: string;
  title: string;
}

function AdminContentReviews() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"created_at" | "title" | "updated_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const { paginatedData, groups, isLoading } = usePendingContentReviews({
    query: search.trim() || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
    page,
    per_page: 15,
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

  return (
    <>
      <PageHeader
        title="Soumissions en attente"
        description="Formations regroupant les modules et leçons créés par les instructeurs, en attente de validation."
      />

      {/* Liens de navigation */}
      <div className="flex items-center gap-6 mb-6">
        <Link to="/trainings/catalogs" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <GraduationCap className="h-4 w-4" /> Voir le catalogue des formations
        </Link>
        <Link to="/trainings/registrations" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <UserRoundPlus className="h-4 w-4" /> Voir les inscriptions
        </Link>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une formation, un module, une leçon..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select
            value={sortBy}
            onValueChange={(v: "created_at" | "title" | "updated_at") => {
              setSortBy(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date de création</SelectItem>
              <SelectItem value="title">Titre de la formation</SelectItem>
              <SelectItem value="updated_at">Dernière mise à jour</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={sortOrder}
            onValueChange={(v: "asc" | "desc") => {
              setSortOrder(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Ordre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descendant (Plus récent)</SelectItem>
              <SelectItem value="asc">Ascendant (Plus ancien)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement des révisions...
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">
          Aucune soumission en attente ne correspond à vos critères.
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => {
            const { training, modules } = group;
            return (
              <div key={training.id} className="rounded-2xl border bg-card overflow-hidden shadow-sm">
                {/* En-tête de la Formation */}
                <div
                  className="p-5 border-b flex flex-wrap items-center justify-between gap-4"
                  style={{ borderLeft: training.coverColor ? `6px solid ${training.coverColor}` : undefined }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <Link
                        to="/trainings/manage/$id"
                        params={{ id: training.id }}
                        className="font-bold text-lg hover:underline"
                      >
                        {training.title}
                      </Link>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>Niveau : <strong className="text-foreground">{training.level}</strong></span>
                      <span>Statut : <strong className="text-foreground">{training.status}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Modules de la Formation */}
                <div className="p-5 space-y-6 bg-muted/20">
                  {modules.map((m) => {
                    const moduleCreator = getContentCreator(m.createdByAdmin, m.createdByInstructor);
                    return (
                      <div key={m.id} className="rounded-xl border bg-background p-4 space-y-4">
                        {/* Information du Module */}
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 font-semibold text-base">
                              <Layers className="h-4 w-4 text-primary shrink-0" />
                              <span>{m.title}</span>
                            </div>
                            {m.description && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{m.description}</p>}
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                              {moduleCreator && <span>Soumis par {moduleCreator.label}</span>}
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
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approuver le module
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

                        {/* Leçons associées à ce module */}
                        {m.lessons.length > 0 && (
                          <div className="pl-4 border-l-2 border-primary/20 space-y-2">
                            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5" /> Leçons en attente dans ce module ({m.lessons.length})
                            </div>
                            {m.lessons.map((l) => {
                              const Icon = getLessonKindIcon(l.kind);
                              const lessonCreator = getContentCreator(l.createdByAdmin, l.createdByInstructor);
                              return (
                                <div key={l.id} className="rounded-lg border bg-card p-3 flex flex-wrap items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 font-medium text-sm">
                                      <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                                      <span>{l.title}</span>
                                    </div>
                                    {l.brief && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{l.brief}</p>}
                                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                                      <span>{LESSON_KIND_LABELS[l.kind as keyof typeof LESSON_KIND_LABELS] ?? l.kind}</span>
                                      {l.durationMinutes != null && (
                                        <span className="inline-flex items-center gap-1">
                                          <Clock className="h-3 w-3" /> {l.durationMinutes} min
                                        </span>
                                      )}
                                      {lessonCreator && <span>Auteur : {lessonCreator.label}</span>}
                                      <span className="inline-flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> {formatDate(l.createdAt)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex shrink-0 gap-2">
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => openReview({ type: "lesson", id: l.id, title: l.title }, "approved")}
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approuver
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-destructive hover:bg-destructive/10"
                                      onClick={() => openReview({ type: "lesson", id: l.id, title: l.title }, "rejected")}
                                    >
                                      <XCircle className="h-3.5 w-3.5 mr-1" /> Rejeter
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {paginatedData && paginatedData.last_page > 1 && (
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Affichage de {paginatedData.from ?? 0} à {paginatedData.to ?? 0} sur {paginatedData.total} formations
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!paginatedData.prev_page_url}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
                </Button>
                <span className="text-sm font-medium">
                  Page {paginatedData.current_page} sur {paginatedData.last_page}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!paginatedData.next_page_url}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal d'approbation / rejet */}
      <Dialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialog.decision === "approved" ? "Approuver" : "Rejeter"} "{dialog.target?.title}"
            </DialogTitle>
            <DialogDescription>
              {dialog.decision === "approved"
                ? "Ce contenu sera validé et son statut mis à jour."
                : "Ce contenu sera rejeté et renvoyé pour révision."}
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
            <Button variant="outline" onClick={() => setDialog({ open: false })}>
              Annuler
            </Button>
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