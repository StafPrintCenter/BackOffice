import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, Star, Quote, User, Briefcase, Calendar, Sparkles, Layers } from "lucide-react";
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
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          Témoignage introuvable.
        </div>
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

  const currentRating = isEditing ? form.rating : testimonial.rating;
  const currentName = isEditing ? form.name : testimonial.name;

  return (
    <AdminShell>
      {/* Barre d'action supérieure */}
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

      {/* Disposition à 2 colonnes */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne Principale (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-4">
              <Quote className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Avis du client</h2>
            </div>

            <div className="mt-6 space-y-5">
              {/* Citation / Témoignage */}
              <div>
                <Label htmlFor="quote">Témoignage</Label>
                {isEditing ? (
                  <Textarea
                    id="quote"
                    rows={6}
                    value={form.quote}
                    onChange={(e) => setForm({ ...form, quote: e.target.value })}
                    className="mt-1.5"
                  />
                ) : (
                  <blockquote className="mt-1.5 rounded-xl border bg-muted/20 p-5 text-lg italic font-display leading-relaxed text-foreground">
                    "{testimonial.quote || "Aucune citation fournie."}"
                  </blockquote>
                )}
              </div>

              {/* Infos Auteur */}
              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-1.5"
                    />
                  ) : (
                    <div className="mt-1.5 flex items-center gap-2 font-medium">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{testimonial.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="role">Poste / Entreprise</Label>
                  {isEditing ? (
                    <Input
                      id="role"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="mt-1.5"
                    />
                  ) : (
                    <div className="mt-1.5 flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <span>{testimonial.role || "Non spécifié"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barre Latérale (1/3) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Avatar & Évaluation */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
              {currentName
                ? currentName.split(" ").map((n) => n[0]).slice(0, 2).join("")
                : "??"}
            </div>

            {/* Note en étoiles */}
            <div className="mt-4 flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${i < currentRating
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted border-muted fill-muted/20"
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Paramètres & Mise en avant */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-3 mb-4">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-semibold">Paramètres</h3>
            </div>

            <div className="space-y-4 text-sm">
              {/* Statut En Vedette */}
              <div className="flex items-center justify-between rounded-xl border p-3">
                <Label htmlFor="featured" className="flex items-center gap-2 cursor-pointer font-medium text-xs">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Mettre en vedette</span>
                </Label>
                {isEditing ? (
                  <Switch
                    id="featured"
                    checked={form.featured}
                    onCheckedChange={(v) => setForm({ ...form, featured: v })}
                  />
                ) : (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${testimonial.featured ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"}`}>
                    {testimonial.featured ? "Oui" : "Non"}
                  </span>
                )}
              </div>

              {/* Note (Edition uniquement) */}
              {isEditing && (
                <div>
                  <Label htmlFor="rating" className="text-xs text-muted-foreground">Note (1 à 5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min={1}
                    max={5}
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Math.min(5, Math.max(1, Number(e.target.value))) })}
                    className="mt-1 text-sm"
                  />
                </div>
              )}
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
                <span>Créé le</span>
                <span className="font-medium text-foreground">
                  {new Date(testimonial.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Modifié le</span>
                <span className="font-medium text-foreground">
                  {new Date(testimonial.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
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