import { Globe, Monitor, Smartphone, Tablet, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { APIAdminSession } from "@/data/security-session";

const DEVICE_ICONS = { desktop: Monitor, mobile: Smartphone, tablet: Tablet } as const;

const AUTH_METHOD_LABELS: Record<string, string> = {
  password: "Mot de passe",
  email: "Code reçu par e-mail",
  totp: "Application d'authentification",
  passkey: "Clé d'accès (passkey)",
  recovery: "Code de secours",
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

interface SessionCardProps {
  session: APIAdminSession;
  onRevoke: (session: APIAdminSession) => void;
  disabled?: boolean;
}

export function SessionCard({ session, onRevoke, disabled }: SessionCardProps) {
  const Icon = DEVICE_ICONS[session.deviceType as keyof typeof DEVICE_ICONS] ?? Globe;

  return (
    <li
      className={`rounded-2xl border bg-card p-5 shadow-sm ${session.isCurrent ? "border-primary/40 bg-primary/5" : ""
        }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">{session.deviceName}</span>
              {session.isCurrent && <Badge variant="secondary">Cet appareil</Badge>}
            </div>
            <div className="text-xs text-muted-foreground">
              {session.ipAddress} · {AUTH_METHOD_LABELS[session.authMethod] ?? session.authMethod}
            </div>
          </div>
        </div>

        {!session.isCurrent && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            disabled={disabled}
            onClick={() => onRevoke(session)}
          >
            <XCircle className="mr-1 h-4 w-4" /> Fermer
          </Button>
        )}
      </div>

      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Connectée le</dt>
          <dd className="mt-0.5 font-medium">{formatDateTime(session.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Dernière activité</dt>
          <dd className="mt-0.5 font-medium">{formatDateTime(session.lastUsedAt)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Expire le</dt>
          <dd className="mt-0.5 font-medium">{formatDateTime(session.expiresAt)}</dd>
        </div>
      </dl>
    </li>
  );
}