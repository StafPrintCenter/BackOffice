import { ExternalLink, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNotificationDate, type APINotificationDetail } from "@/data/notifications";

interface NotificationDetailCardProps {
  notification: APINotificationDetail;
  meta: { label: string; className: string; icon: any };
  onActionClick?: (url: string) => void;
}

export function NotificationDetailCard({ notification: n, meta, onActionClick }: NotificationDetailCardProps) {
  const Icon = meta.icon;

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b bg-muted/20 p-4 sm:px-8 sm:py-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <span className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl shadow-xs ${meta.className}`}>
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}>
                {meta.label}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground bg-background/80 px-2 py-0.5 rounded border">
                {n.type}
              </span>
            </div>
            <h1 className="font-display text-lg sm:text-2xl font-bold tracking-tight text-foreground wrap-break-word">
              {n.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-8 space-y-6">
        <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap wrap-break-word">
          {n.body}
        </div>

        {n.actionUrl && (
          <div className="pt-2">
            <Button
              onClick={() => onActionClick?.(n.actionUrl as string)}
              className="shadow-xs gap-2 w-full sm:w-auto"
            >
              Ouvrir l'élément concerné
              <ExternalLink className="h-4 w-4 opacity-70" />
            </Button>
          </div>
        )}
      </div>

      <div className="border-t bg-muted/10 px-4 py-3 sm:px-8 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 opacity-70" />
          <span>Reçue le {formatNotificationDate(n.deliveredAt)}</span>
        </div>

        {n.readAt && (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Lue le {formatNotificationDate(n.readAt)}</span>
          </div>
        )}
      </div>
    </div>
  );
}