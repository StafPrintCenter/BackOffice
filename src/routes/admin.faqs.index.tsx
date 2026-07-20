import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminShell } from "@/layouts/AdminShell";
import { PageHeader, ConfirmDelete } from "@/components/admin/AdminBits";
import { DataTable } from "@/components/admin/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { faqsApi, categoriesApi } from "@/api/extra.api";
import type { Faq } from "@/types";

export const Route = createFileRoute("/admin/faqs/")({
  head: () => ({ meta: [{ title: "FAQ — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminFaqs,
});

const schema = z.object({
  categoryId: z.string().min(1),
  question: z.string().trim().min(5).max(300),
  answer: z.string().trim().min(5).max(2000),
  order: z.number().int().min(0).max(999),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = { categoryId: "", question: "", answer: "", order: 1 };

function AdminFaqs() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["faqs"], queryFn: faqsApi.list });
  const { data: cats } = useQuery({ queryKey: ["categories"], queryFn: categoriesApi.list });
  const [dialog, setDialog] = useState<{ open: boolean; row?: Faq }>({ open: false });
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<Faq | null>(null);

  const catName = (id: string) => cats?.find((c) => c.id === id)?.name ?? "—";
  const sorted = [...(data ?? [])].sort((a, b) => a.order - b.order);

  const create = useMutation({ mutationFn: (v: FormValues) => faqsApi.create(v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["faqs"] }); toast.success("Créé"); setDialog({ open: false }); } });
  const update = useMutation({ mutationFn: (v: FormValues & { id: string }) => faqsApi.update(v.id, v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["faqs"] }); toast.success("Modifié"); setDialog({ open: false }); } });
  const remove = useMutation({ mutationFn: (id: string) => faqsApi.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["faqs"] }); toast.success("Supprimé"); setToDelete(null); } });

  const openCreate = () => { setForm({ ...empty, order: (data?.length ?? 0) + 1 }); setErrors({}); setDialog({ open: true }); };
  const openEdit = (row: Faq) => { setForm({ categoryId: row.categoryId, question: row.question, answer: row.answer, order: row.order }); setErrors({}); setDialog({ open: true, row }); };
  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) { const errs: Record<string, string> = {}; parsed.error.issues.forEach((i) => errs[i.path[0] as string] = i.message); setErrors(errs); return; }
    if (dialog.row) update.mutate({ ...parsed.data, id: dialog.row.id }); else create.mutate(parsed.data);
  };

  return (
    <AdminShell>
      <PageHeader title="FAQ" description="Questions fréquentes affichées sur le site." />
      <DataTable<Faq>
        data={sorted}
        isLoading={isLoading}
        searchKeys={["question", "answer"]}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={(r) => setToDelete(r)}
        columns={[
          { key: "order", label: "#", render: (r) => <span className="text-muted-foreground">{r.order}</span> },
          { key: "question", label: "Question", render: (r) => <div className="font-medium max-w-md">{r.question}</div> },
          { key: "categoryId", label: "Catégorie", render: (r) => <span className="text-xs">{catName(r.categoryId)}</span> },
          { key: "answer", label: "Réponse", render: (r) => <div className="max-w-md line-clamp-2 text-muted-foreground text-xs">{r.answer}</div> },
        ]}
      />

      <Dialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v, row: dialog.row })}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialog.row ? "Modifier la FAQ" : "Nouvelle FAQ"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Catégorie</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger>
                  <SelectContent>
                    {cats?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-xs text-destructive mt-1">{errors.categoryId}</p>}
              </div>
              <div><Label>Ordre</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Question</Label><Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />{errors.question && <p className="text-xs text-destructive mt-1">{errors.question}</p>}</div>
            <div><Label>Réponse</Label><Textarea rows={5} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} />{errors.answer && <p className="text-xs text-destructive mt-1">{errors.answer}</p>}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Annuler</Button>
            <Button onClick={submit}>{dialog.row ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)} onConfirm={() => toDelete && remove.mutate(toDelete.id)} title="Supprimer cette FAQ ?" />
    </AdminShell>
  );
}
