import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { APIAdminAdminDetail } from "@/data/admins";

interface AdminDetailHeaderProps {
  admin: APIAdminAdminDetail;
  isSelf: boolean;
  isReactivatePending: boolean;
  isResendInvitePending: boolean;
  onBack: () => void;
  onAlert: () => void;
  onBlock: () => void;
  onReactivate: () => void;
  onRevokeInvite: () => void;
}

export function AdminDetailHeader({
  admin,
  isSelf,
  isReactivatePending,
  isResendInvitePending,
  onBack,
  onAlert,
  onBlock,
  onReactivate,
  onRevokeInvite,
}: AdminDetailHeaderProps) {
  const isInviteRevoked = Boolean(admin.invitationRevokedAt);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <Button variant="outline" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Retour
      </Button>

      {!isSelf && (
        <div className="flex flex-wrap gap-2">
          {admin.isPending ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onResendInvite}
                disabled={isResendInvitePending}
              >
                <Send className="mr-1.5 h-4 w-4" /> Renvoyer l'invitation
              </Button>
              {!isInviteRevoked && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={onRevokeInvite}
                >
                  <XCircle className="mr-1.5 h-4 w-4" /> Révoquer l'invitation
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={onAlert}>
                <AlertTriangle className="mr-1.5 h-4 w-4 text-amber-500" />
                Avertir l'administrateur
              </Button>
              {admin.isBlocked ? (
                <Button size="sm" onClick={onReactivate} disabled={isReactivatePending}>
                  <ShieldCheck className="mr-1.5 h-4 w-4" /> Réactiver le compte
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={onBlock}
                >
                  <Ban className="mr-1.5 h-4 w-4" /> Bloquer l'accès
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
