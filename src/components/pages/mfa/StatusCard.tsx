import { ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { APIAdminMfaStatus } from "@/data/mfa";

interface MfaStatusCardProps {
  status: APIAdminMfaStatus;
  onEnable: () => void;
  onDisable: () => void;
}

export function MfaStatusCard({ status, onEnable, onDisable }: MfaStatusCardProps) {
  const Icon = status.enabled ? ShieldCheck : ShieldOff;

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`grid h-12 w-12 place-items-center rounded-xl ${status.enabled ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
              }`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">Double authentification</h2>
            <p className="text-sm text-muted-foreground">
              {status.enabled
                ? "Un code supplémentaire est demandé à chaque connexion."
                : "Ajoutez une étape de vérification pour mieux protéger votre compte."}
            </p>
          </div>
        </div>

        {status.enabled ? (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            disabled={status.enforced}
            onClick={onDisable}
          >
            Désactiver
          </Button>
        ) : (
          <Button size="sm" onClick={onEnable}>Activer</Button>
        )}
      </div>

      {status.enforced && (
        <p className="mt-4 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
          La double authentification est imposée par l'administrateur : vous ne pouvez pas la désactiver.
        </p>
      )}
    </div>
  );
}