import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader, ConfirmDelete } from "@/components/site";
import { DataTable } from "@/components/site/DataTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminEcosystemSitesList, useCreateAdminEcosystemSite, useDeleteAdminEcosystemSite } from "@/stores/useEcosystemSitesStore";
import {
  ECOSYSTEM_SITE_CATEGORY_LABELS, ECOSYSTEM_SITE_STATUS_LABELS, getEcosystemSiteStatusBadge,
} from "@/data/ecosystemSites";
import type { APIAdminEcosystemSite, AdminEcosystemSitePayload, EcosystemSiteCategory, EcosystemSiteStatus } from "@/data/ecosystemSites";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/ecosystem/")({
  head: () => ({
    meta: [
      { title: `Écosystème | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminEcosystemSites,
});

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(2),
  url: z.string().trim().url(),
  logo_key: z.string().trim().min(1),
  category: z.enum(["principal", "outil", "formation", "communication", "divertissement"]),
  status: z.enum(["available", "building"]),
});
type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  name: "", description: "", url: "", logo_key: "", category: "outil", status: "available",
};

function AdminEcosystemSites() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminEcosystemSitesList({ perPage: 100 });

  const createMutation = useCreateAdminEcosystemSite();
  const removeMutation = useDeleteAdminEcosystemSite();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<APIAdminEcosystemSite | null>(null);

  const openCreate = () => { setForm(empty); setErrors({}); setOpen(true); };

  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }

    const payload: AdminEcosystemSitePayload = parsed.data as AdminEcosystemSitePayload;

    createMutation.mutate(payload, {
      onSuccess: () => { toast.success("Site ajouté"); setOpen(false); },
      onError: () => toast.error("Erreur lors de la création"),
    });
  };

  return (
    <>
      <PageHeader title="Écosystème" description="Sites et applications de l'écosystème STAF PRINT CENTER." />

      <DataTable<APIAdminEcosystemSite>
        data={items}
        isLoading={isLoading}
        searchKeys={["name", "url", "category"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/ecosystem/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={[
          {
            key: "name",
            label: "Site",
            render: (r) => (
              <div className="flex items-center gap-2">
                <img src={r.logoUrl} alt="" className="h-6 w-6 rounded object-contain" />
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.url}</div>
                </div>
              </div>
            ),
          },
          {
            key: "category",
            label: "Catégorie",
            render: (r) => (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {ECOSYSTEM_SITE_CATEGORY_LABELS[r.category]}
              </span>
            ),
          },
          {
            key: "status",
            label: "Statut",
            render: (r) => (
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getEcosystemSiteStatusBadge(r.status)}`}>
                {ECOSYSTEM_SITE_STATUS_LABELS[r.status]}
              </span>
            ),
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Ajouter un site</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
            </div>
            <div>
              <Label>URL</Label>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
              {errors.url && <p className="text-xs text-destructive mt-1">{errors.url}</p>}
            </div>
            <div>
              <Label>Clé du logo</Label>
              <Input value={form.logo_key} onChange={(e) => setForm({ ...form, logo_key: e.target.value })} placeholder="ex: ai, docs, meet..." />
              {errors.logo_key && <p className="text-xs text-destructive mt-1">{errors.logo_key}</p>}
              <p className="mt-1 text-[11px] text-muted-foreground">
                Doit correspondre à un fichier existant dans le dépôt de logos (ex: AI-MC.png).
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Catégorie</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as EcosystemSiteCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ECOSYSTEM_SITE_CATEGORY_LABELS).map(([k, l]) => (<SelectItem key={k} value={k}>{l}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as EcosystemSiteStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="building">En construction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
            onSuccess: () => { toast.success("Site supprimé"); setToDelete(null); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${toDelete?.name}" ?`}
      />
    </>
  );
}