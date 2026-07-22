import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, TrendingUp } from "lucide-react";
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
        <p className="text-muted-foreground">Statistique introuvable.</p>
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

  return (
    <AdminShell>
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

      <div className="max-w-2xl space-y-6">
        {isEditing ? (
          <div className="space-y-4 rounded-2xl border bg-card p-6">
            <div>
              <Label>Libellé</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>

            <div>
              <Label>Clé de statistique</Label>
              <Select value={form.key} onValueChange={(v) => setForm({ ...form, key: v as StatKeyType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAT_KEYS.map((k) => (
                    <SelectItem key={k.value} value={k.value}>{k.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Valeur</Label>
                <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Suffixe</Label>
                <Input value={form.suffix} onChange={(e) => setForm({ ...form, suffix: e.target.value })} />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border bg-card p-8 text-center">
              <TrendingUp className="mx-auto h-8 w-8 text-primary" />
              <div className="mt-4 font-display text-6xl font-bold text-primary">{stat.value}{stat.suffix}</div>
              <div className="mt-2 text-lg font-medium">{stat.label}</div>
              <code className="mt-3 inline-block rounded bg-muted px-2.5 py-1 text-xs font-mono">{stat.key}</code>
            </div>

            {/* Encadré des métadonnées de dates */}
            <div className="rounded-2xl border bg-card p-4 text-xs text-muted-foreground flex items-center justify-between">
              <div>
                Créée le : {new Date(stat.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
              <div>
                Modifiée le : {new Date(stat.updatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </>
        )}
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
