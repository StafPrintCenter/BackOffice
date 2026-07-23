import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, Rocket, Ban, Copy, BarChart3, CheckCircle, Plus, ArrowUp, ArrowDown, GripVertical, } from "lucide-react";
import { AdminShell, ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAdminReviewFormDetail, useUpdateAdminReviewForm, useDeleteAdminReviewForm, usePublishAdminReviewForm, useDisableAdminReviewForm, useDuplicateAdminReviewForm, useAdminReviewFormAnalytics, } from "@/stores/useReviewFormsStore";
import { useCreateAdminReviewQuestion, useUpdateAdminReviewQuestion, useDeleteAdminReviewQuestion, useReorderAdminReviewQuestions, } from "@/stores/useReviewQuestionsStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import {
  type AdminReviewFormPayload, type AdminReviewFormQuestion, type AdminReviewQuestionPayload, type ReviewQuestionType,
  REVIEW_QUESTION_TYPES, CHOICE_QUESTION_TYPES, REVIEW_FORM_STATUS_LABELS, REVIEW_QUESTION_TYPE_LABELS, getReviewFormStatusBadge, getReviewQuestionTypeBadge,
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

interface QuestionOptionRow {
  label: string;
  value: string;
}

interface QuestionFormValues {
  type: ReviewQuestionType;
  title: string;
  description: string;
  is_required: boolean;
  maxLength: string;
  min: string;
  max: string;
  maxSizeKb: string;
  options: QuestionOptionRow[];
}

const emptyQuestionForm: QuestionFormValues = {
  type: "short_text",
  title: "",
  description: "",
  is_required: false,
  maxLength: "",
  min: "",
  max: "",
  maxSizeKb: "",
  options: [],
};

function slugifyOptionValue(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

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

  const createQuestionMutation = useCreateAdminReviewQuestion();
  const updateQuestionMutation = useUpdateAdminReviewQuestion();
  const deleteQuestionMutation = useDeleteAdminReviewQuestion();
  const reorderQuestionsMutation = useReorderAdminReviewQuestions();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminReviewFormPayload | null>(null);
  const [toDelete, setToDelete] = useState(false);

  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AdminReviewFormQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionFormValues>(emptyQuestionForm);
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});
  const [questionToDelete, setQuestionToDelete] = useState<AdminReviewFormQuestion | null>(null);

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

  const sortedQuestions = [...reviewForm.questions].sort((a, b) => a.order - b.order);

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

  /* ---- Gestion des questions ---- */

  const openCreateQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm(emptyQuestionForm);
    setQuestionErrors({});
    setQuestionDialogOpen(true);
  };

  const openEditQuestion = (q: AdminReviewFormQuestion) => {
    const rules = q.validationRules ?? {};
    const settings = q.settings ?? {};
    const options = q.options ?? [];
    setEditingQuestion(q);
    setQuestionForm({
      type: q.type as ReviewQuestionType,
      title: q.title,
      description: q.description ?? "",
      is_required: q.isRequired,
      maxLength: rules.max_length != null ? String(rules.max_length) : "",
      min: rules.min != null ? String(rules.min) : "",
      max: rules.max != null ? String(rules.max) : "",
      maxSizeKb: settings.max_size_kb != null ? String(settings.max_size_kb) : "",
      options: options.map((o) => ({ label: o.label ?? "", value: o.value ?? "" })),
    });
    setQuestionErrors({});
    setQuestionDialogOpen(true);
  };

  const addOptionRow = () => setQuestionForm({ ...questionForm, options: [...questionForm.options, { label: "", value: "" }] });
  const removeOptionRow = (index: number) => setQuestionForm({ ...questionForm, options: questionForm.options.filter((_, i) => i !== index) });
  const updateOptionRow = (index: number, patch: Partial<QuestionOptionRow>) => {
    const next = [...questionForm.options];
    const current = { ...next[index], ...patch };
    // Auto-génère la valeur technique à partir du libellé si l'éditeur ne l'a pas saisie manuellement.
    if (patch.label !== undefined && (next[index].value === "" || next[index].value === slugifyOptionValue(next[index].label))) {
      current.value = slugifyOptionValue(current.label);
    }
    next[index] = current;
    setQuestionForm({ ...questionForm, options: next });
  };

  const submitQuestion = () => {
    const errs: Record<string, string> = {};
    if (questionForm.title.trim().length < 2) errs.title = "Le titre est requis.";

    const isChoiceType = CHOICE_QUESTION_TYPES.includes(questionForm.type);
    const cleanOptions = questionForm.options
      .map((o) => ({ label: o.label.trim(), value: o.value.trim() || slugifyOptionValue(o.label) }))
      .filter((o) => o.label.length > 0);

    if (isChoiceType && cleanOptions.length < 2) {
      errs.options = "Ajoutez au moins deux options.";
    }

    if (questionForm.type === "number" && questionForm.min !== "" && questionForm.max !== "" && Number(questionForm.min) > Number(questionForm.max)) {
      errs.max = "Le maximum doit être supérieur au minimum.";
    }

    if (Object.keys(errs).length > 0) {
      setQuestionErrors(errs);
      return;
    }

    let validationRules: string | undefined;
    if (questionForm.type === "short_text" || questionForm.type === "long_text") {
      if (questionForm.maxLength !== "") validationRules = JSON.stringify({ max_length: Number(questionForm.maxLength) });
    } else if (questionForm.type === "number") {
      const rules: Record<string, number> = {};
      if (questionForm.min !== "") rules.min = Number(questionForm.min);
      if (questionForm.max !== "") rules.max = Number(questionForm.max);
      if (Object.keys(rules).length > 0) validationRules = JSON.stringify(rules);
    }

    const settings = questionForm.type === "file" && questionForm.maxSizeKb !== ""
      ? JSON.stringify({ max_size_kb: Number(questionForm.maxSizeKb) })
      : undefined;

    const options = isChoiceType ? JSON.stringify(cleanOptions) : undefined;

    const payload: AdminReviewQuestionPayload = {
      type: questionForm.type,
      title: questionForm.title.trim(),
      description: questionForm.description.trim() || undefined,
      order: editingQuestion ? editingQuestion.order : sortedQuestions.length,
      is_required: questionForm.is_required,
      validation_rules: validationRules,
      options,
      settings,
    };

    if (editingQuestion) {
      updateQuestionMutation.mutate({ questionId: editingQuestion.id, payload }, {
        onSuccess: () => { toast.success("Question modifiée"); setQuestionDialogOpen(false); },
        onError: () => toast.error("Erreur lors de la modification de la question"),
      });
    } else {
      createQuestionMutation.mutate({ formId: reviewForm.id, payload }, {
        onSuccess: () => { toast.success("Question ajoutée"); setQuestionDialogOpen(false); },
        onError: () => toast.error("Erreur lors de l'ajout de la question"),
      });
    }
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sortedQuestions.length) return;
    const reordered = [...sortedQuestions];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    reorderQuestionsMutation.mutate(
      {
        formId: reviewForm.id,
        orderedItems: reordered.map((q, i) => ({ id: q.id, order: i })),
      },
      { onError: () => toast.error("Erreur lors de la réorganisation") }
    );
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
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getReviewFormStatusBadge(reviewForm.status)}`}>
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
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getReviewQuestionTypeBadge(q.type)}`}>
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
            <div className="mb-4 flex items-center justify-between">
              <div className="font-display text-lg font-semibold">Questions</div>
              <Button size="sm" variant="outline" onClick={openCreateQuestion}>
                <Plus className="mr-1 h-4 w-4" /> Ajouter une question
              </Button>
            </div>
            {sortedQuestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune question pour le moment.</p>
            ) : (
              <div className="space-y-2">
                {sortedQuestions.map((q, index) => (
                  <div key={q.id} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                    <div className="flex flex-col text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => moveQuestion(index, -1)}
                        disabled={index === 0 || reorderQuestionsMutation.isPending}
                        className="disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <GripVertical className="h-3.5 w-3.5" />
                      <button
                        type="button"
                        onClick={() => moveQuestion(index, 1)}
                        disabled={index === sortedQuestions.length - 1 || reorderQuestionsMutation.isPending}
                        className="disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{q.title}{q.isRequired && <span className="ml-1 text-destructive">*</span>}</span>
                        <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${getReviewQuestionTypeBadge(q.type)}`}>
                          {REVIEW_QUESTION_TYPE_LABELS[q.type] ?? q.type}
                        </span>
                      </div>
                      {q.description && <div className="mt-0.5 text-xs text-muted-foreground truncate">{q.description}</div>}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditQuestion(q)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setQuestionToDelete(q)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingQuestion ? "Modifier la question" : "Nouvelle question"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Type de question</Label>
                <select
                  value={questionForm.type}
                  onChange={(e) => setQuestionForm({ ...questionForm, type: e.target.value as ReviewQuestionType })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {REVIEW_QUESTION_TYPES.map((t) => (<option key={t} value={t}>{REVIEW_QUESTION_TYPE_LABELS[t]}</option>))}
                </select>
              </div>
              <div className="flex items-end gap-3">
                <Label className="mb-2">Réponse obligatoire</Label>
                <Switch checked={questionForm.is_required} onCheckedChange={(v) => setQuestionForm({ ...questionForm, is_required: v })} />
              </div>
            </div>

            <div>
              <Label>Titre de la question</Label>
              <Input value={questionForm.title} onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })} placeholder="Ex : Votre nom complet" />
              {questionErrors.title && <p className="text-xs text-destructive mt-1">{questionErrors.title}</p>}
            </div>
            <div>
              <Label>Texte d'aide (optionnel)</Label>
              <Input value={questionForm.description} onChange={(e) => setQuestionForm({ ...questionForm, description: e.target.value })} placeholder="Aide affichée sous la question" />
            </div>

            {(questionForm.type === "short_text" || questionForm.type === "long_text") && (
              <div>
                <Label>Nombre maximum de caractères (optionnel)</Label>
                <Input
                  type="number"
                  min={1}
                  value={questionForm.maxLength}
                  onChange={(e) => setQuestionForm({ ...questionForm, maxLength: e.target.value })}
                  placeholder={questionForm.type === "short_text" ? "Ex : 100" : "Ex : 2000"}
                />
              </div>
            )}

            {questionForm.type === "number" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Valeur minimum (optionnel)</Label>
                  <Input type="number" value={questionForm.min} onChange={(e) => setQuestionForm({ ...questionForm, min: e.target.value })} />
                </div>
                <div>
                  <Label>Valeur maximum (optionnel)</Label>
                  <Input type="number" value={questionForm.max} onChange={(e) => setQuestionForm({ ...questionForm, max: e.target.value })} />
                  {questionErrors.max && <p className="text-xs text-destructive mt-1">{questionErrors.max}</p>}
                </div>
              </div>
            )}

            {questionForm.type === "file" && (
              <div>
                <Label>Taille maximale du fichier (en Ko)</Label>
                <Input
                  type="number"
                  min={1}
                  value={questionForm.maxSizeKb}
                  onChange={(e) => setQuestionForm({ ...questionForm, maxSizeKb: e.target.value })}
                  placeholder="Ex : 5120 (= 5 Mo)"
                />
              </div>
            )}

            {CHOICE_QUESTION_TYPES.includes(questionForm.type) && (
              <div>
                <Label>Options proposées</Label>
                <div className="space-y-2">
                  {questionForm.options.map((opt, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={opt.label}
                        onChange={(e) => updateOptionRow(index, { label: e.target.value })}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1"
                      />
                      <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => removeOptionRow(index)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addOptionRow}>
                    <Plus className="mr-1 h-3.5 w-3.5" /> Ajouter une option
                  </Button>
                </div>
                {questionErrors.options && <p className="text-xs text-destructive mt-1">{questionErrors.options}</p>}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuestionDialogOpen(false)}>Annuler</Button>
            <Button onClick={submitQuestion} disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}>
              {editingQuestion ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!questionToDelete}
        onOpenChange={(v) => !v && setQuestionToDelete(null)}
        onConfirm={() => {
          if (!questionToDelete) return;
          deleteQuestionMutation.mutate(questionToDelete.id, {
            onSuccess: () => { toast.success("Question supprimée"); setQuestionToDelete(null); },
            onError: () => toast.error("Erreur lors de la suppression de la question"),
          });
        }}
        title={`Supprimer la question "${questionToDelete?.title}" ?`}
      />

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
