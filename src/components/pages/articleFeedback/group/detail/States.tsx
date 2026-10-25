import { Loader2 } from "lucide-react";

export function FeedbackGroupLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-2">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm">Chargement des données du groupe...</p>
    </div>
  );
}

export function FeedbackGroupNotFoundState({ onBack }: { onBack: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
      <p>Aucun retour trouvé pour cet article.</p>
    </div>
  );
}