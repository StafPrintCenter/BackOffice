import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, DataTable } from "@/components/site";
import { GraduationCap, ClipboardClock, UserRoundPlus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentsFilters, type PaymentsFiltersValue } from "@/components/trainings/payments/PaymentsFilters";
import { PaymentsSummary } from "@/components/trainings/payments/PaymentsSummary";
import { PaymentMethodBadge } from "@/components/trainings/payments/PaymentMethodBadge";
import { PaymentStatusBadge } from "@/components/trainings/enrollments/EnrollmentBadges";
import { formatFcfa } from "@/data/trainingEnrollments";
import { formatPaymentDate } from "@/data/trainingPayments";
import { useTrainingPaymentsList } from "@/stores/useTrainingPaymentsStore";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/trainings/payments/")({
  head: () => ({ meta: [{ title: `Paiements | ${SITE.name}` }, { name: "robots", content: "noindex" }] }),
  component: PaymentsPage,
});

const EMPTY: PaymentsFiltersValue = { query: "", method: "", from: "", to: "" };

function PaymentsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<PaymentsFiltersValue>(EMPTY);
  const [page, setPage] = useState(1);

  const { payments, summary, meta, isLoading, isError } = useTrainingPaymentsList({ ...filters, page, perPage: 12 });

  const updateFilters = (v: PaymentsFiltersValue) => { setFilters(v); setPage(1); };

  return (
    <>
      <PageHeader
        title="Paiements"
        description="Tous les paiements des formations."
      />

      {/* Raccourci */}
      <div className="flex items-center gap-6 mb-4">
        <Link to="/trainings/catalogs" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <GraduationCap className="h-4 w-4" /> Voir le catalogue des formations
        </Link>

        <Link to="/trainings/reviews" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ClipboardClock className="h-4 w-4" /> Voir les soummissions en attentes
        </Link>

        <Link to="/trainings/registrations" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <UserRoundPlus className="h-4 w-4" /> Voir les inscriptions
        </Link>
      </div>

      {summary && <PaymentsSummary summary={summary} />}
      <PaymentsFilters value={filters} onChange={updateFilters} onReset={() => updateFilters(EMPTY)} />

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Apprenant</th>
              <th className="px-4 py-3">Formation</th>
              <th className="px-4 py-3 text-right">Montant</th>
              <th className="px-4 py-3">Moyen</th>
              <th className="px-4 py-3">Solde inscription</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" /> Chargement…
              </td></tr>
            ) : isError ? (
              <tr><td colSpan={6} className="py-12 text-center text-destructive">Impossible de charger les paiements.</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">Aucun paiement ne correspond.</td></tr>
            ) : (
              payments.map((p) => (
                <tr
                  key={p.paymentId}
                  onClick={() => navigate({ to: "/trainings/payments/$id", params: { id: p.paymentId } })}
                  className="cursor-pointer border-b last:border-0 hover:bg-muted/40"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{formatPaymentDate(p.paidAt)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{p.studentName}</div>
                    <div className="text-xs text-muted-foreground">{p.studentEmail}</div>
                  </td>
                  <td className="px-4 py-3">{p.trainingTitle}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-semibold">{formatFcfa(p.amount)}</td>
                  <td className="px-4 py-3"><PaymentMethodBadge method={p.method} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <PaymentStatusBadge status={p.paymentStatus} />
                      <span className="text-xs text-muted-foreground">reste {formatFcfa(p.enrollmentRemaining)}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.lastPage > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="mr-1 h-4 w-4" /> Précédent
          </Button>
          <span className="text-muted-foreground">Page {meta.currentPage} / {meta.lastPage} · {meta.total} paiements</span>
          <Button variant="outline" size="sm" disabled={page >= meta.lastPage} onClick={() => setPage((p) => p + 1)}>
            Suivant <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
}