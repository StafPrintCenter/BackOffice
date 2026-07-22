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
import { Switch } from "@/components/ui/switch";
import {
  useAdminServicesList,
  useCreateAdminService,
  useUpdateAdminService,
  useDeleteAdminService,
} from "@/stores/useServicesStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import type { APIAdminServiceListItem, AdminServicePayload } from "@/data/services";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/services/")({
  head: () => ({
    meta: [
      { title: `Services | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminServices,
});

const schema = z.object({
  title: z.string().trim().min(2, "Le titre doit faire au moins 2 caractères").max(100),
  slug: z.string().trim().max(100).optional(),
  project_category_id: z.string().trim().min(1, "Choisissez une catégorie"),
  icon: z.string().trim().min(1, "L'icône est requise").max(50),
  color: z.string().trim().min(1, "La couleur est requise").max(20),
  featured: z.boolean(),
  short: z.string().trim().min(2, "La description courte est requise").max(300),
  long: z.string().trim().min(10, "La description longue doit faire au moins 10 caractères").max(2000),
});

type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  title: "",
  slug: "",
  project_category_id: "",
  icon: "Sparkles",
  color: "#E07856",
  featured: false,
  short: "",
  long: "",
};

function AdminServices() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminServicesList({ perPage: 100 });
  const { items: categories } = useAdminCategoriesList({ perPage: 100, context: "project" });

  const createMutation = useCreateAdminService();
  const updateMutation = useUpdateAdminService();
  const removeMutation = useDeleteAdminService();

  const [dialog, setDialog] = useState<{ open: boolean; row?: APIAdminServiceListItem }>({ open: false });
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<APIAdminServiceListItem | null>(null);

  const openCreate = () => {
    setForm(empty);
    setErrors({});
    setDialog({ open: true });
  };

  const openEdit = (row: APIAdminServiceListItem) => {
    setForm({
      title: row.title,
      slug: row.slug ?? "",
      project_category_id: row.categoryId ?? "",
      icon: row.icon ?? "Sparkles",
      color: row.color ?? "#E07856",
      featured: !!row.featured,
      short: row.short ?? "",
      long: row.long ?? "",
    });
    setErrors({});
    setDialog({ open: true, row });
  };

  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errs[i.path[0] as string] = i.message;
      });
      setErrors(errs);
      return;
    }

    const payload: AdminServicePayload = {
      title: parsed.data.title,
      slug: parsed.data.slug || undefined,
      project_category_id: parsed.data.project_category_id,
      icon: parsed.data.icon,
      color: parsed.data.color,
      featured: parsed.data.featured,
      short: parsed.data.short,
      long: parsed.data.long,
      features: [],
      process: [],
    };

    if (dialog.row) {
      updateMutation.mutate(
        { id: dialog.row.id, payload },
        {
          onSuccess: () => {
            toast.success("Service modifié");
            setDialog({ open: false });
          },
          onError: () => toast.error("Erreur lors de la modification"),
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Service créé");
          setDialog({ open: false });
        },
        onError: () => toast.error("Erreur lors de la création"),
      });
    }
  };

  return (
    <AdminShell>
      <PageHeader title="Services" description="Gérez les prestations affichées sur le site." />

      <DataTable<APIAdminServiceListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["title", "category", "short"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/admin/services/$id", params: { id: r.id } })}
        onEdit={openEdit}
        onDelete={(r) => setToDelete(r)}
        columns={[
          {
            key: "title",
            label: "Titre",
            render: (r) => (
              <div className="max-w-45 sm:max-w-xs md:max-w-md">
                <div className="sm:hidden flex items-baseline gap-1.5 truncate text-sm">
                  <span className="font-medium truncate">{r.title}</span>
                  {r.slug && <span className="text-xs text-muted-foreground truncate">({r.slug})</span>}
                </div>
                <div className="hidden sm:block">
                  <div className="font-medium leading-snug">{r.title}</div>
                  {r.slug && <div className="text-xs text-muted-foreground mt-0.5">{r.slug}</div>}
                </div>
              </div>
            ),
          },
          {
            key: "category",
            label: "Catégorie",
            render: (r) => {
              const match = categories.find(
                (c) => c.id === r.categoryId || c.name.toLowerCase() === (typeof r.category === "string" ? r.category.toLowerCase() : "")
              );
              const colorClass = match?.colorClass || "bg-slate-100 text-slate-700";
              const categoryName = typeof r.category === "string" ? r.category : match?.name || "Sans catégorie";

              return (
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
                  {categoryName}
                </span>
              );
            },
          },
          {
            key: "featured",
            label: "En vedette",
            render: (r) =>
              r.featured ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Oui</span>
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              ),
          },
          {
            key: "short",
            label: "Description",
            render: (r) => <div className="max-w-md text-muted-foreground line-clamp-1">{r.short}</div>,
          },
        ]}
      />

      <Dialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v, row: dialog.row })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialog.row ? "Modifier le service" : "Nouveau service"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Titre</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
              </div>
              <div>
                <Label>Slug (optionnel)</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug}</p>}
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
                {errors.project_category_id && <p className="text-xs text-destructive mt-1">{errors.project_category_id}</p>}
              </div>
              <div>
                <Label>Icône (Lucide)</Label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Printer" />
                {errors.icon && <p className="text-xs text-destructive mt-1">{errors.icon}</p>}
              </div>
              <div>
                <Label>Couleur (HEX)</Label>
                <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                {errors.color && <p className="text-xs text-destructive mt-1">{errors.color}</p>}
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label className="cursor-pointer">En vedette</Label>
                <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
              </div>
            </div>
            <div>
              <Label>Description courte</Label>
              <Input value={form.short} onChange={(e) => setForm({ ...form, short: e.target.value })} />
              {errors.short && <p className="text-xs text-destructive mt-1">{errors.short}</p>}
            </div>
            <div>
              <Label>Description longue</Label>
              <Textarea rows={5} value={form.long} onChange={(e) => setForm({ ...form, long: e.target.value })} />
              {errors.long && <p className="text-xs text-destructive mt-1">{errors.long}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>
              Annuler
            </Button>
            <Button onClick={submit} disabled={createMutation.isPending || updateMutation.isPending}>
              {dialog.row ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          removeMutation.mutate(toDelete.id, {
            onSuccess: () => {
              toast.success("Service supprimé");
              setToDelete(null);
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${toDelete?.title}" ?`}
      />
    </AdminShell>
  );
}