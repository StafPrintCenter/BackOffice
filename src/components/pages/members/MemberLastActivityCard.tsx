import type { ReactNode } from "react";
import { Clock3, Globe2, KeyRound, Laptop, MapPin, MonitorSmartphone, Smartphone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatLastActivityAt,
  MEMBER_ACTIVITY_AUTH_METHOD_LABELS,
  type MemberActivityFields,
} from "@/data/memberAction";

interface MemberLastActivityCardProps {
  activity: MemberActivityFields;
}

function getDeviceTypeLabel(deviceType: string | null): string {
  if (!deviceType) return "-";

  const labels: Record<string, string> = {
    desktop: "Ordinateur",
    mobile: "Mobile",
    tablet: "Tablette",
  };
  return labels[deviceType.toLowerCase()] ?? deviceType;
}

function ActivityDetail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border bg-background/50 p-3">
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="mt-0.5 wrap-break-word text-sm font-semibold">{value || "-"}</div>
      </div>
    </div>
  );
}

export function MemberLastActivityCard({ activity }: MemberLastActivityCardProps) {
  const lastActivity = activity.lastActivity;
  const authMethod = lastActivity?.authMethod
    ? MEMBER_ACTIVITY_AUTH_METHOD_LABELS[lastActivity.authMethod] ?? lastActivity.authMethod
    : "-";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock3 className="h-5 w-5 text-primary" />
          Dernière activité
        </CardTitle>
        <CardDescription>Dernière connexion et informations sur l'appareil utilisé.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
          <Clock3 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span>Dernière connexion</span>
          <span className="ml-auto font-semibold tabular-nums">
            {formatLastActivityAt(activity.lastActivityAt)}
          </span>
        </div>

        {lastActivity ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <ActivityDetail
              icon={<MonitorSmartphone className="h-4 w-4" />}
              label="Appareil"
              value={lastActivity.deviceName}
            />
            <ActivityDetail
              icon={<Globe2 className="h-4 w-4" />}
              label="Navigateur"
              value={lastActivity.browser}
            />
            <ActivityDetail
              icon={<Laptop className="h-4 w-4" />}
              label="Système d'exploitation"
              value={lastActivity.os}
            />
            <ActivityDetail
              icon={<Smartphone className="h-4 w-4" />}
              label="Type d'appareil"
              value={getDeviceTypeLabel(lastActivity.deviceType)}
            />
            <ActivityDetail
              icon={<MapPin className="h-4 w-4" />}
              label="Adresse IP"
              value={lastActivity.ipAddress}
            />
            <ActivityDetail
              icon={<KeyRound className="h-4 w-4" />}
              label="Méthode d'authentification"
              value={authMethod}
            />
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            Aucun détail d'activité récent n'est disponible.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
