import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { SessionCard } from "@/components/pages/security/session/Card";
import { SessionConfirmDialog } from "@/components/pages/security/session/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AdminMemberActor, APIAdminSession } from "@/data/security-session";
import {
  useAdminMemberSessions,
  useRevokeAdminMemberSession,
  useRevokeAllAdminMemberSessions,
  useRevokeSelectedAdminMemberSessions,
} from "@/stores/useAdminMemberSessionsStore";

const PER_PAGE = 20;

type PendingRevocation =
  | { kind: "one"; session: APIAdminSession }
  | { kind: "selected"; sessionIds: number[] }
  | { kind: "all"; total: number };

function getConfirmation(pending: PendingRevocation) {
  switch (pending.kind) {
    case "one":
      return {
        title: "Révoquer cette session ?",
        description: `L'appareil « ${pending.session.deviceName} » (${pending.session.ipAddress}) sera déconnecté.`,
        confirmLabel: "Révoquer la session",
      };
    case "selected":
      return {
        title: "Révoquer les sessions sélectionnées ?",
        description: `${pending.sessionIds.length} session(s) seront déconnectée(s).`,
        confirmLabel: "Révoquer la sélection",
      };
    case "all":
      return {
        title: "Révoquer toutes les sessions ?",
        description: `Toutes les sessions ouvertes de ce membre seront déconnectées (${pending.total}).`,
        confirmLabel: "Tout révoquer",
      };
  }
}

interface MemberSessionsDialogProps {
  actor: AdminMemberActor;
  memberId: string;
  memberName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberSessionsDialog({
  actor,
  memberId,
  memberName,
  open,
  onOpenChange,
}: MemberSessionsDialogProps) {
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pendingRevocation, setPendingRevocation] = useState<PendingRevocation | null>(null);
  const { sessions, total, meta, isLoading, isError, refetch } = useAdminMemberSessions(
    actor,
    memberId,
    page,
    PER_PAGE,
    open
  );
  const revokeSession = useRevokeAdminMemberSession();
  const revokeSelected = useRevokeSelectedAdminMemberSessions();
  const revokeAll = useRevokeAllAdminMemberSessions();

  const isMutating =
    revokeSession.isPending || revokeSelected.isPending || revokeAll.isPending;
  const pageSessionIds = sessions.filter((session) => !session.isCurrent).map((session) => session.id);
  const isPageSelected =
    pageSessionIds.length > 0 && pageSessionIds.every((sessionId) => selectedIds.includes(sessionId));

  useEffect(() => {
    if (open) {
      setPage(1);
      setSelectedIds([]);
      setPendingRevocation(null);
    }
  }, [open]);

  useEffect(() => {
    if (meta && page > meta.lastPage) setPage(meta.lastPage);
  }, [meta, page]);

  const toggleSessionSelection = (sessionId: number, selected: boolean) => {
    setSelectedIds((current) =>
      selected
        ? current.includes(sessionId)
          ? current
          : [...current, sessionId]
        : current.filter((id) => id !== sessionId)
    );
  };

  const togglePageSelection = (selected: boolean) => {
    setSelectedIds((current) => {
      if (selected) return [...new Set([...current, ...pageSessionIds])];
      return current.filter((id) => !pageSessionIds.includes(id));
    });
  };

  const handleMutationSuccess = (message: string) => {
    toast.success(message);
    setPendingRevocation(null);
    setSelectedIds([]);
  };

  const handleConfirmRevocation = () => {
    if (!pendingRevocation) return;
    const onError = (error: Error) => toast.error(error.message);

    switch (pendingRevocation.kind) {
      case "one":
        revokeSession.mutate(
          { actor, memberId, sessionId: pendingRevocation.session.id },
          {
            onSuccess: (response) => handleMutationSuccess(response.message),
            onError,
          }
        );
        break;
      case "selected":
        revokeSelected.mutate(
          { actor, memberId, sessionIds: pendingRevocation.sessionIds },
          {
            onSuccess: (response) => handleMutationSuccess(response.message),
            onError,
          }
        );
        break;
      case "all":
        revokeAll.mutate(
          { actor, memberId },
          {
            onSuccess: (response) => handleMutationSuccess(response.message),
            onError,
          }
        );
        break;
    }
  };

  const confirmation = pendingRevocation ? getConfirmation(pendingRevocation) : null;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!isMutating) onOpenChange(nextOpen);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sessions de {memberName}</DialogTitle>
            <DialogDescription>
              {total} session(s) ouverte(s). Sélectionnez-en pour les révoquer ou révoquez-les toutes.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={isPageSelected}
                disabled={isLoading || pageSessionIds.length === 0 || isMutating}
                onCheckedChange={(checked) => togglePageSelection(checked === true)}
              />
              Sélectionner la page
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={selectedIds.length === 0 || isMutating}
                onClick={() =>
                  setPendingRevocation({ kind: "selected", sessionIds: selectedIds })
                }
              >
                Révoquer la sélection ({selectedIds.length})
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={total === 0 || isMutating}
                onClick={() => setPendingRevocation({ kind: "all", total })}
              >
                Tout révoquer
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Chargement des sessions...
            </div>
          ) : isError ? (
            <div className="rounded-xl border p-8 text-center text-sm text-muted-foreground">
              Impossible de charger les sessions de ce membre.
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RotateCw className="mr-2 h-4 w-4" /> Réessayer
                </Button>
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <p className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
              Aucune session ouverte pour ce membre.
            </p>
          ) : (
            <ul className="space-y-3">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  selectable
                  selected={selectedIds.includes(session.id)}
                  disabled={isMutating}
                  onSelect={(selectedSession, selected) =>
                    toggleSessionSelection(selectedSession.id, selected)
                  }
                  onRevoke={(selectedSession) =>
                    setPendingRevocation({ kind: "one", session: selectedSession })
                  }
                />
              ))}
            </ul>
          )}

          {meta && meta.lastPage > 1 && (
            <DialogFooter className="flex-row items-center justify-between sm:justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((current) => current - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {meta.currentPage} / {meta.lastPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.lastPage || isLoading}
                onClick={() => setPage((current) => current + 1)}
              >
                Suivant
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {confirmation && (
        <SessionConfirmDialog
          open={Boolean(pendingRevocation)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen && !isMutating) setPendingRevocation(null);
          }}
          title={confirmation.title}
          description={confirmation.description}
          confirmLabel={confirmation.confirmLabel}
          isPending={isMutating}
          onConfirm={handleConfirmRevocation}
        />
      )}
    </>
  );
}
