import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, BarChart3, Eye, MousePointerClick, XCircle } from "lucide-react";
import { AdminShell, ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdminAnnouncementDetail, useUpdateAdminAnnouncement, useDeleteAdminAnnouncement, useAdminAnnouncementAnalytics } from "@/stores/useAnnouncementsStore";
import type { AnnouncementType, AnnouncementPosition, AnnouncementStyle, AnnouncementActionType } from "@/data/announcements";
import {
  ANNOUNCEMENT_TYPE_LABELS, ANNOUNCEMENT_POSITION_LABELS, ANNOUNCEMENT_STYLE_LABELS, getAnnouncementStyleBadge,
  ANNOUNCEMENT_EVENT_LABELS, ANNOUNCEMENT_EVENT_BADGES,
} from "@/data/announcements";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/announces/$id")({
  head: () => ({
    meta: [
      { title: `Annonce | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AnnouncementDetail,
});

interface EditForm {
  type: AnnouncementType;
  position: AnnouncementPosition;
  style?: AnnouncementStyle;
  title: string;
  message: string;
  icon: string;
  isClosable: boolean;
  priority: string;
  isEnabled: boolean;
  publishedAt: string;
  expiresAt: string;
  targetPages: string;
  actionLabel: string;
  actionType: AnnouncementActionType;
  actionUrl: string;
  actionTarget: "_self" | "_blank";
}

function toEditForm(a: NonNullable<ReturnType<typeof useAdminAnnouncementDetail>["item"]>): EditForm {
  return {
    type: a.type,
    position: a.position,
    style: a.style ?? undefined,
    title: a.title,
    message: a.message,
    icon: a.icon ?? "",
    isClosable: a.isClosable,
    priority: String(a.priority ?? ""),
    isEnabled: a.isEnabled,
    publishedAt: a.publishedAt ? a.publishedAt.slice(0, 16) : "",
    expiresAt: a.expiresAt ? a.expiresAt.slice(0, 16) : "",
    targetPages: Array.isArray(a.targetPages) ? a.targetPages.join("\n") : "",
    actionLabel: a.action?.label ?? "",
    actionType: a.action?.type ?? "link",
    actionUrl: a.action?.url ?? "",
    actionTarget: a.action?.target ?? "_self",
  };
}

function formatDay(day: string) {
  return new Date(day).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
}

function AnnouncementDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: announcement, isLoading } = useAdminAnnouncementDetail(id);
  const { analytics } = useAdminAnnouncementAnalytics(id);
  const updateMutation = useUpdateAdminAnnouncement();
  const removeMutation = useDeleteAdminAnnouncement();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditForm | null>(null);
  const [toDelete, setToDelete] = useState(false);

  useEffect(() => {
    if (announcement && !form) setForm(toEditForm(announcement));
  }, [announcement, form]);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      </AdminShell>
    );
  }

  if (!announcement || !form) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/announces" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Annonce introuvable.</p>
      </AdminShell>
    );
  }

  const handleCancel = () => {
    setForm(toEditForm(announcement));
    setIsEditing(false);
  };

  const handleSave = () => {
    const targetPages = form.targetPages
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);

    const action = form.actionLabel.trim()
      ? JSON.stringify({
        label: form.actionLabel.trim(),
        type: form.actionType,
        url: form.actionUrl.trim() || undefined,
        target: form.actionTarget,
      })
      : undefined;

    updateMutation.mutate(
      {
        id: announcement.id,
        payload: {
          type: form.type,
          position: form.position,
          style: form.style,
          title: form.title,
          message: form.message,
          icon: form.icon || undefined,
          action,
          is_closable: form.isClosable,
          priority: form.priority === "" ? undefined : Number(form.priority),
          is_enabled: form.isEnabled,
          published_at: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
          expires_at: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
          target_pages: targetPages.length > 0 ? targetPages : undefined,
        },
      },
      {
        onSuccess: () => { toast.success("Annonce modifiée"); setIsEditing(false); },
        onError: () => toast.error("Erreur lors de la modification"),
      }
    );
  };

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/announces" })}>
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

      <div className="max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-muted px-2 py-0.5 font-medium">{ANNOUNCEMENT_TYPE_LABELS[announcement.type]}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 font-medium">{ANNOUNCEMENT_POSITION_LABELS[announcement.position]}</span>
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-medium ${getAnnouncementStyleBadge(announcement.style)}`}>
            {announcement.style ? ANNOUNCEMENT_STYLE_LABELS[announcement.style] : "Sans style"}
          </span>
          <span className={`rounded-full px-2 py-0.5 font-medium ${announcement.isEnabled ? (announcement.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600") : "bg-muted text-muted-foreground"}`}>
            {announcement.isEnabled ? (announcement.isActive ? "Active" : "En attente") : "Désactivée"}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5">Priorité {announcement.priority}</span>
          <span className="rounded-full bg-muted px-2 py-0.5">Par {announcement.createdBy}</span>
        </div>

        {isEditing ? (
          <div className="space-y-4 rounded-2xl border bg-card p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Type</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as AnnouncementType })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {Object.entries(ANNOUNCEMENT_TYPE_LABELS).map(([k, l]) => (<option key={k} value={k}>{l}</option>))}
                </select>
              </div>
              <div>
                <Label>Position</Label>
                <select
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value as AnnouncementPosition })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {Object.entries(ANNOUNCEMENT_POSITION_LABELS).map(([k, l]) => (<option key={k} value={k}>{l}</option>))}
                </select>
              </div>
              <div>
                <Label>Style</Label>
                <select
                  value={form.style ?? ""}
                  onChange={(e) => setForm({ ...form, style: (e.target.value || undefined) as AnnouncementStyle | undefined })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— Aucun —</option>
                  {Object.entries(ANNOUNCEMENT_STYLE_LABELS).map(([k, l]) => (<option key={k} value={k}>{l}</option>))}
                </select>
              </div>
            </div>

            <div>
              <Label>Titre</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            <div>
              <Label>Message</Label>
              <Textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Icône</Label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
              </div>
              <div>
                <Label>Priorité</Label>
                <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
              </div>
              <div>
                <Label>Publiée le</Label>
                <Input type="datetime-local" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} />
              </div>
              <div>
                <Label>Expire le</Label>
                <Input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <Label className="cursor-pointer">Fermable</Label>
                <Switch checked={form.isClosable} onCheckedChange={(v) => setForm({ ...form, isClosable: v })} />
              </div>
              <div className="flex items-center gap-3">
                <Label className="cursor-pointer">Activée</Label>
                <Switch checked={form.isEnabled} onCheckedChange={(v) => setForm({ ...form, isEnabled: v })} />
              </div>
            </div>

            <div>
              <Label>Pages ciblées (une par ligne — vide = toutes les pages)</Label>
              <Textarea
                rows={3}
                value={form.targetPages}
                onChange={(e) => setForm({ ...form, targetPages: e.target.value })}
              />
            </div>

            <div className="space-y-3 rounded-lg border p-3">
              <Label className="text-xs text-muted-foreground">Bouton d'action (optionnel)</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Libellé"
                  value={form.actionLabel}
                  onChange={(e) => setForm({ ...form, actionLabel: e.target.value })}
                />
                <select
                  value={form.actionType}
                  onChange={(e) => setForm({ ...form, actionType: e.target.value as AnnouncementActionType })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="link">Lien</option>
                  <option value="route">Route interne</option>
                  <option value="dismiss">Fermer</option>
                </select>
                <Input
                  placeholder="URL"
                  value={form.actionUrl}
                  onChange={(e) => setForm({ ...form, actionUrl: e.target.value })}
                />
                <select
                  value={form.actionTarget}
                  onChange={(e) => setForm({ ...form, actionTarget: e.target.value as "_self" | "_blank" })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="_self">Même onglet</option>
                  <option value="_blank">Nouvel onglet</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold">{announcement.title}</h1>
            <p className="whitespace-pre-wrap text-muted-foreground">{announcement.message}</p>

            <div className="grid gap-4 rounded-2xl border bg-card p-6 sm:grid-cols-2">
              <div>
                <div className="text-xs font-medium text-muted-foreground">Icône</div>
                <div className="mt-0.5 text-sm">{announcement.icon || "—"}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">Fermable</div>
                <div className="mt-0.5 text-sm">{announcement.isClosable ? "Oui" : "Non"}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">Publiée le</div>
                <div className="mt-0.5 text-sm">
                  {announcement.publishedAt ? new Date(announcement.publishedAt).toLocaleString("fr-FR") : "—"}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground">Expire le</div>
                <div className="mt-0.5 text-sm">
                  {announcement.expiresAt ? new Date(announcement.expiresAt).toLocaleString("fr-FR") : "—"}
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs font-medium text-muted-foreground">Pages ciblées</div>
                <div className="mt-0.5 text-sm">
                  {announcement.targetPages?.length ? announcement.targetPages.join(", ") : "Toutes les pages"}
                </div>
              </div>
              {announcement.action && (
                <div className="sm:col-span-2">
                  <div className="text-xs font-medium text-muted-foreground">Action</div>
                  <div className="mt-0.5 text-sm">
                    {announcement.action.label} ({announcement.action.type}
                    {announcement.action.url ? ` → ${announcement.action.url}` : ""})
                  </div>
                </div>
              )}
            </div>

            {/* Analyses */}
            <div className="rounded-2xl border bg-card p-6">
              <div className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
                <BarChart3 className="h-5 w-5 text-primary" /> Analyses
              </div>
              {analytics ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="flex items-center gap-2.5 rounded-xl border bg-muted/20 p-3">
                      <Eye className="h-4 w-4 text-sky-600 shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">Vues</div>
                        <div className="text-sm font-semibold">{analytics.views}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-xl border bg-muted/20 p-3">
                      <MousePointerClick className="h-4 w-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">Clics</div>
                        <div className="text-sm font-semibold">{analytics.clicks}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-xl border bg-muted/20 p-3">
                      <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">Fermetures</div>
                        <div className="text-sm font-semibold">{analytics.closes}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 rounded-xl border bg-muted/20 p-3">
                      <BarChart3 className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">Taux de clic</div>
                        <div className="text-sm font-semibold">{analytics.clickThroughRate}%</div>
                      </div>
                    </div>
                  </div>

                  {analytics.byDay.length > 0 && (
                    <div className="divide-y rounded-lg border">
                      {analytics.byDay.map((row, i) => (
                        <div key={`${row.day}-${row.event_type}-${i}`} className="flex items-center justify-between p-3 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{formatDay(row.day)}</span>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${ANNOUNCEMENT_EVENT_BADGES[row.event_type]}`}>
                              {ANNOUNCEMENT_EVENT_LABELS[row.event_type]}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-primary">{row.total}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Chargement des analyses...</div>
              )}
            </div>
          </>
        )}
      </div>

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(announcement.id, {
            onSuccess: () => { toast.success("Annonce supprimée"); navigate({ to: "/admin/announces" }); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${announcement.title}" ?`}
      />
    </AdminShell>
  );
}