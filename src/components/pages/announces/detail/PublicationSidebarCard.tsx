import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { APIAdminAnnouncement, EditForm } from "@/data/announcements";

interface AnnouncementPublicationSidebarCardProps {
  isEditing: boolean;
  announcement: APIAdminAnnouncement;
  form: EditForm;
  onChangeForm: (form: EditForm) => void;
}

export function AnnouncementPublicationSidebarCard({
  isEditing,
  announcement,
  form,
  onChangeForm,
}: AnnouncementPublicationSidebarCardProps) {
  return (
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
              onChange={(e) => onChangeForm({ ...form, publishedAt: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Expire le</Label>
            <Input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) => onChangeForm({ ...form, expiresAt: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Publiée le</div>
            <div className="mt-0.5 font-medium">
              {announcement.publishedAt ? new Date(announcement.publishedAt).toLocaleString("fr-FR") : "Immédiatement"}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Expire le</div>
            <div className="mt-0.5 font-medium">
              {announcement.expiresAt ? new Date(announcement.expiresAt).toLocaleString("fr-FR") : "Jamais"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}