import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Star } from "lucide-react";
import { AdminShell, PageHeader, ConfirmDelete, DataTable } from "@/components/site";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAdminTestimonialsList, useCreateAdminTestimonial, useDeleteAdminTestimonial } from "@/stores/useTestimonialsStore";
import type { APIAdminTestimonial, AdminTestimonialPayload } from "@/data/testimonials";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/testimonials/")({
  head: () => ({
    meta: [
      { title: `Témoignages | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: AdminTestimonials,
});

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  role: z.string().trim().min(1).max(80),
  quote: z.string().trim().min(10).max(500),
  rating: z.number().min(1).max(5),
  featured: z.boolean(),
});
type FormValues = z.infer<typeof schema>;
const empty: FormValues = { name: "", role: "", quote: "", rating: 5, featured: false };

function AdminTestimonials() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminTestimonialsList({ perPage: 100 });

  const createMutation = useCreateAdminTestimonial();
  const removeMutation = useDeleteAdminTestimonial();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<APIAdminTestimonial | null>(null);

  const openCreate = () => { setForm(empty); setErrors({}); setOpen(true); };

  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    createMutation.mutate(parsed.data as AdminTestimonialPayload, {
      onSuccess: () => { toast.success("Témoignage créé"); setOpen(false); },
      onError: () => toast.error("Erreur lors de la création"),
    });
  };

  return (
    <AdminShell>
      <PageHeader title="Témoignages" description="Retours clients affichés sur le site." />
      <DataTable<APIAdminTestimonial>
        data={items}
        isLoading={isLoading}
        searchKeys={["name", "role"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/admin/testimonials/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={[
          {
            key: "name",
            label: "Nom",
            render: (r) => <div>
              <div className="font-medium">{r.name}</div>
              <div className="font-mono text-xs font-medium text-primary">{r.role}</div>
            </div>
          },
          { key: "rating", label: "Note", render: (r) => <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-primary text-primary" />)}</div> },
          { key: "quote", label: "Citation", render: (r) => <div className="max-w-md text-muted-foreground line-clamp-1 italic">"{r.quote}"</div> },
          { key: "featured", label: "En vedette", render: (r) => r.featured ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Oui</span> : <span className="text-xs text-muted-foreground">-</span> },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouveau témoignage</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Nom</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label>Poste</Label>
                <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                {errors.role && <p className="text-xs text-destructive mt-1">{errors.role}</p>}
              </div>
              <div>
                <Label>Note (1-5)</Label>
                <Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
                {errors.rating && <p className="text-xs text-destructive mt-1">{errors.rating}</p>}
              </div>
              <div className="flex items-end gap-3">
                <Label className="mb-2">En vedette</Label>
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
              </div>
            </div>
            <div>
              <Label>Citation</Label>
              <Textarea rows={4} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
              {errors.quote && <p className="text-xs text-destructive mt-1">{errors.quote}</p>}
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
            onSuccess: () => { toast.success("Témoignage supprimé"); setToDelete(null); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${toDelete?.name}" ?`}
      />
    </AdminShell>
  );
}
