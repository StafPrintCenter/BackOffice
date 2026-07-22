import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, Star as StarIcon } from "lucide-react";
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
        <p className="text-muted-foreground">Service introuvable.</p>
      </AdminShell>
    );
  }

  const matchedCategory = categories.find(
    (c) => c.id === service.categoryId || c.name.toLowerCase() === (typeof service.category === "string" ? service.category.toLowerCase() : "")
  );
  const categoryColorClass = matchedCategory?.colorClass || "bg-slate-100 text-slate-700";
  const categoryName = typeof service.category === "string" ? service.category : matchedCategory?.name || "Sans catégorie";

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

      <div className="max-w-4xl space-y-6">
        {isEditing ? (
          <div className="space-y-4 rounded-2xl border bg-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Titre</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div>
                <Label>Catégorie</Label>
                <select
                  value={form.project_category_id}
                  onChange={(e) => setForm({ ...form, project_category_id: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— Choisir —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Icône (Lucide)</Label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              </div>
              <div>
                <Label>Couleur (HEX)</Label>
                <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer">En vedette</Label>
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
              </div>
            </div>
            <div>
              <Label>Description courte</Label>
              <Input value={form.short} onChange={(e) => setForm({ ...form, short: e.target.value })} />
            </div>
            <div>
              <Label>Description longue</Label>
              <Textarea rows={5} value={form.long} onChange={(e) => setForm({ ...form, long: e.target.value })} />
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${categoryColorClass}`}>
                  {categoryName}
                </span>
                {service.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-primary font-medium">
                    <StarIcon className="h-3 w-3" /> En vedette
                  </span>
                )}
              </div>
              <h1 className="mt-3 font-display text-4xl font-bold">{service.title}</h1>
              <p className="mt-2 text-muted-foreground">{service.short}</p>
            </div>

            <div className="rounded-2xl border bg-card p-6">
              <div className="font-semibold mb-2">Description</div>
              <p className="text-sm leading-relaxed">{service.long}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              <div className="rounded-xl border p-4">
                <div className="text-xs text-muted-foreground">Slug</div>
                <code>{service.slug}</code>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-xs text-muted-foreground">Icône</div>
                <div className="mt-1 font-medium">{service.icon}</div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-xs text-muted-foreground">Couleur</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="h-4 w-4 rounded border" style={{ background: service.color }} />
                  <code>{service.color}</code>
                </div>
              </div>
            </div>
          </>
        )}
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
