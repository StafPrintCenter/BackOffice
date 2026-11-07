import type { APIAdminHealthBreakdownEntry } from "@/data/profileHealth";

interface HealthBreakdownBarProps {
  label: string;
  entry: APIAdminHealthBreakdownEntry;
}

export function HealthBreakdownBar({ label, entry }: HealthBreakdownBarProps) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">
          {entry.earned}/{entry.total} pts · {entry.percent}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${entry.percent}%` }}
        />
      </div>
    </div>
  );
}