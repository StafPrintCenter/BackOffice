import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FeedbackUniqueLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
      <Loader2 className="mb-2 size-6 animate-spin text-primary" />
      <p className="text-sm font-medium">Chargement du retour...</p>
    </div>
  );
}

export function FeedbackUniqueNotFoundState({ onBack }: { onBack: () => void }) {
  return (
    <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
      <ShieldAlert className="mx-auto size-10 text-muted-foreground/60" />
      <h2 className="mt-3 text-lg font-semibold">Retour introuvable</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Le retour d'expérience demandé n'existe pas ou a été supprimé.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onBack}>
        Retourner à la liste
      </Button>
    </div>
  );
}