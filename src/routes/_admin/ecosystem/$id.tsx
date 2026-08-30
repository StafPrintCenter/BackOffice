import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, ExternalLink, Globe, Calendar, Layers, CheckCircle2 } from "lucide-react";
import { ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  useAdminEcosystemSiteDetail,
  useUpdateAdminEcosystemSite,
  useDeleteAdminEcosystemSite
} from "@/stores/useEcosystemSitesStore";
import {
  ECOSYSTEM_SITE_CATEGORY_LABELS,
  ECOSYSTEM_SITE_STATUS_LABELS,
  getEcosystemSiteStatusBadge,
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
      <div className="flex h-100 flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
        <p className="text-sm font-medium">Chargement des détails du site...</p>
      </div>
    );
  }

  if (!site || !form) {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <h2 className="text-lg font-semibold">Site introuvable</h2>
        <p className="mt-1 text-sm text-muted-foreground">Le site demandé n'existe pas ou a été supprimé.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate({ to: "/ecosystem" })}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Retour à la liste
        </Button>
      </div>
    );
  }

  const handleSave = () => {
    updateMutation.mutate(
      { id: site.id, payload: form },
      {
        onSuccess: () => {
          toast.success("Site modifié avec succès");
          setIsEditing(false);
        },
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
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/ecosystem" })}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{site.name}</h1>
            <p className="text-xs text-muted-foreground">ID: {site.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1.5" /> Annuler
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
                Enregistrer
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-1.5" /> Modifier
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setToDelete(true)}>
                <Trash2 className="h-4 w-4 mr-1.5" /> Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Grid Layout (2 Colonnes) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne Principale (Gauche - 2/3) */}
        <div className="space-y-6 lg:col-span-2">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informations Générales</CardTitle>
                <CardDescription>Modifiez les détails affichés sur l'écosystème</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du site</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">URL cible</Label>
                  <Input id="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-start gap-4">
                  <img src={site.logoUrl} alt={site.name} className="h-20 w-20 rounded-xl border bg-muted/20 object-contain p-3" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold">
                        {ECOSYSTEM_SITE_CATEGORY_LABELS[site.category]}
                      </span>
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${getEcosystemSiteStatusBadge(site.status)}`}>
                        {ECOSYSTEM_SITE_STATUS_LABELS[site.status]}
                      </span>
                    </div>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      <Globe className="h-4 w-4" />
                      {site.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">À propos</h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{site.description}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Variantes du logo */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                Variantes du Logo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Object.entries(site.logoVariants).map(([key, url]) => {
                  const isDarkBg = key === "mw" || key === "dw";
                  const isLandscape = key === "dc" || key === "dw";

                  return (
                    <div
                      key={key}
                      className={`flex flex-col items-center justify-between rounded-lg border p-4 transition-colors ${isDarkBg ? "bg-slate-900 border-slate-800" : "bg-muted/10 border-border"
                        }`}
                    >
                      <div className="flex h-20 w-full items-center justify-center p-2">
                        <img
                          src={url}
                          alt={key}
                          className={isLandscape ? "h-16 w-full object-contain" : "h-12 w-12 object-contain"}
                        />
                      </div>
                      <span className={`mt-2 text-[11px] font-mono font-medium uppercase ${isDarkBg ? "text-slate-400" : "text-muted-foreground"
                        }`}>
                        {key}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne Secondaire (Droite - 1/3) */}
        <div className="space-y-6">
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logo_key">Clé du logo</Label>
                  <Input id="logo_key" value={form.logo_key} onChange={(e) => setForm({ ...form, logo_key: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as EcosystemSiteCategory })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ECOSYSTEM_SITE_CATEGORY_LABELS).map(([k, l]) => (
                        <SelectItem key={k} value={k}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as EcosystemSiteStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="building">En construction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  Métadonnées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-1 border-b text-xs">
                  <span className="text-muted-foreground">Clé Logo</span>
                  <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-[11px]">{site.logoKey}</code>
                </div>
                <div className="flex items-center justify-between py-1 border-b text-xs">
                  <span className="text-muted-foreground">Catégorie</span>
                  <span className="font-medium">{ECOSYSTEM_SITE_CATEGORY_LABELS[site.category]}</span>
                </div>
                <div className="flex items-center justify-between py-1 text-xs">
                  <span className="text-muted-foreground">Statut</span>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${getEcosystemSiteStatusBadge(site.status)}`}>
                    {ECOSYSTEM_SITE_STATUS_LABELS[site.status]}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Horodatage */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Historique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Création :</span>
                <span className="font-medium text-foreground">{new Date(site.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              <div className="flex justify-between">
                <span>Dernière MAJ :</span>
                <span className="font-medium text-foreground">{new Date(site.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(site.id, {
            onSuccess: () => {
              toast.success("Site supprimé");
              navigate({ to: "/ecosystem" });
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${site.name}" ?`}
      />
    </div>
  );
}