import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_META, formatNotificationDate } from "@/data/notifications";
import { useNotificationDetail } from "@/stores/useAdminNotificationsStore";

export const Route = createFileRoute("/_admin/notifications/$id")({
  head: () => ({
    meta: [{ title: "Notification — Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: NotificationDetail,
});

function NotificationDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { notification: n, isLoading } = useNotificationDetail(id);

  const back = (
    <Button variant="outline" size="sm" onClick={() => navigate({ to: "/notifications" })}>
      <ArrowLeft className="mr-1 h-4 w-4" /> Retour
    </Button>
  );

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" /> Chargement…
        </div>
      </>
    );
  }

  if (!n) {
    return (
      <>
        <div className="mb-6">{back}</div>
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          Notification introuvable.
          <div className="mt-2">
            <Link to="/notifications" className="text-primary underline">
              Retour à la liste
            </Link>
          </div>
        </div>
      </>
    );
  }

  const meta = CATEGORY_META[n.category];
  const Icon = meta.icon;
  const dataEntries = n.data ? Object.entries(n.data) : [];

  return (
    <>
      <div className="mb-6">{back}</div>

      <div className="max-w-3xl space-y-6">
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="flex items-start gap-4 border-b bg-muted/30 p-6">
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${meta.className}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${meta.className}`}
              >
                {meta.label}
              </span>
              <h1 className="mt-2 font-display text-xl font-bold">{n.title}</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Reçue le {formatNotificationDate(n.deliveredAt)}
                {n.readAt && ` · Lue le ${formatNotificationDate(n.readAt)}`}
              </p>
            </div>
          </div>

          <div className="space-y-4 p-6">
            <p className="text-sm leading-relaxed">{n.body}</p>

            {n.actionUrl && (
              <Button
                onClick={() =>
                  navigate({ to: n.actionUrl as never })
                }
              >
                <ExternalLink className="mr-1 h-4 w-4" /> Ouvrir l'élément concerné
              </Button>
            )}
          </div>
        </div>

        {dataEntries.length > 0 && (
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Détails techniques
            </h2>
            <dl className="space-y-2 text-sm">
              {dataEntries.map(([key, value]) => (
                <div key={key} className="flex flex-wrap gap-x-3">
                  <dt className="font-medium">{key}</dt>
                  <dd className="break-all font-mono text-xs text-muted-foreground">
                    {typeof value === "object" ? JSON.stringify(value) : String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <p className="font-mono text-[11px] text-muted-foreground/70">Type : {n.type}</p>
      </div>
    </>
  );
}
