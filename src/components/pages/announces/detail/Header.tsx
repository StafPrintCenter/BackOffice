import { ArrowLeft, Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnnouncementDetailHeaderProps {
  isEditing: boolean;
  isPending: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSave: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
}

export function AnnouncementDetailHeader({
  isEditing,
  isPending,
  onBack,
  onCancel,
  onSave,
  onStartEdit,
  onDelete,
}: AnnouncementDetailHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <Button variant="outline" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Retour
      </Button>
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="h-4 w-4 mr-1" /> Annuler
            </Button>
            <Button size="sm" onClick={onSave} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Enregistrer
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={onStartEdit}>
              <Pencil className="h-4 w-4 mr-1" /> Modifier
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Supprimer
            </Button>
          </>
        )}
      </div>
    </div>
  );
}