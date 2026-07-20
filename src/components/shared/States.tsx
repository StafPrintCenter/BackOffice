import { Card } from "@/components/ui/card";

export function EmptyState({ title, description, icon }: { title: string; description?: string; icon?: React.ReactNode }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-2 py-16 text-center border-dashed">
      {icon && <div className="text-muted-foreground">{icon}</div>}
      <div className="font-semibold">{title}</div>
      {description && <div className="text-sm text-muted-foreground max-w-sm">{description}</div>}
    </Card>
  );
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}
