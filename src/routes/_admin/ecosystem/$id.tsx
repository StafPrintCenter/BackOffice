import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, ExternalLink } from "lucide-react";
import { ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminEcosystemSiteDetail, useUpdateAdminEcosystemSite, useDeleteAdminEcosystemSite } from "@/stores/useEcosystemSitesStore";
import {
  ECOSYSTEM_SITE_CATEGORY_LABELS, ECOSYSTEM_SITE_STATUS_LABELS, getEcosystemSiteStatusBadge,
} from "@/data/ecosystemSites";
import type { AdminEcosystemSitePayload, EcosystemSiteCategory, EcosystemSiteStatus } from "@/data/ecosystemSites";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/ecosystem/$id")({
  head: () => ({
    meta: [
      { title: `Site écosystème | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EcosystemSiteDetail,
});

function EcosystemSiteDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: site, isLoading } = useAdminEcosystemSiteDetail(id);
  const updateMutation = useUpdateAdminEcosystemSite();
  const removeMutation = useDeleteAdminEcosystemSite();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminEcosystemSitePayload | null>(null);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    if (site && !form) {
      setForm({
        name: site.name,
        description: site.description,
        url: site.url,
        logo_key: site.logoKey,
        category: site.category,
        status: site.status,
      });
    }
  }, [site, form]);

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      </>
    );
  }

  if (!site || !form) {
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/ecosystem" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Site introuvable.</p>
      </>
    );
  }

  const handleSave = () => {
    updateMutation.mutate(
      { id: site.id, payload: form },
      {
        onSuccess: () => { toast.success("Site modifié"); setIsEditing(false); },
        onError: () => toast.error("Erreur lors de la modification"),
      }
    );
  };

  const handleCancel = () => {
    setForm({
      name: site.name,
      description: site.description,
      url: site.url,
      logo_key: site.logoKey,
      category: site.category,
      status: site.status,
    });
    setIsEditing(false);
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/ecosystem" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}><X className="h-4 w-4 mr-1" /> Annuler</Button>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}><Save className="h-4 w-4 mr-1" /> Enregistrer</Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Pencil className="h-4 w-4 mr-1" /> Modifier</Button>
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => setToDelete(true)}>
                <Trash2 className="h-4 w-4 mr-1" /> Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-muted px-2 py-0.5 font-medium">{ECOSYSTEM_SITE_CATEGORY_LABELS[site.category]}</span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium ${getEcosystemSiteStatusBadge(site.status)}`}>
            {ECOSYSTEM_SITE_STATUS_LABELS[site.status]}
          </span>
        </div>

        {isEditing ? (
          <div className="space-y-4 rounded-2xl border bg-card p-6">
            <div>
              <Label>Nom</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>URL</Label>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>
            <div>
              <Label>Clé du logo</Label>
              <Input value={form.logo_key} onChange={(e) => setForm({ ...form, logo_key: e.target.value })} />
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
        ) : (
          <>
            <div className="flex items-center gap-4">
              <img src={site.logoUrl} alt={site.name} className="h-16 w-16 rounded-xl border object-contain p-2" />
              <div>
                <h1 className="font-display text-2xl font-bold">{site.name}</h1>
                <a
                  href={site.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {site.url} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <p className="whitespace-pre-wrap text-muted-foreground">{site.description}</p>

            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-3 text-sm font-medium text-muted-foreground">Variantes du logo</div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Object.entries(site.logoVariants).map(([key, url]) => (
                  <div key={key} className="rounded-lg border p-3 text-center">
                    <img src={url} alt={key} className="mx-auto h-10 w-10 object-contain" />
                    <div className="mt-1 text-[10px] uppercase text-muted-foreground">{key}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="rounded-2xl border bg-card p-4 text-xs text-muted-foreground">
          <div>Créé le {new Date(site.createdAt).toLocaleDateString("fr-FR")}</div>
          <div>Modifié le {new Date(site.updatedAt).toLocaleDateString("fr-FR")}</div>
        </div>
      </div >

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(site.id, {
            onSuccess: () => { toast.success("Site supprimé"); navigate({ to: "/ecosystem" }); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${site.name}" ?`}
      />
    </>
  );
}