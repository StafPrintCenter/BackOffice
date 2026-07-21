import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Star } from "lucide-react";
import { AdminShell } from "@/layouts/AdminShell";
import { PageHeader, ConfirmDelete } from "@/components/site/AdminBits";
import { DataTable } from "@/components/admin/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { testimonialsApi } from "@/api/testimonials.api";
import type { Testimonial } from "@/types";

export const Route = createFileRoute("/admin/testimonials/")({
  head: () => ({ meta: [{ title: "Témoignages — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminTestimonials,
});

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  role: z.string().trim().min(1).max(80),
  company: z.string().trim().min(1).max(100),
  quote: z.string().trim().min(10).max(500),
  rating: z.number().min(1).max(5),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = { name: "", role: "", company: "", quote: "", rating: 5 };

function AdminTestimonials() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({ queryKey: ["testimonials"], queryFn: testimonialsApi.list });
  const [dialog, setDialog] = useState<{ open: boolean; row?: Testimonial }>({ open: false });
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<Testimonial | null>(null);

  const create = useMutation({ mutationFn: (v: FormValues) => testimonialsApi.create(v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["testimonials"] }); toast.success("Créé"); setDialog({ open: false }); } });
  const update = useMutation({ mutationFn: (v: FormValues & { id: string }) => testimonialsApi.update(v.id, v), onSuccess: () => { qc.invalidateQueries({ queryKey: ["testimonials"] }); toast.success("Modifié"); setDialog({ open: false }); } });
  const remove = useMutation({ mutationFn: (id: string) => testimonialsApi.remove(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ["testimonials"] }); toast.success("Supprimé"); setToDelete(null); } });

  const openCreate = () => { setForm(empty); setErrors({}); setDialog({ open: true }); };
  const openEdit = (row: Testimonial) => { setForm({ name: row.name, role: row.role, company: row.company, quote: row.quote, rating: row.rating }); setErrors({}); setDialog({ open: true, row }); };
  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) { const errs: Record<string, string> = {}; parsed.error.issues.forEach((i) => errs[i.path[0] as string] = i.message); setErrors(errs); return; }
    if (dialog.row) update.mutate({ ...parsed.data, id: dialog.row.id }); else create.mutate(parsed.data);
  };

  return (
    <AdminShell>
      <PageHeader title="Témoignages" description="Retours clients affichés sur le site." />
      <DataTable<Testimonial>
        data={data ?? []}
        isLoading={isLoading}
        searchKeys={["name", "company"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/admin/testimonials/$id", params: { id: r.id } })}
        onEdit={openEdit}
        onDelete={(r) => setToDelete(r)}

        columns={[
          { key: "name", label: "Nom", render: (r) => <div><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.role}</div></div> },
          { key: "company", label: "Entreprise" },
          { key: "rating", label: "Note", render: (r) => <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-primary text-primary" />)}</div> },
          { key: "quote", label: "Citation", render: (r) => <div className="max-w-md text-muted-foreground line-clamp-1 italic">"{r.quote}"</div> },
        ]}
      />

      <Dialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v, row: dialog.row })}>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialog.row ? "Modifier le témoignage" : "Nouveau témoignage"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Nom</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />{errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}</div>
              <div><Label>Poste</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
              <div><Label>Entreprise</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
              <div><Label>Note (1-5)</Label><Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Citation</Label><Textarea rows={4} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />{errors.quote && <p className="text-xs text-destructive mt-1">{errors.quote}</p>}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Annuler</Button>
            <Button onClick={submit}>{dialog.row ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)} onConfirm={() => toDelete && remove.mutate(toDelete.id)} title={`Supprimer "${toDelete?.name}" ?`} />
    </AdminShell>
  );
}
