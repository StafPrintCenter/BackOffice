export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-9 text-right text-[11px] font-medium tabular-nums text-muted-foreground">{pct}%</span>
    </div>
  );
}