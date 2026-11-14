import { ArrowLeft, Ban, CheckCircle, Pencil, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResourceDetailHeaderProps {
  isEditing: boolean;
  isPending: boolean;
  isActive: boolean;
  visibilityPending: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSave: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}

export function ResourceDetailHeader({
  isEditing,
  isPending,
  isActive,
  visibilityPending,
  onBack,
  onCancel,
  onSave,
  onStartEdit,
  onDelete,
  onToggleVisibility,
}: ResourceDetailHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <Button variant="outline" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Retour
      </Button>
      <div className="flex flex-wrap gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" size="sm" onClick={onCancel}><X className="mr-1 h-4 w-4" /> Annuler</Button>
            <Button size="sm" onClick={onSave} disabled={isPending}><Save className="mr-1 h-4 w-4" /> Enregistrer</Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={onStartEdit}><Pencil className="mr-1 h-4 w-4" /> Modifier</Button>
            <Button
              variant={isActive ? "outline" : "default"}
              size="sm"
              onClick={onToggleVisibility}
              disabled={visibilityPending}
            >
              {isActive ? <><Ban className="mr-1 h-4 w-4" /> Désactiver</> : <><CheckCircle className="mr-1 h-4 w-4" /> Activer</>}
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={onDelete}>
              <Trash2 className="mr-1 h-4 w-4" /> Supprimer
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
