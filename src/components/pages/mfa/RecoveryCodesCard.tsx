import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MfaRecoveryCodesCardProps {
  remaining: number;
  generatedAt: string | null;
  onRegenerate: () => void;
}

export function MfaRecoveryCodesCard({ remaining, generatedAt, onRegenerate }: MfaRecoveryCodesCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2 border-b pb-4">
        <KeyRound className="h-5 w-5 text-primary" />
        <h3 className="font-display text-lg font-semibold">Codes de secours</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Utilisez-les si vous n'avez plus accès à votre e-mail ou à votre application. Chaque code ne sert qu'une fois.
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          <span className="font-semibold">{remaining}</span> code{remaining > 1 ? "s" : ""} restant{remaining > 1 ? "s" : ""}
          {generatedAt && (
            <span className="ml-2 text-xs text-muted-foreground">
              · générés le {new Date(generatedAt).toLocaleDateString("fr-FR")}
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onRegenerate}>
          {remaining > 0 ? "Régénérer" : "Générer des codes"}
        </Button>
      </div>

      {remaining > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Régénérer les codes invalide immédiatement les anciens.
        </p>
      )}
    </div>
  );
}