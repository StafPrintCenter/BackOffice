import { AlertTriangle, MailCheck, UserCheck } from "lucide-react";
import type { APIAdminInstructor } from "@/data/instructors";

interface InstructorStatusBannersProps {
  instructor: APIAdminInstructor;
}

function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export function InstructorStatusBanners({ instructor }: InstructorStatusBannersProps) {
  const isInvited = instructor.registrationSource === "invited";

  return (
    <div className="space-y-4">
      {instructor.isBlocked && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Ce compte instructeur est actuellement bloqué.</p>
            <p className="mt-0.5 text-xs text-destructive/80">
              Bloqué le {formatDate(instructor.blockedAt)}.
              {instructor.blockedReason && ` Motif : "${instructor.blockedReason}"`}
            </p>
          </div>
        </div>
      )}

      {isInvited && instructor.isPending && !instructor.isBlocked && (
        <div className="flex items-start gap-3 rounded-xl border border-sky-500/20 bg-sky-500/10 p-4 text-sky-700">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Invitation en attente de réponse.</p>
            <p className="mt-0.5 text-xs text-sky-700/80">
              Invité le {formatDate(instructor.invitedAt)}. Il n'a pas encore accepté l'invitation.
            </p>
          </div>
        </div>
      )}

      {instructor.needsApproval && !instructor.isBlocked && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-700">
          <UserCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Cette inscription attend une approbation.</p>
            <p className="mt-0.5 text-xs text-amber-700/80">
              Cet instructeur s'est inscrit directement et doit être approuvé avant de pouvoir accéder à la plateforme.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
