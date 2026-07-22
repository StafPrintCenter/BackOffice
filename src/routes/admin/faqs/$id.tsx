import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
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
        <p className="text-muted-foreground">FAQ introuvable.</p>
      </AdminShell>
    );
  }

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

      <div className="max-w-3xl space-y-6">
        {isEditing ? (
          <div className="space-y-4 rounded-2xl border bg-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Catégorie</Label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <Label>Ordre</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Question</Label>
              <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
            </div>
            <div>
              <Label>Réponse</Label>
              <Textarea rows={5} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-muted px-2 py-0.5">{faq.category}</span>
                <span className="rounded-full bg-muted px-2 py-0.5">Ordre {faq.order}</span>
              </div>
              <h1 className="mt-3 font-display text-3xl font-bold">{faq.question}</h1>
            </div>
            <div className="rounded-2xl border bg-card p-6">
              <div className="font-semibold mb-2">Réponse</div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
            </div>
          </>
        )}
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