import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, Rocket, Ban, Copy, BarChart3, CheckCircle } from "lucide-react";
import { AdminShell, ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useAdminReviewFormDetail,
  useUpdateAdminReviewForm,
  useDeleteAdminReviewForm,
  usePublishAdminReviewForm,
  useDisableAdminReviewForm,
  useDuplicateAdminReviewForm,
  useAdminReviewFormAnalytics,
} from "@/stores/userReviewFormsStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import {
  type AdminReviewFormPayload,
  REVIEW_FORM_STATUS_BADGES,
  REVIEW_FORM_STATUS_LABELS,
  REVIEW_QUESTION_TYPE_LABELS,
  REVIEW_QUESTION_TYPE_BADGES,
} from "@/data/reviewsForms";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/reviews/forms/$id")({
  head: () => ({
    meta: [
      { title: `Formulaire d'avis | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReviewFormDetail,
});

function ReviewFormDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: reviewForm, isLoading } = useAdminReviewFormDetail(id);
  const { items: categories } = useAdminCategoriesList({ perPage: 100 });
  const { analytics } = useAdminReviewFormAnalytics(id);
  const updateMutation = useUpdateAdminReviewForm();
  const removeMutation = useDeleteAdminReviewForm();
  const publishMutation = usePublishAdminReviewForm();
  const disableMutation = useDisableAdminReviewForm();
  const duplicateMutation = useDuplicateAdminReviewForm();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminReviewFormPayload | null>(null);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    if (reviewForm && !form) {
      setForm({
        title: reviewForm.title,
        description: reviewForm.description,
        category_id: reviewForm.categoryId ?? "",
        expires_at: reviewForm.expiresAt ?? "",
        max_responses: reviewForm.maxResponses ?? undefined,
        allow_response_edit: reviewForm.allowResponseEdit,
      });
    }
  }, [reviewForm, form]);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement...
        </div>
      </AdminShell>
    );
  }

  if (!reviewForm || !form) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/reviews/forms" })}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Formulaire introuvable.</p>
      </AdminShell>
    );
  }

  const isDraft = reviewForm.status === "draft";
  const isPublished = reviewForm.status === "published";
  const isDisabled = reviewForm.status === "disabled";

  const categoryObj = categories.find(
    (c) => c.id === reviewForm.categoryId || c.name === reviewForm.category
  );

  const handleSave = () => {
    const payload: AdminReviewFormPayload = {
      ...form,
      category_id: form.category_id || undefined,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : undefined,
    };
    updateMutation.mutate(
      { id: reviewForm.id, payload },
      {
        onSuccess: () => {
          toast.success("Formulaire modifié");
          setIsEditing(false);
        },
        onError: () => toast.error("Erreur lors de la modification"),
      }
    );
  };

  const handleCancel = () => {
    setForm({
      title: reviewForm.title,
      description: reviewForm.description,
      category_id: reviewForm.categoryId ?? "",
      expires_at: reviewForm.expiresAt ?? "",
      max_responses: reviewForm.maxResponses ?? undefined,
      allow_response_edit: reviewForm.allowResponseEdit,
    });
    setIsEditing(false);
  };

  const handlePublish = () => {
    publishMutation.mutate(reviewForm.id, {
      onSuccess: () => toast.success(isDisabled ? "Formulaire réactivé" : "Formulaire publié"),
      onError: () => toast.error("Erreur lors de la publication"),
    });
  };

  const handleDisable = () => {
    disableMutation.mutate(reviewForm.id, {
      onSuccess: () => toast.success("Formulaire désactivé"),
      onError: () => toast.error("Erreur lors de la désactivation"),
    });
  };

  const handleDuplicate = () => {
    duplicateMutation.mutate(reviewForm.id, {
      onSuccess: (dup) => {
        toast.success("Formulaire dupliqué");
        navigate({ to: "/admin/reviews/forms/$id", params: { id: dup.id } });
      },
      onError: () => toast.error("Erreur lors de la duplication"),
    });
  };

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/reviews/forms" })}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour
        </Button>
        <div className="flex flex-wrap gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="mr-1 h-4 w-4" /> Annuler
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="mr-1 h-4 w-4" /> Enregistrer
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-1 h-4 w-4" /> Modifier
              </Button>
              {isDraft && (
                <Button size="sm" onClick={handlePublish} disabled={publishMutation.isPending}>
                  <Rocket className="mr-1 h-4 w-4" /> Publier
                </Button>
              )}
              {isPublished && (
                <Button variant="outline" size="sm" onClick={handleDisable} disabled={disableMutation.isPending}>
                  <Ban className="mr-1 h-4 w-4" /> Désactiver
                </Button>
              )}
              {isDisabled && (
                <Button size="sm" onClick={handlePublish} disabled={publishMutation.isPending}>
                  <CheckCircle className="mr-1 h-4 w-4" /> Activer
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={duplicateMutation.isPending}>
                <Copy className="mr-1 h-4 w-4" /> Dupliquer
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setToDelete(true)}>
                <Trash2 className="mr-1 h-4 w-4" /> Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${REVIEW_FORM_STATUS_BADGES[reviewForm.status] ?? "bg-muted text-muted-foreground"}`}>
            {REVIEW_FORM_STATUS_LABELS[reviewForm.status] ?? reviewForm.status}
          </span>
          {reviewForm.category && (
            <span className={`rounded-full px-2 py-0.5 font-medium ${categoryObj?.colorClass ?? "bg-muted text-muted-foreground"}`}>
              {reviewForm.category}
            </span>
          )}
          <span className="rounded-full bg-muted px-2 py-0.5">Par {reviewForm.createdBy}</span>
          <span className="rounded-full bg-muted px-2 py-0.5">{reviewForm.responsesCount} réponse{reviewForm.responsesCount > 1 ? "s" : ""}{reviewForm.maxResponses ? ` / ${reviewForm.maxResponses}` : ""}</span>
        </div>

        {isEditing ? (
          <div className="space-y-4 rounded-2xl border bg-card p-6">
            <div>
              <Label>Titre</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Catégorie</Label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— Aucune —</option>
                  {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <Label>Expire le</Label>
                <Input
                  type="datetime-local"
                  value={form.expires_at ? form.expires_at.slice(0, 16) : ""}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                />
              </div>
              <div>
                <Label>Nombre max. de réponses</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.max_responses ?? ""}
                  onChange={(e) => setForm({ ...form, max_responses: e.target.value === "" ? undefined : Number(e.target.value) })}
                />
              </div>
              <div className="flex items-end gap-3">
                <Label className="mb-2">Réponses modifiables</Label>
                <Switch checked={form.allow_response_edit} onCheckedChange={(v) => setForm({ ...form, allow_response_edit: v })} />
              </div>
            </div>
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold">{reviewForm.title}</h1>
            <p className="text-muted-foreground">{reviewForm.description}</p>
          </>
        )}

        {!isEditing && (
          <div className="rounded-2xl border bg-card p-6">
            <div className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
              <BarChart3 className="h-5 w-5 text-primary" /> Analyses
            </div>
            {analytics ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">{analytics.totalResponses} réponse{analytics.totalResponses > 1 ? "s" : ""} au total</div>
                <div className="divide-y rounded-lg border">
                  {analytics.questions.map((q) => (
                    <div key={q.questionId} className="flex items-center justify-between p-3 text-sm">
                      <div>
                        <div className="font-medium">{q.title}</div>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${REVIEW_QUESTION_TYPE_BADGES[q.type] ?? "bg-muted text-muted-foreground"}`}>
                          {REVIEW_QUESTION_TYPE_LABELS[q.type] ?? q.type}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-primary">{q.responses}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Chargement des analyses...</div>
            )}
          </div>
        )}

        {!isEditing && (
          <div className="rounded-2xl border bg-card p-6">
            <div className="mb-4 font-display text-lg font-semibold">Questions</div>
            {reviewForm.questions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune question pour le moment.</p>
            ) : (
              <div className="space-y-2">
                {[...reviewForm.questions].sort((a, b) => a.order - b.order).map((q) => (
                  <div key={q.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{q.title}{q.isRequired && <span className="ml-1 text-destructive">*</span>}</div>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${REVIEW_QUESTION_TYPE_BADGES[q.type] ?? "bg-muted text-muted-foreground"}`}>
                        {REVIEW_QUESTION_TYPE_LABELS[q.type] ?? q.type}
                      </span>
                    </div>
                    {q.description && <div className="mt-1 text-xs text-muted-foreground">{q.description}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(reviewForm.id, {
            onSuccess: () => { toast.success("Formulaire supprimé"); navigate({ to: "/admin/reviews/forms" }); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${reviewForm.title}" ?`}
      />
    </AdminShell>
  );
}
