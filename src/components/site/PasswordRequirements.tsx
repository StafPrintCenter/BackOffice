import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { PASSWORD_REQUIREMENTS } from "@/lib/password-policy";

interface PasswordRequirementsProps {
  value: string;
}

export function PasswordRequirements({ value }: PasswordRequirementsProps) {
  if (!value) return null;

  return (
    <div className="space-y-2" aria-label="Critères du mot de passe">
      <p className="text-xs text-muted-foreground">
        Le mot de passe doit respecter tous les critères suivants :
      </p>
      <ul className="grid gap-1 sm:grid-cols-2" aria-label="Critères de validation">
        {PASSWORD_REQUIREMENTS.map((requirement) => {
          const isMet = requirement.isMet(value);
          const Icon = isMet ? CheckCircle2 : value ? XCircle : Circle;

          return (
            <li
              key={requirement.id}
              className={`flex items-center gap-2 text-xs ${
                isMet
                  ? "text-emerald-600 dark:text-emerald-400"
                  : value
                    ? "text-destructive"
                    : "text-muted-foreground"
              }`}
              aria-label={`${requirement.label} : ${
                isMet ? "validé" : value ? "non validé" : "à vérifier"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{requirement.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
