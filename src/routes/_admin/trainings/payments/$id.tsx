import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentMethodBadge } from "@/components/trainings/payments/PaymentMethodBadge";
import { AddPaymentDialog } from "@/components/trainings/payments/AddPaymentDialog";
import { EnrollmentStatusBadge, PaymentStatusBadge } from "@/components/trainings/enrollments/EnrollmentBadges";
import { ProgressBar } from "@/components/trainings/enrollments/ProgressBar";
import { formatEnrollmentDate, formatFcfa } from "@/data/trainingEnrollments";
import { formatPaymentDate } from "@/data/trainingPayments";
import { useTrainingPaymentDetail } from "@/stores/useTrainingPaymentsStore";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/trainings/payments/$id")({
  head: () => ({ meta: [{ title: `Paiement | ${SITE.name}` }, { name: "robots", content: "noindex" }] }),
  component: PaymentDetail,
});

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function PaymentDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { detail, isLoading } = useTrainingPaymentDetail(id);

  const back = (
    <Button variant="outline" size="sm" onClick={() => navigate({ to: "/trainings/payments" })}>
      <ArrowLeft className="mr-1 h-4 w-4" /> Retour
    </Button>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…
      </div>
    );
  }

  if (!detail) {
    return (
      <>
        <div className="mb-6">{back}</div>
        <p className="text-muted-foreground">Paiement introuvable.</p>
      </>
    );
  }

  const { data: p, enrollment: e, student: s, training: t, enrollmentPayments } = detail;
  const thresholdPct = Math.round(t.accessMinRatio * 100);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        {back}
        <AddPaymentDialog enrollmentId={e.id} context={`${s.name} - ${t.title}`} size="default" />
      </div>

      <div className="grid max-w-5xl gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Paiement */}
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Paiement</p>
                <h1 className="font-display text-3xl font-bold">{formatFcfa(p.amount)}</h1>
              </div>
              <PaymentMethodBadge method={p.method} />
            </div>
            <div className="mt-4">
              <Row label="Référence" value={p.reference || "-"} />
              <Row label="Payé le" value={formatPaymentDate(p.paidAt)} />
              <Row label="Enregistré le" value={formatPaymentDate(p.createdAt)} />
              <Row label="Enregistré par" value={p.recordedBy?.name ?? "-"} />
            </div>
          </div>

          {/* Effet sur le solde */}
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="mb-3 font-display font-semibold">Effet sur le solde</h2>
            <Row label="Prix de la formation" value={formatFcfa(p.balance.trainingPrice)} />
            <Row label="Versé avant ce paiement" value={formatFcfa(p.balance.paidBefore)} />
            <Row label="Versé après" value={formatFcfa(p.balance.paidAfter)} />
            <Row label="Reste avant" value={formatFcfa(p.balance.remainingBefore)} />
            <Row label="Reste après" value={formatFcfa(p.balance.remainingAfter)} />
            <Row label={`Seuil de déblocage (${thresholdPct} %)`} value={formatFcfa(p.balance.unlockThreshold)} />
            {p.balance.unlockedByThisPayment && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-600">
                <KeyRound className="h-3.5 w-3.5" /> Ce paiement a débloqué l'accès au contenu.
              </p>
            )}
          </div>

          {/* Historique de l'inscription */}
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 font-display font-semibold">Historique des paiements de l'inscription</h2>
            <ol className="space-y-2">
              {enrollmentPayments.map((h) => (
                <li key={h.paymentId}>
                  <Link
                    to="/trainings/payments/$id"
                    params={{ id: h.paymentId }}
                    className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm transition hover:bg-muted/50 ${h.isCurrent ? "border-primary bg-primary/5" : ""
                      }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <b>{formatFcfa(h.amount)}</b>
                        <PaymentMethodBadge method={h.method} />
                        {h.isCurrent && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">Actuel</span>}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{formatPaymentDate(h.paidAt)}{h.reference && ` · ${h.reference}`}</div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>Cumul : <b className="text-foreground">{formatFcfa(h.cumulativePaid)}</b></div>
                      <div>Reste : {formatFcfa(h.remainingAfter)}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><User className="h-4 w-4" /> Apprenant</h2>
            <Link to="/members/students/$id" params={{ id: s.id }} className="font-medium text-primary hover:underline">{s.name}</Link>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {s.email}</div>
              {s.phone && <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {s.phone}</div>}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5">
            <h2 className="mb-3 font-semibold">Formation</h2>
            <Link to="/trainings/catalogs/$id" params={{ id: t.id }} className="font-medium text-primary hover:underline">{t.title}</Link>
            <div className="mt-1 text-xs text-muted-foreground">Prix : {formatFcfa(t.price)}</div>
          </div>

          <div className="space-y-3 rounded-2xl border bg-card p-5">
            <h2 className="font-semibold">Inscription</h2>
            <div className="flex flex-wrap gap-1.5">
              <EnrollmentStatusBadge status={e.status} />
              <PaymentStatusBadge status={e.paymentStatus} />
            </div>
            <ProgressBar value={e.progress} />
            <Row label="Versé" value={formatFcfa(e.amountPaid)} />
            <Row label="Reste" value={formatFcfa(e.remaining)} />
            <Row
              label="Accès au contenu"
              value={e.accessUnlocked
                ? <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Débloqué</span>
                : <span className="inline-flex items-center gap-1 text-muted-foreground"><Lock className="h-3.5 w-3.5" /> Verrouillé</span>}
            />
            {e.accessUnlockedAt && <Row label="Débloqué le" value={formatEnrollmentDate(e.accessUnlockedAt)} />}
            <Row label="Inscrit le" value={formatEnrollmentDate(e.enrolledAt)} />
            {e.completedAt && <Row label="Terminé le" value={formatEnrollmentDate(e.completedAt)} />}
          </div>
        </div>
      </div>
    </>
  );
}