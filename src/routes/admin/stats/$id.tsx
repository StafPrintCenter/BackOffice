import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, TrendingUp, Key, Calendar, Layers, Hash } from "lucide-react";
import { AdminShell, ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminStatDetail, useUpdateAdminStat, useDeleteAdminStat } from "@/stores/useStatsStore";
import { STAT_KEYS, type AdminStatPayload, type StatKeyType } from "@/data/stats";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/stats/$id")({
  head: () => ({
    meta: [
      { title: `Statistique | ${SITE.name}` },
      { name: "robots", content: "noindex" }]
  }),
  component: StatDetail,
});

function StatDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: stat, isLoading } = useAdminStatDetail(id);
  const updateMutation = useUpdateAdminStat();
  const removeMutation = useDeleteAdminStat();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminStatPayload | null>(null);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    if (stat && !form) {
      setForm({
        key: stat.key,
        value: stat.value,
        suffix: stat.suffix,
        label: stat.label,
      });
    }
  }, [stat, form]);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      </AdminShell>
    );
  }

  if (!stat || !form) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/stats" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </div>
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          Statistique introuvable.
        </div>
      </AdminShell>
    );
  }

  const handleSave = () => {
    updateMutation.mutate({ id: stat.id, payload: form }, {
      onSuccess: () => { toast.success("Statistique modifiée"); setIsEditing(false); },
      onError: () => toast.error("Erreur lors de la modification"),
    });
  };

  const handleCancel = () => {
    setForm({
      key: stat.key,
      value: stat.value,
      suffix: stat.suffix,
      label: stat.label,
    });
    setIsEditing(false);
  };

  const currentKeyLabel = STAT_KEYS.find((k) => k.value === (isEditing ? form.key : stat.key))?.label || (isEditing ? form.key : stat.key);

  return (
    <AdminShell>
      {/* Barre d'action supérieure */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/stats" })}>
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
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Chiffre clé</h2>
            </div>

            <div className="mt-6 space-y-5">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="label">Libellé d'affichage</Label>
                    <Input
                      id="label"
                      value={form.label}
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                      className="mt-1.5"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="value">Valeur numérique</Label>
                      <Input
                        id="value"
                        type="number"
                        value={form.value}
                        onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="suffix">Suffixe (ex: %, +, k, M)</Label>
                      <Input
                        id="suffix"
                        value={form.suffix}
                        onChange={(e) => setForm({ ...form, suffix: e.target.value })}
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border bg-muted/20 p-8 text-center">
                  <div className="font-display text-6xl font-bold tracking-tight text-primary">
                    {stat.value}
                    <span className="text-4xl text-primary/80">{stat.suffix}</span>
                  </div>
                  <div className="mt-3 text-lg font-medium text-foreground">{stat.label}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barre Latérale (1/3) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Configuration Technique */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-3 mb-4">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-semibold">Configuration</h3>
            </div>

            <div className="space-y-4 text-sm">
              {/* Clé de statistique */}
              <div>
                <Label htmlFor="key" className="text-xs text-muted-foreground">Clé d'identification</Label>
                {isEditing ? (
                  <Select value={form.key} onValueChange={(v) => setForm({ ...form, key: v as StatKeyType })}>
                    <SelectTrigger id="key" className="mt-1 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAT_KEYS.map((k) => (
                        <SelectItem key={k.value} value={k.value}>
                          {k.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1 flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium text-foreground">{currentKeyLabel}</span>
                  </div>
                )}
              </div>

              {/* Code de la clé (Badge) */}
              <div>
                <Label className="text-xs text-muted-foreground">Clé système (slug)</Label>
                <div className="mt-1">
                  <code className="inline-block rounded-md bg-muted px-2.5 py-1 text-xs font-mono font-semibold text-foreground">
                    {isEditing ? form.key : stat.key}
                  </code>
                </div>
              </div>
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
                <span>Créée le</span>
                <span className="font-medium text-foreground">
                  {new Date(stat.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Modifiée le</span>
                <span className="font-medium text-foreground">
                  {new Date(stat.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
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
          removeMutation.mutate(stat.id, {
            onSuccess: () => { toast.success("Statistique supprimée"); navigate({ to: "/admin/stats" }); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${stat.label}" ?`}
      />
    </AdminShell>
  );
}