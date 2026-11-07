import { ScoreRing } from "./ScoreRing";
import { HealthBreakdownBar } from "./BreakdownBar";
import type { APIAdminHealth } from "@/data/profileHealth";

export function HealthSummaryCard({ health }: { health: APIAdminHealth }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-6">
        <ScoreRing percent={health.score} level={health.level} size={132} strokeWidth={10}>
          <div className="text-center">
            <div className="font-display text-3xl font-bold">{health.score}%</div>
            <div className="text-xs text-muted-foreground">{health.label}</div>
          </div>
        </ScoreRing>

        <div className="min-w-56 flex-1 space-y-4">
          <HealthBreakdownBar label="Sécurité" entry={health.breakdown.security} />
          <HealthBreakdownBar label="Profil" entry={health.breakdown.profile} />
        </div>
      </div>
    </div>
  );
}