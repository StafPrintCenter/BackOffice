import { Award, CalendarClock, ListChecks, PercentCircle, Palette, Users, Wallet } from "lucide-react";
import { getTrainingEnrollmentStatusBadge } from "@/data/trainings";
import { formatDate, type TrainingDetailItem } from "./training-form";

export function TrainingDetailSidebar({ training, mainColor }: { training: TrainingDetailItem; mainColor: string }) {
  const badge = getTrainingEnrollmentStatusBadge(training.enrollmentStatus);
  const Row = ({ icon: Icon, children }: { icon: typeof Users; children: React.ReactNode }) => (
    <div className="flex items-start gap-2 text-muted-foreground"><Icon className="mt-0.5 h-4 w-4 shrink-0" /><span>{children}</span></div>
  );

  return (
    <div className="h-fit space-y-4 lg:sticky lg:top-6">
      <div className="rounded-2xl border bg-card p-6">
        <div className="font-display text-3xl font-bold" style={{ color: mainColor }}>{training.price.toLocaleString()} FCFA</div>
        <div className="mt-4 space-y-3 text-sm">
          <Row icon={Users}>{training.audience || "-"}</Row>
          <Row icon={Award}>{training.certification || "-"}</Row>
          <Row icon={CalendarClock}>{training.schedule || "-"}</Row>
          {training.coverColor && (
            <Row icon={Palette}>
              <span className="flex items-center gap-2">Couleur : <span className="font-mono text-xs uppercase">{training.coverColor}</span>
                <span className="h-4 w-4 shrink-0 rounded-md border shadow-sm" style={{ backgroundColor: training.coverColor }} /></span>
            </Row>
          )}
          {!!training.registrationFee && training.registrationFee > 0 && <Row icon={Wallet}>Frais d'inscription : {training.registrationFee.toLocaleString()} FCFA</Row>}
          {training.accessMinRatio !== undefined && training.accessMinRatio !== null && <Row icon={PercentCircle}>Ratio d'accès min. : {Math.round(training.accessMinRatio * 100)}%</Row>}
        </div>

        <div className="mt-4 space-y-1.5 border-t pt-4 text-xs text-muted-foreground">
          <div>Inscriptions jusqu'au : {formatDate(training.registrationDeadline)}</div>
          <div>Début : {formatDate(training.startDate)}</div>
          <div>Fin : {formatDate(training.endDate)}</div>
          <div>Liste d'attente : {training.waitingListEnabled ? "Activée" : "Désactivée"}</div>
        </div>

        {training.prerequisites.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><ListChecks className="h-3.5 w-3.5" /> Prérequis</div>
            <ul className="space-y-1 text-sm">
              {training.prerequisites.map((p: string, i: number) => (
                <li key={i} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: mainColor }} /> {p}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-2 rounded-2xl border bg-card p-4 text-xs text-muted-foreground">
        <div className="flex items-center justify-between"><span>Places restantes :</span><span className="font-semibold text-foreground">{training.seatsRemaining ?? "-"} / {training.maxSeats ? training.maxSeats : "∞"}</span></div>
        <div className="flex items-center justify-between"><span>Nombre d'étudiants :</span><span className="font-semibold text-foreground">{training.currentStudents}</span></div>
        <div className="flex items-center justify-between pt-1"><span>Statut d'inscription :</span>
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}>{badge.label}</span>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4 text-xs text-muted-foreground">
        <div>Créée le {new Date(training.createdAt).toLocaleDateString("fr-FR")}</div>
        <div>Modifiée le {new Date(training.updatedAt).toLocaleDateString("fr-FR")}</div>
        {training.publishedAt && <div>Publiée le {new Date(training.publishedAt).toLocaleDateString("fr-FR")}</div>}
      </div>
    </div>
  );
}