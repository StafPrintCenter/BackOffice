import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, Star as StarIcon, Wrench, Sparkles, Layers, Tag } from "lucide-react";
import { AdminShell, ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdminServiceDetail, useUpdateAdminService, useDeleteAdminService } from "@/stores/useServicesStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import type { AdminServicePayload } from "@/data/services";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/services/$id")({
  head: () => ({
    meta: [
      { title: `Service | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ServiceDetail,
});

function ServiceDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: service, isLoading } = useAdminServiceDetail(id);
  const { items: categories } = useAdminCategoriesList({ perPage: 100, context: "project" });
  const updateMutation = useUpdateAdminService();
  const removeMutation = useDeleteAdminService();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminServicePayload | null>(null);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    if (service && !form) {
      setForm({
        slug: service.slug ?? "",
        title: service.title,
        icon: service.icon ?? "Sparkles",
        project_category_id: service.categoryId ?? "",
        featured: !!service.featured,
        short: service.short ?? "",
        long: service.long ?? "",
        color: service.color ?? "#E07856",
        features: service.features ?? [],
        process: service.process ?? [],
      });
    }
  }, [service, form]);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      </AdminShell>
    );
  }

  if (!service || !form) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/services" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </div>
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          Service introuvable.
        </div>
      </AdminShell>
    );
  }

  const matchedCategory = categories.find(
    (c) => c.id === (isEditing ? form.project_category_id : service.categoryId) ||
      c.name.toLowerCase() === (typeof service.category === "string" ? service.category.toLowerCase() : "")
  );
  const categoryColorClass = matchedCategory?.colorClass || "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  const categoryName = matchedCategory?.name || (typeof service.category === "string" ? service.category : "Sans catégorie");

  const handleSave = () => {
    updateMutation.mutate(
      { id: service.id, payload: form },
      {
        onSuccess: () => {
          toast.success("Service modifié");
          setIsEditing(false);
        },
        onError: () => toast.error("Erreur lors de la modification"),
      }
    );
  };

  const handleCancel = () => {
    setForm({
      slug: service.slug ?? "",
      title: service.title,
      icon: service.icon ?? "Sparkles",
      project_category_id: service.categoryId ?? "",
      featured: !!service.featured,
      short: service.short ?? "",
      long: service.long ?? "",
      color: service.color ?? "#E07856",
      features: service.features ?? [],
      process: service.process ?? [],
    });
    setIsEditing(false);
  };

  return (
    <AdminShell>
      {/* Barre d'action supérieure */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/services" })}>
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
          {/* Contenu principal du service */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-4">
              <Wrench className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Contenu du service</h2>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="title">Titre du service</Label>
                {isEditing ? (
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="mt-1.5"
                  />
                ) : (
                  <h1 className="mt-1.5 font-display text-2xl font-bold">{service.title}</h1>
                )}
              </div>

              <div>
                <Label htmlFor="short">Description courte</Label>
                {isEditing ? (
                  <Input
                    id="short"
                    value={form.short}
                    onChange={(e) => setForm({ ...form, short: e.target.value })}
                    className="mt-1.5"
                  />
                ) : (
                  <p className="mt-1.5 text-sm text-muted-foreground">{service.short || "Aucune description courte."}</p>
                )}
              </div>

              <div>
                <Label htmlFor="long">Description détaillée</Label>
                {isEditing ? (
                  <Textarea
                    id="long"
                    rows={8}
                    value={form.long}
                    onChange={(e) => setForm({ ...form, long: e.target.value })}
                    className="mt-1.5"
                  />
                ) : (
                  <div className="mt-1.5 rounded-xl border bg-muted/20 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                    {service.long || "Aucune description détaillée."}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Barre Latérale (1/3) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Configuration & Métadonnées du service */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-4 mb-4">
              <Layers className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Paramètres</h2>
            </div>

            <div className="space-y-4">
              {/* Statut En Vedette */}
              <div className="flex items-center justify-between rounded-xl border p-3">
                <Label htmlFor="featured" className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                  <StarIcon className="h-4 w-4 text-amber-500" />
                  <span>Mettre en vedette</span>
                </Label>
                {isEditing ? (
                  <Switch
                    id="featured"
                    checked={form.featured}
                    onCheckedChange={(v) => setForm({ ...form, featured: v })}
                  />
                ) : (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${service.featured ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"}`}>
                    {service.featured ? "Oui" : "Non"}
                  </span>
                )}
              </div>

              {/* Catégorie */}
              <div>
                <Label htmlFor="category" className="text-xs text-muted-foreground">Catégorie</Label>
                {isEditing ? (
                  <select
                    id="category"
                    value={form.project_category_id}
                    onChange={(e) => setForm({ ...form, project_category_id: e.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">— Choisir une catégorie —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${categoryColorClass}`}>
                      <Tag className="h-3 w-3" />
                      {categoryName}
                    </span>
                  </div>
                )}
              </div>

              {/* Slug */}
              <div>
                <Label htmlFor="slug" className="text-xs text-muted-foreground">Slug URL</Label>
                {isEditing ? (
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="mt-1 font-mono text-xs"
                  />
                ) : (
                  <div className="mt-1 font-mono text-xs text-foreground bg-muted/30 p-2 rounded-md truncate">
                    {service.slug}
                  </div>
                )}
              </div>

              {/* Icône */}
              <div>
                <Label htmlFor="icon" className="text-xs text-muted-foreground">Icône (Lucide)</Label>
                {isEditing ? (
                  <Input
                    id="icon"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="mt-1 font-mono text-xs"
                  />
                ) : (
                  <div className="mt-1 text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>{service.icon || "Sparkles"}</span>
                  </div>
                )}
              </div>

              {/* Couleur Accent */}
              <div>
                <Label htmlFor="color" className="text-xs text-muted-foreground">Couleur (HEX)</Label>
                {isEditing ? (
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="h-9 w-9 rounded border cursor-pointer p-1"
                    />
                    <Input
                      id="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="font-mono text-xs"
                    />
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-5 w-5 rounded-md border shadow-sm" style={{ backgroundColor: service.color }} />
                    <code className="text-xs">{service.color}</code>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(service.id, {
            onSuccess: () => {
              toast.success("Service supprimé");
              navigate({ to: "/admin/services" });
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${service.title}" ?`}
      />
    </AdminShell>
  );
}