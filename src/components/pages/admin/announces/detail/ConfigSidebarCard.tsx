import { Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { APIAdminAnnouncement, AnnouncementType, AnnouncementPosition, AnnouncementStyle } from "@/data/announcements";
import { ANNOUNCEMENT_TYPE_LABELS, ANNOUNCEMENT_POSITION_LABELS, ANNOUNCEMENT_STYLE_LABELS, EditForm } from "@/data/announcements";

interface AnnouncementConfigSidebarCardProps {
  isEditing: boolean;
  announcement: APIAdminAnnouncement;
  form: EditForm;
  onChangeForm: (form: EditForm) => void;
}

export function AnnouncementConfigSidebarCard({
  isEditing,
  announcement,
  form,
  onChangeForm,
}: AnnouncementConfigSidebarCardProps) {
  return (
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
              onChange={(e) => onChangeForm({ ...form, type: e.target.value as AnnouncementType })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
            >
              {Object.entries(ANNOUNCEMENT_TYPE_LABELS).map(([k, l]) => (<option key={k} value={k}>{l}</option>))}
            </select>
          </div>

          <div>
            <Label>Position</Label>
            <select
              value={form.position}
              onChange={(e) => onChangeForm({ ...form, position: e.target.value as AnnouncementPosition })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
            >
              {Object.entries(ANNOUNCEMENT_POSITION_LABELS).map(([k, l]) => (<option key={k} value={k}>{l}</option>))}
            </select>
          </div>

          <div>
            <Label>Style</Label>
            <select
              value={form.style ?? ""}
              onChange={(e) => onChangeForm({ ...form, style: (e.target.value || undefined) as AnnouncementStyle | undefined })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
            >
              <option value="">- Aucun -</option>
              {Object.entries(ANNOUNCEMENT_STYLE_LABELS).map(([k, l]) => (<option key={k} value={k}>{l}</option>))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t">
            <div>
              <Label>Icône</Label>
              <Input
                value={form.icon}
                onChange={(e) => onChangeForm({ ...form, icon: e.target.value })}
                placeholder="Ex: Sparkles"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Priorité</Label>
              <Input
                type="number"
                value={form.priority}
                onChange={(e) => onChangeForm({ ...form, priority: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="cursor-pointer">Annonce active</Label>
              <Switch checked={form.isEnabled} onCheckedChange={(v) => onChangeForm({ ...form, isEnabled: v })} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="cursor-pointer">Fermable par l'utilisateur</Label>
              <Switch checked={form.isClosable} onCheckedChange={(v) => onChangeForm({ ...form, isClosable: v })} />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Statut</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${announcement.isEnabled ? (announcement.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600") : "bg-muted text-muted-foreground"}`}>
              {announcement.isEnabled ? (announcement.isActive ? "Active" : "En attente") : "Désactivée"}
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
  );
}