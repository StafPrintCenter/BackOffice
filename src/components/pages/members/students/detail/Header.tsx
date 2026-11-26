import { AlertTriangle, ArrowLeft, Ban, MailCheck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { APIAdminStudentDetail } from "@/data/students";

interface StudentDetailHeaderProps {
  student: APIAdminStudentDetail;
  isResendInvitePending: boolean;
  isReactivatePending: boolean;
  onBack: () => void;
  onResendInvite: () => void;
  onAlert: () => void;
  onBlock: () => void;
  onReactivate: () => void;
}

export function StudentDetailHeader({
  student,
  isResendInvitePending,
  isReactivatePending,
  onBack,
  onResendInvite,
  onAlert,
  onBlock,
  onReactivate,
}: StudentDetailHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <Button variant="outline" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Retour
      </Button>
      <div className="flex flex-wrap gap-2">
        {!student.isActive && !student.isBlocked && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResendInvite}
            disabled={isResendInvitePending}
          >
            <MailCheck className="mr-1.5 h-4 w-4 text-primary" />
            Renvoyer l'invitation
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onAlert}>
          <AlertTriangle className="mr-1.5 h-4 w-4 text-amber-500" /> Avertir l'apprenant
        </Button>
        {student.isBlocked ? (
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
