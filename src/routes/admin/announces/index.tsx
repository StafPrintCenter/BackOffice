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
import { useAdminAnnouncementsList, useCreateAdminAnnouncement, useDeleteAdminAnnouncement } from "@/stores/useAnnouncementsStore";
import type { APIAdminAnnouncement, AdminAnnouncementPayload, AnnouncementType, AnnouncementPosition, AnnouncementStyle, } from "@/data/announcements";
import { ANNOUNCEMENT_TYPE_LABELS, ANNOUNCEMENT_POSITION_LABELS, ANNOUNCEMENT_STYLE_LABELS, getAnnouncementStyleBadge, } from "@/data/announcements";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/announces/")({
  head: () => ({
    meta: [
      { title: `Annonces | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminAnnouncements,
});

const schema = z.object({
  type: z.enum(["banner", "popup", "toast", "modal"]),
  position: z.enum(["top", "bottom", "top-left", "top-right", "bottom-left", "bottom-right", "center"]),
  style: z.enum(["info", "success", "warning", "danger", "neutral"]).optional(),
  title: z.string().trim().min(2).max(255),
  message: z.string().trim().min(2).max(2000),
  icon: z.string().trim().max(100).optional(),
  isClosable: z.boolean(),
  priority: z.number().int().optional(),
  isEnabled: z.boolean(),
  publishedAt: z.string().optional(),
  expiresAt: z.string().optional(),
  targetPages: z.string().optional(), // saisie brute, une page par ligne
  actionLabel: z.string().optional(),
  actionType: z.enum(["link", "route", "dismiss"]).optional(),
  actionUrl: z.string().optional(),
  actionTarget: z.enum(["_self", "_blank"]).optional(),
});
type FormValues = z.infer<typeof schema>;

const empty: FormValues = {
  type: "banner",
  position: "top",
  style: undefined,
  title: "",
  message: "",
  icon: "",
  isClosable: true,
  priority: undefined,
  isEnabled: true,
  publishedAt: "",
  expiresAt: "",
  targetPages: "",
  actionLabel: "",
  actionType: "link",
  actionUrl: "",
  actionTarget: "_self",
};

function statusBadge(a: APIAdminAnnouncement) {
  if (!a.isEnabled) return "bg-muted text-muted-foreground";
  return a.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600";
}
function statusLabel(a: APIAdminAnnouncement) {
  if (!a.isEnabled) return "Désactivée";
  return a.isActive ? "Active" : "En attente";
}

function AdminAnnouncements() {
  const navigate = useNavigate();
  const { items, isLoading } = useAdminAnnouncementsList({ perPage: 100 });

  const createMutation = useCreateAdminAnnouncement();
  const removeMutation = useDeleteAdminAnnouncement();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<APIAdminAnnouncement | null>(null);

  const openCreate = () => { setForm(empty); setErrors({}); setOpen(true); };

  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }

    const v = parsed.data;

    const targetPages = (v.targetPages ?? "")
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);

    const action = v.actionLabel?.trim()
      ? JSON.stringify({
        label: v.actionLabel.trim(),
        type: v.actionType ?? "link",
        url: v.actionUrl?.trim() || undefined,
        target: v.actionTarget ?? "_self",
      })
      : undefined;

    const payload: AdminAnnouncementPayload = {
      type: v.type as AnnouncementType,
      position: v.position as AnnouncementPosition,
      style: v.style as AnnouncementStyle | undefined,
      title: v.title,
      message: v.message,
      icon: v.icon || undefined,
      action,
      is_closable: v.isClosable,
      priority: v.priority,
      is_enabled: v.isEnabled,
      published_at: v.publishedAt ? new Date(v.publishedAt).toISOString() : undefined,
      expires_at: v.expiresAt ? new Date(v.expiresAt).toISOString() : undefined,
      target_pages: targetPages.length > 0 ? targetPages : undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: () => { toast.success("Annonce créée"); setOpen(false); },
      onError: () => toast.error("Erreur lors de la création"),
    });
  };

  return (
    <AdminShell>
      <PageHeader title="Annonces" description="Bannières, pop-ups et notifications affichées sur le site." />
      <DataTable<APIAdminAnnouncement>
        data={items}
        isLoading={isLoading}
        searchKeys={["title", "message", "type"]}
        onCreate={openCreate}
        onView={(r) => navigate({ to: "/admin/announces/$id", params: { id: r.id } })}
        onDelete={(r) => setToDelete(r)}
        columns={[
          {
            key: "title",
            label: "Titre",
            render: (r) => (
              <div>
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{r.message}</div>
              </div>
            ),
          },
          {
            key: "type",
            label: "Type",
            render: (r) => (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                {ANNOUNCEMENT_TYPE_LABELS[r.type]}
              </span>
            ),
          },
          {
            key: "position",
            label: "Position",
            render: (r) => <span className="text-xs">{ANNOUNCEMENT_POSITION_LABELS[r.position]}</span>,
          },
          {
            key: "style",
            label: "Style",
            render: (r) => (
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getAnnouncementStyleBadge(r.style)}`}>
                {r.style ? ANNOUNCEMENT_STYLE_LABELS[r.style] : "—"}
              </span>
            ),
          },
          {
            key: "priority",
            label: "Priorité",
            render: (r) => <span className="text-xs font-mono">{r.priority}</span>,
          },
          {
            key: "status",
            label: "Statut",
            render: (r) => (
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(r)}`}>
                {statusLabel(r)}
              </span>
            ),
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nouvelle annonce</DialogTitle></DialogHeader>
          <div className="space-y-4">
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
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label>Message</Label>
              <Textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Icône (optionnel)</Label>
                <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Ex : megaphone" />
              </div>
              <div>
                <Label>Priorité (optionnel)</Label>
                <Input
                  type="number"
                  value={form.priority ?? ""}
                  onChange={(e) => setForm({ ...form, priority: e.target.value === "" ? undefined : Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Publiée le (optionnel)</Label>
                <Input type="datetime-local" value={form.publishedAt} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} />
              </div>
              <div>
                <Label>Expire le (optionnel)</Label>
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
              <Label>Pages ciblées (optionnel, une par ligne — vide = toutes les pages)</Label>
              <Textarea
                rows={3}
                value={form.targetPages}
                onChange={(e) => setForm({ ...form, targetPages: e.target.value })}
                placeholder={"/\n/formations/*"}
              />
            </div>

            <div className="space-y-3 rounded-lg border p-3">
              <Label className="text-xs text-muted-foreground">Bouton d'action (optionnel)</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="Libellé (ex : En savoir plus)"
                  value={form.actionLabel}
                  onChange={(e) => setForm({ ...form, actionLabel: e.target.value })}
                />
                <select
                  value={form.actionType}
                  onChange={(e) => setForm({ ...form, actionType: e.target.value as FormValues["actionType"] })}
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
                  onChange={(e) => setForm({ ...form, actionTarget: e.target.value as FormValues["actionTarget"] })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="_self">Même onglet</option>
                  <option value="_blank">Nouvel onglet</option>
                </select>
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
            onSuccess: () => { toast.success("Annonce supprimée"); setToDelete(null); },
            onError: () => toast.error("Erreur lors de la suppression"),
          });
        }}
        title={`Supprimer "${toDelete?.title}" ?`}
      />
    </AdminShell>
  );
}