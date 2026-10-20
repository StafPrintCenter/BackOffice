import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { APIAdminAnnouncement, AnnouncementActionType, EditForm } from "@/data/announcements";

interface AnnouncementActionSidebarCardProps {
  isEditing: boolean;
  announcement: APIAdminAnnouncement;
  form: EditForm;
  onChangeForm: (form: EditForm) => void;
}

export function AnnouncementActionSidebarCard({
  isEditing,
  announcement,
  form,
  onChangeForm,
}: AnnouncementActionSidebarCardProps) {
  return (
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
              onChange={(e) => onChangeForm({ ...form, actionLabel: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Type d'action</Label>
            <select
              value={form.actionType}
              onChange={(e) => onChangeForm({ ...form, actionType: e.target.value as AnnouncementActionType })}
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
              onChange={(e) => onChangeForm({ ...form, actionUrl: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Cible</Label>
            <select
              value={form.actionTarget}
              onChange={(e) => onChangeForm({ ...form, actionTarget: e.target.value as "_self" | "_blank" })}
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
  );
}