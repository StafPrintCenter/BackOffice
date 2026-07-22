import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AdminShell, PageHeader, ConfirmDelete, DataTable } from "@/components/site";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAdminShortLinksList, useCreateAdminShortLink, useUpdateAdminShortLink, useDeleteAdminShortLink } from "@/stores/useShortLinksStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import { SHORT_LINK_CATEGORIES } from "@/data/shortlinks";
import type { APIAdminShortLinkListItem, AdminShortLinkPayload } from "@/data/shortlinks";

export const Route = createFileRoute("/admin/shortlinks/")({
  head: () => ({ meta: [{ title: "Liens courts — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminShortLinks,
});

const schema = z.object({
  long_url: z.string().trim().url(),
  alias: z.string().trim().min(2).max(30).optional().or(z.literal("")),
  category: z.string().trim().min(1, "Choisissez une catégorie"),
  is_active: z.boolean(),
  activate_at: z.string().trim().optional().or(z.literal("")),
  expires_at: z.string().trim().optional().or(z.literal("")),
});
type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  long_url: "",
  alias: "",
  category: "",
  is_active: true,
  activate_at: "",
  expires_at: "",
};

function AdminShortLinks() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminShortLinksList({ perPage: 100 });
  const { items: categories } = useAdminCategoriesList({ perPage: 100 });

  const createMutation = useCreateAdminShortLink();
  const updateMutation = useUpdateAdminShortLink();
  const removeMutation = useDeleteAdminShortLink();

  const [dialog, setDialog] = useState<{ open: boolean; row?: APIAdminShortLinkListItem }>({ open: false });
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<APIAdminShortLinkListItem | null>(null);

  const openCreate = () => { setForm(empty); setErrors({}); setDialog({ open: true }); };

  const openEdit = (row: APIAdminShortLinkListItem) => {
    setForm({
      long_url: row.longUrl,
      alias: row.alias,
      category: row.category,
      is_active: row.isActive,
      activate_at: row.activateAt ? row.activateAt.slice(0, 10) : "",
      expires_at: row.expiresAt ? row.expiresAt.slice(0, 10) : "",
    });
    setErrors({});
    setDialog({ open: true, row });
  };

  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }

    if (dialog.row) {
      updateMutation.mutate(
        { id: dialog.row.id, payload: parsed.data as AdminShortLinkPayload },
        {
          onSuccess: () => { toast.success("Lien modifié"); setDialog({ open: false }); },
          onError: () => toast.error("Erreur lors de la modification"),
        }
      );
    } else {
      createMutation.mutate(parsed.data as AdminShortLinkPayload, {
        onSuccess: () => { toast.success("Lien créé"); setDialog({ open: false }); },
        onError: () => toast.error("Erreur lors de la création"),
      });
    }
  };

  return (
    <AdminShell>
      <PageHeader title="Liens courts" description="Redirections trackées avec statistiques de clics." />
      <DataTable<APIAdminShortLinkListItem>
        data={items}
        isLoading={isLoading}
        searchKeys={["alias", "longUrl", "category"]}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={(r) => setToDelete(r)}
        onView={(r) => navigate({ to: "/admin/shortlinks/$id", params: { id: r.id } })}
        columns={[
          {
            key: "alias",
            label: "Alias",
            render: (r) => <span className="font-mono text-xs font-medium text-primary">/{r.alias}</span>,
          },
          {
            key: "longUrl",
            label: "URL cible",
            render: (r) => (
              <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs block select-all">
                {r.longUrl}
              </span>
            ),
          },
          {
            key: "category",
            label: "Catégorie",
            render: (r) => {
              const match = categories.find(
                (c) => c.slug === r.category || c.id === r.category || c.name.toLowerCase() === r.category.toLowerCase()
              );
              const fallbackLabel = SHORT_LINK_CATEGORIES.find((c) => c.value === r.category)?.label ?? r.category;
              const colorClass = match?.colorClass || "bg-slate-100 text-slate-700";
              const label = match?.name || fallbackLabel;

              return (
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
                  {label}
                </span>
              );
            },
          },
          { key: "clicksCount", label: "Clics", render: (r) => <b>{r.clicksCount}</b> },
          {
            key: "isActive",
            label: "Statut",
            render: (r) => (
              <span className={"text-xs rounded-full px-2 py-0.5 " + (r.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>
                {r.isActive ? "Actif" : "Inactif"}
              </span>
            ),
          },
        ]}
      />

      <Dialog open={dialog.open} onOpenChange={(v) => setDialog({ open: v, row: dialog.row })}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{dialog.row ? "Modifier le lien" : "Nouveau lien court"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>URL longue</Label>
              <Input value={form.long_url} onChange={(e) => setForm({ ...form, long_url: e.target.value })} />
              {errors.long_url && <p className="text-xs text-destructive mt-1">{errors.long_url}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Alias (optionnel)</Label>
                <Input value={form.alias} onChange={(e) => setForm({ ...form, alias: e.target.value })} />
              </div>

              <div>
                <Label>Catégorie</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— Choisir —</option>
                  {SHORT_LINK_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
              </div>

              <div>
                <Label>Activation</Label>
                <Input type="date" value={form.activate_at} onChange={(e) => setForm({ ...form, activate_at: e.target.value })} />
              </div>

              <div>
                <Label>Expiration</Label>
                <Input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="cursor-pointer">Actif</Label>
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false })}>Annuler</Button>
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
            onSuccess: () => { toast.success("Lien supprimé"); setToDelete(null); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${toDelete?.alias}" ?`}
      />
    </AdminShell>
  );
}