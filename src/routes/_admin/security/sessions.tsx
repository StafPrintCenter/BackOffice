import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionCard } from "@/components/pages/security/session/Card";
import { SessionsToolbar } from "@/components/pages/security/session/Toolbar";
import { SessionConfirmDialog } from "@/components/pages/security/session/ConfirmDialog";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  useAdminSessionsList,
  useDeleteAdminSession,
  useRevokeOtherAdminSessions,
  useRevokeAllAdminSessions,
} from "@/stores/useSecuritySessionsStore";
import type { APIAdminSession } from "@/data/security-session";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/security/sessions")({
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Sessions actives | ${SITE.name}` },
      { name: "description", content: "Consultez et fermez les sessions ouvertes sur votre compte administrateur." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SessionsPage,
});

type PendingAction =
  | { kind: "one"; session: APIAdminSession }
  | { kind: "others" }
  | { kind: "all" };

function getConfirmCopy(action: PendingAction) {
  switch (action.kind) {
    case "one":
      return {
        title: "Fermer cette session ?",
        description: `L'appareil « ${action.session.deviceName} » (${action.session.ipAddress}) sera déconnecté.`,
        confirmLabel: "Fermer la session",
      };
    case "others":
      return {
        title: "Fermer toutes les autres sessions ?",
        description: "Tous vos autres appareils seront déconnectés. Cet appareil reste connecté.",
        confirmLabel: "Fermer les autres sessions",
      };
    case "all":
      return {
        title: "Se déconnecter partout ?",
        description: "Toutes vos sessions seront fermées, y compris celle-ci. Vous serez redirigé vers la page de connexion.",
        confirmLabel: "Tout fermer",
      };
  }
}

function SessionsPage() {
  const navigate = useNavigate();
  const { refresh } = useAdminAuth();
  const { items: sessions, isLoading, isError, refetch } = useAdminSessionsList();

  const deleteSession = useDeleteAdminSession();
  const revokeOthers = useRevokeOtherAdminSessions();
  const revokeAll = useRevokeAllAdminSessions();

  const [pending, setPending] = useState<PendingAction | null>(null);

  const isPending = deleteSession.isPending || revokeOthers.isPending || revokeAll.isPending;
  const othersCount = sessions.filter((s) => !s.isCurrent).length;

  const handleConfirm = () => {
    if (!pending) return;
    const onError = (e: Error) => toast.error(e.message);

    switch (pending.kind) {
      case "one":
        deleteSession.mutate(pending.session.id, {
          onSuccess: (res) => { toast.success(res.message); setPending(null); },
          onError,
        });
        break;
      case "others":
        revokeOthers.mutate(undefined, {
          onSuccess: (res) => { toast.success(res.message); setPending(null); },
          onError,
        });
        break;
      case "all":
        revokeAll.mutate(undefined, {
          onSuccess: async (res) => {
            toast.success(res.message);
            setPending(null);
            await refresh(); // /me renvoie 401 → l'état d'auth repasse à "déconnecté"
            navigate({ to: "/login" });
          },
          onError,
        });
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border p-8 text-center text-muted-foreground">
        Impossible de charger vos sessions.
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => refetch()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  const copy = pending ? getConfirmCopy(pending) : null;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Sessions actives</h1>
          <p className="text-sm text-muted-foreground">
            {sessions.length} appareil{sessions.length > 1 ? "s" : ""} connecté{sessions.length > 1 ? "s" : ""} à votre compte.
            Fermez ceux que vous ne reconnaissez pas.
          </p>
        </div>
        <SessionsToolbar
          othersCount={othersCount}
          disabled={isPending}
          onRevokeOthers={() => setPending({ kind: "others" })}
          onRevokeAll={() => setPending({ kind: "all" })}
        />
      </div>

      <ul className="max-w-3xl space-y-4">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            disabled={isPending}
            onRevoke={(s) => setPending({ kind: "one", session: s })}
          />
        ))}
      </ul>

      {copy && (
        <SessionConfirmDialog
          open={!!pending}
          onOpenChange={(open) => !open && setPending(null)}
          title={copy.title}
          description={copy.description}
          confirmLabel={copy.confirmLabel}
          isPending={isPending}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}