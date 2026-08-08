import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, BarChart3, Eye, MousePointerClick, XCircle, Plus, Globe, Calendar, Layers, Sparkles, } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, } from "recharts";
import { ConfirmDelete } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAdminAnnouncementDetail, useUpdateAdminAnnouncement, useDeleteAdminAnnouncement, useAdminAnnouncementAnalytics, } from "@/stores/useAnnouncementsStore";
import type { AnnouncementType, AnnouncementPosition, AnnouncementStyle, AnnouncementActionType, } from "@/data/announcements";
import { ANNOUNCEMENT_TYPE_LABELS, ANNOUNCEMENT_POSITION_LABELS, ANNOUNCEMENT_STYLE_LABELS, getAnnouncementStyleBadge, ANNOUNCEMENT_EVENT_LABELS, ANNOUNCEMENT_EVENT_BADGES, } from "@/data/announcements";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/announces/$id")({
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
  targetPages: string[];
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
    targetPages: Array.isArray(a.targetPages) ? [...a.targetPages] : [],
    actionLabel: a.action?.label ?? "",
    actionType: a.action?.type ?? "link",
    actionUrl: a.action?.url ?? "",
    actionTarget: a.action?.target ?? "_self",
  };
}

function formatDay(day: string) {
  return new Date(day).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short", });
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
    if (announcement && !isEditing) {
      setForm(toEditForm(announcement));
    }
  }, [announcement, isEditing]);

  // Pivotement des données pour Recharts (regroupement par date pour les 3 métriques)
  const chartData = useMemo(() => {
    if (!analytics?.byDay) return [];

    const daysMap = new Map<string, { date: string; view: number; click: number; close: number }>();

    analytics.byDay.forEach((row) => {
      const dateFormatted = formatDay(row.day);
      if (!daysMap.has(row.day)) {
        daysMap.set(row.day, {
          date: dateFormatted,
          view: 0,
          click: 0,
          close: 0,
        });
      }
      const current = daysMap.get(row.day)!;
      if (row.event_type === "view") current.view += row.total;
      else if (row.event_type === "click") current.click += row.total;
      else if (row.event_type === "close") current.close += row.total;
    });

    return Array.from(daysMap.entries())
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([, data]) => data);
  }, [analytics]);

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      </>
    );
  }

  if (!announcement || !form) {
    return (
      <>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/announces" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Annonce introuvable.</p>
      </>
    );
  }

  const handleCancel = () => {
    setForm(toEditForm(announcement));
    setIsEditing(false);
  };

  /* Helper fonctions pour la liste dynamique de pages ciblées */
  const handleAddTargetPage = () => {
    setForm({ ...form, targetPages: [...form.targetPages, ""] });
  };

  const handleUpdateTargetPage = (index: number, value: string) => {
    const updated = [...form.targetPages];
    updated[index] = value;
    setForm({ ...form, targetPages: updated });
  };

  const handleRemoveTargetPage = (index: number) => {
    setForm({
      ...form,
      targetPages: form.targetPages.filter((_, i) => i !== index),
    });
  };

  const handleSave = () => {
    const cleanedTargetPages = form.targetPages
      .map((p) => p.trim())
      .filter(Boolean);

    const action = form.actionLabel.trim()
      ? {
        label: form.actionLabel.trim(),
        type: form.actionType,
        url: form.actionUrl.trim() || undefined,
        target: form.actionTarget,
      }
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
          action: action ? JSON.stringify(action) : undefined,
          is_closable: form.isClosable,
          priority: form.priority === "" ? undefined : Number(form.priority),
          is_enabled: form.isEnabled,
          published_at: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
          expires_at: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
          target_pages: cleanedTargetPages.length > 0 ? cleanedTargetPages : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Annonce modifiée");
          setIsEditing(false);
        },
        onError: () => toast.error("Erreur lors de la modification"),
      }
    );
  };

  return (
    <>
      {/* Action Bar supérieure */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/announces" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" /> Annuler
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Enregistrer
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-1" /> Modifier
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => setToDelete(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Grille principale à 2 colonnes */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne Principale (Gauche - 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {isEditing ? (
            <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <Pencil className="h-4 w-4 text-primary" /> Contenu de l'annonce
              </h2>

              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Offre promotionnelle de printemps"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Saisissez le texte complet de votre annonce..."
                />
              </div>

              {/* Liste dynamique pour Pages ciblées */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" /> Pages ciblées
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTargetPage}
                    className="h-8 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter une page
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Laissez vide pour afficher l'annonce sur l'ensemble du site.
                </p>

                {form.targetPages.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                    Aucune page ciblée (Affichage sur toutes les pages)
                  </div>
                ) : (
                  <div className="space-y-2">
                    {form.targetPages.map((page, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={page}
                          onChange={(e) => handleUpdateTargetPage(index, e.target.value)}
                          placeholder="Ex: /formations ou /contact"
                          className="text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveTargetPage(index)}
                          className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Titre de l'annonce
                </span>
                <h1 className="font-display text-2xl font-bold mt-1">{announcement.title}</h1>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Message
                </span>
                <p className="mt-2 whitespace-pre-wrap text-foreground/90 leading-relaxed bg-muted/30 p-4 rounded-xl border">
                  {announcement.message}
                </p>
              </div>

              {/* Badges d'état et filtres */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {ANNOUNCEMENT_TYPE_LABELS[announcement.type]}
                </span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                  {ANNOUNCEMENT_POSITION_LABELS[announcement.position]}
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getAnnouncementStyleBadge(
                    announcement.style
                  )}`}
                >
                  {announcement.style ? ANNOUNCEMENT_STYLE_LABELS[announcement.style] : "Sans style"}
                </span>
              </div>

              {/* Pages ciblées en mode lecture */}
              <div className="pt-2 border-t">
                <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> Pages ciblées
                </div>
                {announcement.targetPages?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {announcement.targetPages.map((page, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-mono"
                      >
                        {page}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Toutes les pages</span>
                )}
              </div>
            </div>
          )}

          {/* Module d'analyses & Engagement */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 font-display text-lg font-semibold">
              <BarChart3 className="h-5 w-5 text-primary" /> Analyses & Engagement
            </div>
            {analytics ? (
              <div className="space-y-6">
                {/* Métriques globales */}
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
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

                {/* Graphique temporel par jour et par événement */}
                {chartData.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Évolution quotidienne des événements
                    </div>
                    <div className="h-64 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              borderColor: "hsl(var(--border))",
                              borderRadius: "0.5rem",
                              fontSize: "12px",
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                          <Line
                            type="monotone"
                            dataKey="view"
                            name="Vues"
                            stroke="#0284c7"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="click"
                            name="Clics"
                            stroke="#059669"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="close"
                            name="Fermetures"
                            stroke="#6b7280"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
                    Aucune donnée historique à afficher pour la période.
                  </div>
                )}

                {/* Liste synthétique par jour */}
                {analytics.byDay.length > 0 && (
                  <div className="divide-y rounded-xl border">
                    {analytics.byDay.map((row, i) => (
                      <div
                        key={`${row.day}-${row.event_type}-${i}`}
                        className="flex items-center justify-between p-3 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{formatDay(row.day)}</span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${ANNOUNCEMENT_EVENT_BADGES[row.event_type]
                              }`}
                          >
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
              <div className="text-sm text-muted-foreground flex items-center gap-2 py-4">
                <Loader2 className="h-4 w-4 animate-spin text-primary" /> Chargement des analyses...
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Droite (1/3) */}
        <div className="space-y-6">
          {/* Métadonnées & Paramètres */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-5">
            <h3 className="font-display font-semibold text-base flex items-center gap-2 border-b pb-3">
              <Layers className="h-4 w-4 text-primary" /> Configuration
            </h3>

            {isEditing ? (
              <div className="space-y-4 text-sm">
                <div>
                  <Label>Type</Label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as AnnouncementType })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  >
                    {Object.entries(ANNOUNCEMENT_TYPE_LABELS).map(([k, l]) => (
                      <option key={k} value={k}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Position</Label>
                  <select
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value as AnnouncementPosition })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  >
                    {Object.entries(ANNOUNCEMENT_POSITION_LABELS).map(([k, l]) => (
                      <option key={k} value={k}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Style</Label>
                  <select
                    value={form.style ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        style: (e.target.value || undefined) as AnnouncementStyle | undefined,
                      })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  >
                    <option value="">- Aucun -</option>
                    {Object.entries(ANNOUNCEMENT_STYLE_LABELS).map(([k, l]) => (
                      <option key={k} value={k}>{l}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                  <div>
                    <Label>Icône</Label>
                    <Input
                      value={form.icon}
                      onChange={(e) => setForm({ ...form, icon: e.target.value })}
                      placeholder="Ex: Sparkles"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Priorité</Label>
                    <Input
                      type="number"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Annonce active</Label>
                    <Switch
                      checked={form.isEnabled}
                      onCheckedChange={(v) => setForm({ ...form, isEnabled: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="cursor-pointer">Fermable par l'utilisateur</Label>
                    <Switch
                      checked={form.isClosable}
                      onCheckedChange={(v) => setForm({ ...form, isClosable: v })}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${announcement.isEnabled
                      ? announcement.isActive
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-amber-500/10 text-amber-600"
                      : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {announcement.isEnabled
                      ? announcement.isActive
                        ? "Active"
                        : "En attente"
                      : "Désactivée"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Priorité</span>
                  <span className="font-medium">{announcement.priority ?? 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Icône</span>
                  <span className="font-mono text-xs">{announcement.icon || "-"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fermable</span>
                  <span className="font-medium">{announcement.isClosable ? "Oui" : "Non"}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Créé par</span>
                  <span className="font-medium">{announcement.createdBy ?? "Admin"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Dates & Programmation */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-display font-semibold text-base flex items-center gap-2 border-b pb-3">
              <Calendar className="h-4 w-4 text-primary" /> Publication
            </h3>

            {isEditing ? (
              <div className="space-y-4 text-sm">
                <div>
                  <Label>Publiée le</Label>
                  <Input
                    type="datetime-local"
                    value={form.publishedAt}
                    onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Expire le</Label>
                  <Input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Publiée le</div>
                  <div className="mt-0.5 font-medium">
                    {announcement.publishedAt
                      ? new Date(announcement.publishedAt).toLocaleString("fr-FR")
                      : "Immédiatement"}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground">Expire le</div>
                  <div className="mt-0.5 font-medium">
                    {announcement.expiresAt
                      ? new Date(announcement.expiresAt).toLocaleString("fr-FR")
                      : "Jamais"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action / Call to Action */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-display font-semibold text-base flex items-center gap-2 border-b pb-3">
              <Sparkles className="h-4 w-4 text-primary" /> Bouton d'action
            </h3>

            {isEditing ? (
              <div className="space-y-3 text-sm">
                <div>
                  <Label>Libellé</Label>
                  <Input
                    placeholder="Ex: En savoir plus"
                    value={form.actionLabel}
                    onChange={(e) => setForm({ ...form, actionLabel: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Type d'action</Label>
                  <select
                    value={form.actionType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        actionType: e.target.value as AnnouncementActionType,
                      })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  >
                    <option value="link">Lien externe</option>
                    <option value="route">Route interne</option>
                    <option value="dismiss">Fermer l'annonce</option>
                  </select>
                </div>

                <div>
                  <Label>URL ou Route</Label>
                  <Input
                    placeholder="Ex: /contact ou https://..."
                    value={form.actionUrl}
                    onChange={(e) => setForm({ ...form, actionUrl: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Cible</Label>
                  <select
                    value={form.actionTarget}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        actionTarget: e.target.value as "_self" | "_blank",
                      })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  >
                    <option value="_self">Même onglet (_self)</option>
                    <option value="_blank">Nouvel onglet (_blank)</option>
                  </select>
                </div>
              </div>
            ) : announcement.action ? (
              <div className="space-y-2 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Bouton</Label>
                  <div className="font-medium">{announcement.action.label}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  <div className="font-medium capitalize">{announcement.action.type}</div>
                </div>
                {announcement.action.url && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Destination</Label>
                    <div>
                      <a
                        href={announcement.action.url}
                        target={announcement.action.target ?? "_self"}
                        rel="noreferrer"
                        className="text-xs text-primary underline break-all"
                      >
                        {announcement.action.url}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic">Aucune action configurée</div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(announcement.id, {
            onSuccess: () => {
              toast.success("Annonce supprimée");
              navigate({ to: "/announces" });
            },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${announcement.title}" ?`}
      />
    </>
  );
}