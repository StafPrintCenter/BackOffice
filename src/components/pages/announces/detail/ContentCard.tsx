import { Pencil, Globe, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { APIAdminAnnouncement } from "@/data/announcements";
import { ANNOUNCEMENT_TYPE_LABELS, ANNOUNCEMENT_POSITION_LABELS, ANNOUNCEMENT_STYLE_LABELS, getAnnouncementStyleBadge, EditForm } from "@/data/announcements";

interface AnnouncementContentCardProps {
  isEditing: boolean;
  announcement: APIAdminAnnouncement;
  form: EditForm;
  onChangeForm: (form: EditForm) => void;
}

export function AnnouncementContentCard({
  isEditing,
  announcement,
  form,
  onChangeForm,
}: AnnouncementContentCardProps) {
  const handleAddTargetPage = () => {
    onChangeForm({ ...form, targetPages: [...form.targetPages, ""] });
  };

  const handleUpdateTargetPage = (index: number, value: string) => {
    const updated = [...form.targetPages];
    updated[index] = value;
    onChangeForm({ ...form, targetPages: updated });
  };

  const handleRemoveTargetPage = (index: number) => {
    onChangeForm({
      ...form,
      targetPages: form.targetPages.filter((_, i) => i !== index),
    });
  };

  if (isEditing) {
    return (
      <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Pencil className="h-4 w-4 text-primary" /> Contenu de l'annonce
        </h2>

        <div>
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => onChangeForm({ ...form, title: e.target.value })}
            placeholder="Ex: Offre promotionnelle de printemps"
          />
        </div>

        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            rows={5}
            value={form.message}
            onChange={(e) => onChangeForm({ ...form, message: e.target.value })}
            placeholder="Saisissez le texte complet de votre annonce..."
          />
        </div>

        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" /> Pages ciblées
            </Label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddTargetPage} className="h-8 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter une page
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Laissez vide pour afficher l'annonce sur l'ensemble du site.</p>

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
    );
  }

  return (
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

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
          {ANNOUNCEMENT_TYPE_LABELS[announcement.type]}
        </span>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
          {ANNOUNCEMENT_POSITION_LABELS[announcement.position]}
        </span>
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getAnnouncementStyleBadge(announcement.style)}`}>
          {announcement.style ? ANNOUNCEMENT_STYLE_LABELS[announcement.style] : "Sans style"}
        </span>
      </div>

      <div className="pt-2 border-t">
        <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" /> Pages ciblées
        </div>
        {announcement.targetPages?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {announcement.targetPages.map((page, idx) => (
              <span key={idx} className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1 text-xs font-mono">
                {page}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground italic">Toutes les pages</span>
        )}
      </div>
    </div>
  );
}