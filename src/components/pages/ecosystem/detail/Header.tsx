import { ArrowLeft, Loader2, Pencil, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  name: string;
  id: string;
  isEditing: boolean;
  isPending: boolean;
  onBack: () => void;
  onCancel: () => void;
  onSave: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
}

export function Header({ name, id, isEditing, isPending, onBack, onCancel, onSave, onStartEdit, onDelete }: HeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight truncate">{name}</h1>
          <p className="text-xs text-muted-foreground truncate">ID: {id}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {isEditing ? (
          <>
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="h-4 w-4 mr-1.5" /> Annuler
            </Button>
            <Button size="sm" onClick={onSave} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Save className="h-4 w-4 mr-1.5" />}
              Enregistrer
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={onStartEdit}>
              <Pencil className="h-4 w-4 mr-1.5" /> Modifier
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-1.5" /> Supprimer
            </Button>
          </>
        )}
      </div>
    </div>
  );
}