import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, HelpCircle, Tag, Hash, Calendar, Layers } from "lucide-react";
import { AdminShell, ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAdminFaqDetail, useUpdateAdminFaq, useDeleteAdminFaq } from "@/stores/useFaqsStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import type { AdminFaqPayload } from "@/data/faqs";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/faqs/$id")({
  head: () => ({
    meta: [
      { title: `FAQ | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: FaqDetail,
});

function FaqDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: faq, isLoading } = useAdminFaqDetail(id);
  const { items: categories } = useAdminCategoriesList({ perPage: 100 });
  const updateMutation = useUpdateAdminFaq();
  const removeMutation = useDeleteAdminFaq();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminFaqPayload | null>(null);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    if (faq && !form) {
      setForm({
        category_id: faq.categoryId,
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
      });
    }
  }, [faq, form]);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      </AdminShell>
    );
  }

  if (!faq || !form) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/faqs" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </div>
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          FAQ introuvable.
        </div>
      </AdminShell>
    );
  }

  // Récupération de la catégorie correspondante
  const selectedCatId = isEditing ? form.category_id : faq.categoryId;
  const categoryMeta = categories.find(
    (c) => c.id === selectedCatId || c.name.toLowerCase() === (typeof faq.category === "string" ? faq.category.toLowerCase() : "")
  );
  const categoryColorClass = categoryMeta?.colorClass ?? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  const categoryName = categoryMeta?.name ?? (typeof faq.category === "string" ? faq.category : "Sans catégorie");

  const handleSave = () => {
    updateMutation.mutate({ id: faq.id, payload: form }, {
      onSuccess: () => { toast.success("FAQ modifiée"); setIsEditing(false); },
      onError: () => toast.error("Erreur lors de la modification"),
    });
  };

  const handleCancel = () => {
    setForm({
      category_id: faq.categoryId,
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
    });
    setIsEditing(false);
  };

  return (
    <AdminShell>
      {/* Barre d'action supérieure */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/faqs" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" /> Annuler
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-1" /> Enregistrer
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-1" /> Modifier
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setToDelete(true)}>
                <Trash2 className="h-4 w-4 mr-1" /> Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Disposition à 2 colonnes */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne Principale (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-4">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Contenu de la FAQ</h2>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <Label htmlFor="question">Question</Label>
                {isEditing ? (
                  <Input
                    id="question"
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    className="mt-1.5"
                  />
                ) : (
                  <h1 className="mt-1.5 font-display text-2xl font-bold">{faq.question}</h1>
                )}
              </div>

              <div>
                <Label htmlFor="answer">Réponse</Label>
                {isEditing ? (
                  <Textarea
                    id="answer"
                    rows={8}
                    value={form.answer}
                    onChange={(e) => setForm({ ...form, answer: e.target.value })}
                    className="mt-1.5"
                  />
                ) : (
                  <div className="mt-1.5 rounded-xl border bg-muted/20 p-5 text-sm leading-relaxed whitespace-pre-wrap">
                    {faq.answer || "Aucune réponse fournie."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Barre Latérale (1/3) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Organisation & Catégorie */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-3 mb-4">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-semibold">Organisation</h3>
            </div>

            <div className="space-y-4 text-sm">
              {/* Catégorie */}
              <div>
                <Label htmlFor="category" className="text-xs text-muted-foreground">Catégorie</Label>
                {isEditing ? (
                  <select
                    id="category"
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">— Choisir —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColorClass}`}>
                      <Tag className="h-3 w-3" />
                      {categoryName}
                    </span>
                  </div>
                )}
              </div>

              {/* Ordre */}
              <div>
                <Label htmlFor="order" className="text-xs text-muted-foreground">Ordre d'affichage</Label>
                {isEditing ? (
                  <Input
                    id="order"
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="mt-1 text-sm"
                  />
                ) : (
                  <div className="mt-1 flex items-center gap-1.5 font-medium text-sm">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Position {faq.order}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Métadonnées & Dates */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-3 mb-4">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-semibold">Métadonnées</h3>
            </div>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Créée le</span>
                <span className="font-medium text-foreground">
                  {new Date(faq.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Modifiée le</span>
                <span className="font-medium text-foreground">
                  {new Date(faq.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(faq.id, {
            onSuccess: () => { toast.success("FAQ supprimée"); navigate({ to: "/admin/faqs" }); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title="Supprimer cette FAQ ?"
      />
    </AdminShell>
  );
}