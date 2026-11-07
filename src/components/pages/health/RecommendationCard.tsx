import { Link } from "@tanstack/react-router";
import { AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resolveHealthTarget } from "./Targets";
import type { APIAdminHealthRecommendation } from "@/data/profileHealth";

interface HealthRecommendationCardProps {
  rec: APIAdminHealthRecommendation;
  busy: boolean;
  onDismiss: (id: string, restore: boolean) => void;
}

export function HealthRecommendationCard({ rec, busy, onDismiss }: HealthRecommendationCardProps) {
  const route = resolveHealthTarget(rec.action.target);
  const isWarning = rec.level === "warning";
  const Icon = isWarning ? AlertTriangle : Info;

  return (
    <li className={`rounded-2xl border bg-card p-5 shadow-sm ${rec.dismissed ? "opacity-70" : ""}`}>
      <div className="flex items-start gap-3">
        <div
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${isWarning ? "bg-amber-500/10 text-amber-600" : "bg-sky-500/10 text-sky-600"
            }`}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold">{rec.title}</h4>
            {rec.urgent && <Badge variant="destructive">Urgent</Badge>}
            <Badge variant="outline">+{rec.points} pts</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{rec.message}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {route && !rec.dismissed && (
              <Button asChild size="sm">
                <Link to={route as any}>{rec.action.label}</Link>
              </Button>
            )}
            <Button variant="outline" size="sm" disabled={busy} onClick={() => onDismiss(rec.id, rec.dismissed)}>
              {rec.dismissed ? "Restaurer" : "Masquer"}
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}