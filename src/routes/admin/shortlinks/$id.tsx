import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Save, X, Loader2, MousePointerClick, Globe, MonitorSmartphone, Copy, Check } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AdminShell } from "@/components/site/AdminShell";
import { ConfirmDelete } from "@/components/site/AdminBits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useAdminShortLinkDetail, useUpdateAdminShortLink, useDeleteAdminShortLink, useAdminShortLinkStats,
} from "@/stores/useShortLinksStore";
import { useAdminCategoriesList } from "@/stores/useCategoriesStore";
import { SHORT_LINK_CATEGORIES } from "@/data/shortlinks";
import type { AdminShortLinkPayload } from "@/data/shortlinks";

export const Route = createFileRoute("/admin/shortlinks/$id")({
  head: () => ({ meta: [{ title: "Lien court — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ShortLinkDetail,
});

const pieColors = ["#E07856", "#3C82AB", "#5A9B6E", "#C89A3E", "#8B5CF6"];

function ShortLinkDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const { item: link, isLoading } = useAdminShortLinkDetail(id);
  const { stats } = useAdminShortLinkStats(id);
  const { items: categories } = useAdminCategoriesList({ perPage: 100 });
  const updateMutation = useUpdateAdminShortLink();
  const removeMutation = useDeleteAdminShortLink();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<AdminShortLinkPayload | null>(null);
  const [toDelete, setToDelete] = useState(false);
  const [copied, setCopied] = useState(false);

  const startEdit = () => {
    if (!link) return;
    setForm({
      long_url: link.longUrl,
      alias: link.alias,
      category: link.category,
      is_active: link.isActive,
      activate_at: link.activateAt ? link.activateAt.slice(0, 10) : "",
      expires_at: link.expiresAt ? link.expiresAt.slice(0, 10) : "",
    });
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
        </div>
      </AdminShell>
    );
  }

  if (!link) {
    return (
      <AdminShell>
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/shortlinks" })}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
        </div>
        <p className="text-muted-foreground">Lien introuvable.</p>
      </AdminShell>
    );
  }

  const handleSave = () => {
    if (!form) return;
    updateMutation.mutate({ id: link.id, payload: form }, {
      onSuccess: () => { toast.success("Lien modifié"); setIsEditing(false); },
      onError: () => toast.error("Erreur lors de la modification"),
    });
  };

  const copy = () => {
    navigator.clipboard.writeText(link.shortUrl);
    setCopied(true);
    toast.success("Lien copié");
    setTimeout(() => setCopied(false), 2000);
  };

  const byDay = (stats?.byDay ?? []).map((d) => ({ day: d.day.slice(5), value: d.total }));
  const byDevice = (stats?.byDevice ?? []).map((d) => ({ name: d.device, value: d.total }));
  const byCountry = (stats?.byCountry ?? []).map((d) => ({ name: d.country, value: d.total }));
  const byCity = (stats?.byCity ?? []).map((d) => ({ name: d.city, value: d.total }));
  const byBrowser = (stats?.byBrowser ?? []).map((d) => ({ name: d.browser, value: d.total }));
  const history = stats?.history ?? [];

  // Correspondance catégorie + couleur
  const matchedCategory = categories.find(
    (c) => c.slug === link.category || c.id === link.category || c.name.toLowerCase() === link.category.toLowerCase()
  );
  const categoryFallback = SHORT_LINK_CATEGORIES.find((c) => c.value === link.category)?.label ?? link.category;
  const categoryColorClass = matchedCategory?.colorClass || "bg-slate-100 text-slate-700";
  const categoryLabel = matchedCategory?.name || categoryFallback;

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/admin/shortlinks" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4 mr-1" /> Annuler
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-1" /> Enregistrer
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={startEdit}>
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
        <div className="rounded-2xl border bg-card p-6">
          {isEditing && form ? (
            <div className="space-y-4">
              <div>
                <Label>URL longue</Label>
                <Input value={form.long_url} onChange={(e) => setForm({ ...form, long_url: e.target.value })} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Alias</Label>
                  <Input value={form.alias} onChange={(e) => setForm({ ...form, alias: e.target.value })} />
                </div>

                <div>
                  <Label>Catégorie</Label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {SHORT_LINK_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
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
                <Switch checked={!!form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase text-muted-foreground">Alias</div>
                {/* L'alias est maintenant un lien qui ouvre shortUrl */}
                <a
                  href={link.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-display text-2xl font-bold text-primary hover:underline"
                >
                  /{link.alias}
                </a>
                <a href={link.longUrl} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-muted-foreground hover:underline break-all">
                  ↳ {link.longUrl}
                </a>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>Catégorie</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${categoryColorClass}`}>
                    {categoryLabel}
                  </span>
                  <span>· Actif <b className="text-foreground">{link.isActive ? "Oui" : "Non"}</b></span>
                  {link.expiresAt && <span>· Expire le <b className="text-foreground">{link.expiresAt.slice(0, 10)}</b></span>}
                </div>
              </div>
              <Button onClick={copy} variant={copied ? "outline" : "default"}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1 text-emerald-600" /> Copié !
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" /> Copier
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-card p-4 flex items-center gap-3">
            <MousePointerClick className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Total clics</div>
              <div className="text-xl font-bold">{stats?.totalClicks ?? link.clicksCount}</div>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-4 flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Pays différents</div>
              <div className="text-xl font-bold">{byCountry.length}</div>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-4 flex items-center gap-3">
            <MonitorSmartphone className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xs text-muted-foreground">Appareils</div>
              <div className="text-xl font-bold">{byDevice.length}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-2xl border bg-card p-6">
            <div className="font-display text-lg font-semibold">Clics par jour</div>
            <div className="mt-4 h-64">
              <ResponsiveContainer>
                <LineChart data={byDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6">
            <div className="font-display text-lg font-semibold">Par appareil</div>
            <div className="mt-4 h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byDevice} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80}>
                    {byDevice.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <div className="font-display text-lg font-semibold">Par navigateur</div>
            <div className="mt-4 h-56">
              <ResponsiveContainer>
                <BarChart data={byBrowser}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#5A9B6E" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <div className="font-display text-lg font-semibold">Par pays</div>
            <div className="mt-4 h-56">
              <ResponsiveContainer>
                <BarChart data={byCountry}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#3C82AB" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <div className="font-display text-lg font-semibold">Top villes</div>
            <div className="mt-4 h-56">
              <ResponsiveContainer>
                <BarChart data={byCity} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={11} width={100} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#C89A3E" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <div className="font-display text-lg font-semibold mb-4">Historique des clics</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Pays</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Device</th>
                  <th className="px-3 py-2 text-left">Navigateur</th>
                  <th className="px-3 py-2 text-left">Referer</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">Aucun clic pour le moment.</td></tr>
                ) : (
                  history.map((c, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2 text-xs">{new Date(c.clicked_at).toLocaleString()}</td>
                      <td className="px-3 py-2">{c.country ?? "—"}</td>
                      <td className="px-3 py-2">{c.city ?? "—"}</td>
                      <td className="px-3 py-2">{c.device}</td>
                      <td className="px-3 py-2">{c.browser}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{c.referer ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDelete
        open={toDelete}
        onOpenChange={setToDelete}
        onConfirm={() => {
          removeMutation.mutate(link.id, {
            onSuccess: () => { toast.success("Lien supprimé"); navigate({ to: "/admin/shortlinks" }); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${link.alias}" ?`}
      />
    </AdminShell>
  );
}