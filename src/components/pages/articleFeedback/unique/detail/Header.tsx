import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onBack: () => void;
  onDelete: () => void;
}

export function FeedbackUniqueDetailHeader({ onBack, onDelete }: HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-1.5 size-4" /> Retour à la liste
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="mr-1.5 size-4" /> Supprimer
      </Button>
    </div>
  );
}