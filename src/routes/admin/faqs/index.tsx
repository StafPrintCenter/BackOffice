import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminShell, PageHeader, ConfirmDelete, DataTable } from "@/components/site";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminFaqsList, useCreateAdminFaq, useDeleteAdminFaq } from "@/stores/useFaqsStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import type { APIAdminFaq, AdminFaqPayload } from "@/data/faqs";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/faqs/")({
  head: () => ({
    meta: [
      { title: `FAQ | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: AdminFaqs,
});

const schema = z.object({
  category_id: z.string().trim().min(1, "Choisissez une catégorie"),
  question: z.string().trim().min(5).max(300),
  answer: z.string().trim().min(5).max(2000),
  order: z.number().int().min(0).max(999),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = { category_id: "", question: "", answer: "", order: 1 };

function AdminFaqs() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminFaqsList({ perPage: 100 });
  const { items: categories } = useAdminCategoriesList({ perPage: 100 });

  const createMutation = useCreateAdminFaq();
  const removeMutation = useDeleteAdminFaq();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<APIAdminFaq | null>(null);

  const sorted = [...items].sort((a, b) => a.order - b.order);

  const openCreate = () => { setForm({ ...empty, order: items.length + 1 }); setErrors({}); setOpen(true); };

  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    createMutation.mutate(parsed.data as AdminFaqPayload, {
      onSuccess: () => { toast.success("FAQ créée"); setOpen(false); },
      onError: () => toast.error("Erreur lors de la création"),
    });
  };

  return (
    <AdminShell>
      <PageHeader title="FAQ" description="Questions fréquentes affichées sur le site." />
      <DataTable<APIAdminFaq>
        data={sorted}
        isLoading={isLoading}
        searchKeys={["question", "answer", "category"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/admin/faqs/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={[
          { key: "order", label: "#", render: (r) => <span className="text-muted-foreground">{r.order}</span> },
          { key: "question", label: "Question", render: (r) => <div className="font-medium max-w-md">{r.question}</div> },
          { key: "category", label: "Catégorie", render: (r) => <span className="text-xs">{r.category}</span> },
          { key: "answer", label: "Réponse", render: (r) => <div className="max-w-md line-clamp-2 text-muted-foreground text-xs">{r.answer}</div> },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle FAQ</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Catégorie</Label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— Choisir —</option>
                  {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                {errors.category_id && <p className="text-xs text-destructive mt-1">{errors.category_id}</p>}
              </div>
              <div>
                <Label>Ordre</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} />
                {errors.order && <p className="text-xs text-destructive mt-1">{errors.order}</p>}
              </div>
            </div>
            <div>
              <Label>Question</Label>
              <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
              {errors.question && <p className="text-xs text-destructive mt-1">{errors.question}</p>}
            </div>
            <div>
              <Label>Réponse</Label>
              <Textarea rows={5} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />
              {errors.answer && <p className="text-xs text-destructive mt-1">{errors.answer}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={submit} disabled={createMutation.isPending}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          removeMutation.mutate(toDelete.id, {
            onSuccess: () => { toast.success("FAQ supprimée"); setToDelete(null); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title="Supprimer cette FAQ ?"
      />
    </AdminShell>
  );
}