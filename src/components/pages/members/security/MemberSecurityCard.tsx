import { CheckCircle2, ShieldCheck, UsersRound, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MemberSecurityChecks, MemberSecuritySummary } from "@/data/memberAction";

interface MemberSecurityCardProps {
  security: MemberSecuritySummary | undefined;
}

const SECURITY_CHECKS: { key: keyof MemberSecurityChecks; label: string }[] = [
  { key: "mfaEnabled", label: "Authentification multifacteur activée" },
  { key: "authenticatorOrPasskeyConfigured", label: "Application d'authentification ou passkey configurée" },
  { key: "passkeyConfigured", label: "Passkey configurée" },
  { key: "recoveryCodesAvailable", label: "Codes de récupération disponibles" },
  { key: "passwordRecent", label: "Mot de passe récent" },
  { key: "sessionsWithinPolicy", label: "Sessions conformes à la politique" },
];

export function MemberSecurityCard({ security }: MemberSecurityCardProps) {
  const score = Math.max(0, Math.min(security?.score ?? 0, 100));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Sécurité du compte
        </CardTitle>
        <CardDescription>
          Score et critères de sécurité associés à ce membre.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {!security ? (
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm text-muted-foreground">
            Les critères de sécurité ne sont pas disponibles pour ce compte.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Score de sécurité</span>
                <span className="font-semibold tabular-nums">{score} / 100</span>
              </div>
              <Progress
                value={score}
                aria-label={`Score de sécurité : ${score} sur 100`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={score}
              />
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {SECURITY_CHECKS.map(({ key, label }) => {
                const passed = security.checks[key];
                const StatusIcon = passed ? CheckCircle2 : XCircle;
                return (
                  <li
                    key={key}
                    className="flex items-start gap-2 rounded-lg border bg-background/50 p-3"
                  >
                    <StatusIcon
                      className={`mt-0.5 h-4 w-4 shrink-0 ${passed ? "text-emerald-600" : "text-amber-600"
                        }`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 text-sm">{label}</span>
                    <span
                      className={`shrink-0 text-xs font-medium ${passed ? "text-emerald-600" : "text-amber-600"
                        }`}
                    >
                      {passed ? "Conforme" : "À renforcer"}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
              <UsersRound className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <span>Sessions ouvertes</span>
              <span className="ml-auto font-semibold tabular-nums">{security.openSessions}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
