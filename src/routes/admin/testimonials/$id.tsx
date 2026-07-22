import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, Star, Sparkles } from "lucide-react";
import { AdminShell, ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdminTestimonialDetail, useUpdateAdminTestimonial, useDeleteAdminTestimonial } from "@/stores/useTestimonialsStore";
import type { AdminTestimonialPayload } from "@/data/testimonials";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/testimonials/$id")({
  head: () => ({
    meta: [
      { title: `Témoignage | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: TestimonialDetail,
});

function TestimonialDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: testimonial, isLoading } = useAdminTestimonialDetail(id);
  const updateMutation = useUpdateAdminTestimonial();
  const removeMutation = useDeleteAdminTestimonial();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminTestimonialPayload | null>(null);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    if (testimonial && !form) {
      setForm({
        name: testimonial.name,
        role: testimonial.role,
        quote: testimonial.quote,
        rating: testimonial.rating,
        featured: testimonial.featured,
      });
    }
  }, [testimonial, form]);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      </AdminShell>
    );
  }

  if (!testimonial || !form) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/testimonials" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Témoignage introuvable.</p>
      </AdminShell>
    );
  }

  const handleSave = () => {
    updateMutation.mutate({ id: testimonial.id, payload: form }, {
      onSuccess: () => { toast.success("Témoignage modifié"); setIsEditing(false); },
      onError: () => toast.error("Erreur lors de la modification"),
    });
  };

  const handleCancel = () => {
    setForm({
      name: testimonial.name,
      role: testimonial.role,
      quote: testimonial.quote,
      rating: testimonial.rating,
      featured: testimonial.featured,
    });
    setIsEditing(false);
  };

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/testimonials" })}>
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

      <div className="max-w-2xl space-y-4">
        {isEditing ? (
          <div className="space-y-4 rounded-2xl border bg-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Nom</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Poste</Label>
                <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </div>
              <div>
                <Label>Note (1-5)</Label>
                <Input type="number" min={1} max={5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer">En vedette</Label>
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
              </div>
            </div>
            <div>
              <Label>Citation</Label>
              <Textarea rows={4} value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border bg-card p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                {testimonial.featured ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    <Sparkles className="h-3 w-3" /> En vedette
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground font-medium">Standard</span>
                )}
              </div>

              <blockquote className="text-xl italic font-display leading-relaxed text-foreground">
                "{testimonial.quote}"
              </blockquote>

              <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                  {testimonial.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>

            {/* Encadré des métadonnées de dates */}
            <div className="rounded-2xl border bg-card p-4 text-xs text-muted-foreground flex items-center justify-between">
              <div>Créé le : {new Date(testimonial.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
              <div>Modifié le : {new Date(testimonial.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
            </div>
          </>
        )}
      </div>

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(testimonial.id, {
            onSuccess: () => { toast.success("Témoignage supprimé"); navigate({ to: "/admin/testimonials" }); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${testimonial.name}" ?`}
      />
    </AdminShell>
  );
}