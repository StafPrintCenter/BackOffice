interface NotificationTechnicalDetailsProps {
  dataEntries: [string, unknown][];
}

export function NotificationTechnicalDetails({ dataEntries }: NotificationTechnicalDetailsProps) {
  if (dataEntries.length === 0) return null;

  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-8 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Détails techniques
        </h2>
        <span className="font-mono text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground">
          {dataEntries.length} paramètre(s)
        </span>
      </div>

      <dl className="grid grid-cols-1 gap-2 text-sm">
        {dataEntries.map(([key, value]) => (
          <div
            key={key}
            className="flex flex-col sm:flex-row sm:items-center justify-between py-2 px-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors gap-1 sm:gap-4 overflow-hidden"
          >
            <dt className="font-medium text-xs text-muted-foreground shrink-0">{key}</dt>
            <dd className="break-all font-mono text-xs text-foreground bg-background/80 px-2 py-1 rounded border sm:max-w-[65%] w-full overflow-x-auto">
              {typeof value === "object" && value !== null ? JSON.stringify(value, null, 2) : String(value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}