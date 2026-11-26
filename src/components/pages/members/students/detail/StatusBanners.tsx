import { AlertTriangle, MailCheck } from "lucide-react";
import type { APIAdminStudentDetail } from "@/data/students";

interface StudentStatusBannersProps {
  student: APIAdminStudentDetail;
}

function formatDate(date: string | null) {
  return date ? new Date(date).toLocaleString("fr-FR") : "-";
}

export function StudentStatusBanners({ student }: StudentStatusBannersProps) {
  return (
    <div className="space-y-4">
      {student.isBlocked && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Ce compte apprenant est actuellement bloqué.</p>
            <p className="mt-0.5 text-xs text-destructive/80">
              Bloqué le {formatDate(student.blockedAt)}.
              {student.blockedReason && ` Motif : "${student.blockedReason}"`}
            </p>
          </div>
        </div>
      )}

      {!student.isActive && !student.isBlocked && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-700">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Ce compte n'a pas encore été activé.</p>
            <p className="mt-0.5 text-xs text-amber-700/80">
              L'apprenant n'a pas finalisé son invitation. Vous pouvez la renvoyer via le bouton ci-dessus.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
