import { Link } from "@tanstack/react-router";
import { Ban, KeyRound, Mail, Phone } from "lucide-react";
import { formatEnrollmentDate, formatFcfa, type APITrainingStudent } from "@/data/trainingEnrollments";
import { CertificateStatusBadge, EnrollmentStatusBadge, PaymentStatusBadge } from "./EnrollmentBadges";
import { AddPaymentDialog } from "@/components/trainings/payments/AddPaymentDialog";
import { CertificateActions } from "@/components/trainings/certificates/CertificateActions";
import { ProgressBar } from "./ProgressBar";

const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "A";

export function TrainingStudentRow({ student: s, color }: { student: APITrainingStudent; color?: string }) {
  return (
    <div className="space-y-3 rounded-lg border p-4 text-sm">
      <div className="flex items-start gap-3">
        {s.photo ? (
          <img src={s.photo} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {initials(s.name)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/members/students/$id" params={{ id: s.studentId }} className="truncate font-medium text-primary hover:underline">
              {s.name}
            </Link>
            <EnrollmentStatusBadge status={s.status} />
            {s.isBlocked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                <Ban className="h-3 w-3" /> Bloqué
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" /> {s.email}</span>
            {s.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" /> {s.phone}</span>}
          </div>
        </div>
      </div>

      <ProgressBar value={s.progress} color={color} />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">Paiement <PaymentStatusBadge status={s.paymentStatus} /></span>
        <span>Versé : <b className="text-foreground">{formatFcfa(s.amountPaid)}</b></span>
        <span className="inline-flex items-center gap-1.5">Certificat <CertificateStatusBadge status={s.certificateStatus} /></span>
        <span className={`inline-flex items-center gap-1 ${s.hasContentAccess ? "text-emerald-600" : ""}`}>
          <KeyRound className="h-3 w-3" /> {s.hasContentAccess ? "Accès au contenu" : "Accès restreint"}
        </span>
        <AddPaymentDialog enrollmentId={s.enrollmentId} context={s.name} />
      </div>

      <div className="flex flex-wrap gap-x-4 text-[11px] text-muted-foreground/80">
        <span>Inscrit le {formatEnrollmentDate(s.enrolledAt)}</span>
        {s.completedAt && <span>Terminé le {formatEnrollmentDate(s.completedAt)}</span>}

        <div className="flex flex-wrap gap-2">
          <CertificateActions
            enrollmentId={s.enrollmentId}
            certificateStatus={s.certificateStatus}
            progress={s.progress}
            context={s.name}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 text-[11px] text-muted-foreground/80">
        <span>Inscrit le {formatEnrollmentDate(s.enrolledAt)}</span>
        {s.completedAt && <span>Terminé le {formatEnrollmentDate(s.completedAt)}</span>}
      </div>
    </div>
  );
}