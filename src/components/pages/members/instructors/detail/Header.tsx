import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  CheckCircle2,
  MailCheck,
  MailX,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { APIAdminInstructor } from "@/data/instructors";

interface InstructorDetailHeaderProps {
  instructor: APIAdminInstructor;
  isApprovePending: boolean;
  isResendInvitePending: boolean;
  isRevokeInvitePending: boolean;
  isReactivatePending: boolean;
  onBack: () => void;
  onApprove: () => void;
  onResendInvite: () => void;
  onRevokeInvite: () => void;
  onAlert: () => void;
  onBlock: () => void;
  onReactivate: () => void;
}

export function InstructorDetailHeader({
  instructor,
  isApprovePending,
  isResendInvitePending,
  isRevokeInvitePending,
  isReactivatePending,
  onBack,
  onApprove,
  onResendInvite,
  onRevokeInvite,
  onAlert,
  onBlock,
  onReactivate,
}: InstructorDetailHeaderProps) {
  const isInvited = instructor.registrationSource === "invited";

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <Button variant="outline" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Retour
      </Button>
      <div className="flex flex-wrap gap-2">
        {isInvited && instructor.isPending && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onResendInvite}
              disabled={isResendInvitePending}
            >
              <MailCheck className="mr-1.5 h-4 w-4 text-primary" />
              Renvoyer l'invitation
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={onRevokeInvite}
              disabled={isRevokeInvitePending}
            >
              <MailX className="mr-1.5 h-4 w-4" /> Révoquer l'invitation
            </Button>
          </>
        )}

        {instructor.needsApproval && (
          <Button size="sm" onClick={onApprove} disabled={isApprovePending}>
            <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approuver l'inscription
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={onAlert}>
          <AlertTriangle className="mr-1.5 h-4 w-4 text-amber-500" /> Avertir l'instructeur
        </Button>

        {instructor.isBlocked ? (
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
      </div>
    </div>
  );
}
