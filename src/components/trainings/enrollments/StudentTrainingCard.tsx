import { Link } from "@tanstack/react-router";
import { Award, Calendar, CheckCircle2, Wallet } from "lucide-react";
import { getTrainingStatusBadgeClass, getTrainingStatusLabel } from "@/data/trainings";
import { formatEnrollmentDate, formatFcfa, type StudentTrainingEnrollment } from "@/data/trainingEnrollments";
import { CertificateStatusBadge, EnrollmentStatusBadge, PaymentStatusBadge } from "./EnrollmentBadges";
import { ProgressBar } from "./ProgressBar";
import { AddPaymentDialog } from "@/components/trainings/payments/AddPaymentDialog";
import { CertificateActions } from "@/components/trainings/certificates/CertificateActions";

export function StudentTrainingCard({ enrollment: e }: { enrollment: StudentTrainingEnrollment }) {
  return (
    <div className="space-y-3 rounded-xl border bg-background/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <Link
          to="/trainings/catalogs/$id"
          params={{ id: e.trainingId }}
          className="font-semibold text-primary hover:underline"
        >
          {e.trainingTitle}
        </Link>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getTrainingStatusBadgeClass(e.trainingStatus as never)}`}>
            Formation : {getTrainingStatusLabel(e.trainingStatus as never)}
          </span>
          <EnrollmentStatusBadge status={e.status} />
        </div>
      </div>

      <ProgressBar value={e.progress} />

      <div className="grid gap-3 text-xs sm:grid-cols-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wallet className="h-3.5 w-3.5 shrink-0" />
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <PaymentStatusBadge status={e.paymentStatus} />
            <b className="text-foreground">{formatFcfa(e.amountPaid)}</b>
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Award className="h-3.5 w-3.5 shrink-0" />
          <span className="inline-flex flex-wrap items-center gap-1.5">
            <CertificateStatusBadge status={e.certificateStatus} />
            {e.certificateId && <code className="text-[10px]">{e.certificateId.slice(0, 8)}…</code>}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 shrink-0" /> Inscrit le {formatEnrollmentDate(e.enrolledAt)}
        </div>
        {e.completedAt && (
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Terminé le {formatEnrollmentDate(e.completedAt)}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 border-t pt-3">
        <AddPaymentDialog
          enrollmentId={e.enrollmentId}
          context={e.trainingTitle}
        />

        <CertificateActions
          enrollmentId={e.enrollmentId}
          certificateId={e.certificateId}
          certificateStatus={e.certificateStatus}
          progress={e.progress}
          context={e.trainingTitle}
        />
      </div>
    </div>
  );
}