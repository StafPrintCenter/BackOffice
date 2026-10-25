import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, DataTable } from "@/components/site";
import { GraduationCap, ClipboardClock, UserRoundPlus, Speech } from "lucide-react";
import { PaymentsFilters, type PaymentsFiltersValue } from "@/components/trainings/payments/PaymentsFilters";
import { PaymentsSummary } from "@/components/trainings/payments/PaymentsSummary";
import { PaymentMethodBadge } from "@/components/trainings/payments/PaymentMethodBadge";
import { PaymentStatusBadge } from "@/components/trainings/enrollments/EnrollmentBadges";
import { formatFcfa } from "@/data/trainingEnrollments";
import { formatPaymentDate, APIPaymentListItem } from "@/data/trainingPayments";
import { useTrainingPaymentsList } from "@/stores/useTrainingPaymentsStore";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
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
  const debouncedQuery = useDebouncedValue(filters.query, 400);

  const { payments, summary, meta, isLoading, isError } = useTrainingPaymentsList({
    ...filters,
    query: debouncedQuery,
    page,
    perPage: 12,
  });

  const updateFilters = (v: PaymentsFiltersValue) => { setFilters(v); setPage(1); };

  return (
    <>
      <PageHeader
        title="Paiements"
        description="Tous les paiements des formations."
      />

      {/* Raccourci */}
      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link to="/trainings/catalogs" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <GraduationCap className="h-4 w-4" /> Voir le catalogue des formations
        </Link>

        <Link to="/trainings/reviews" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <ClipboardClock className="h-4 w-4" /> Voir les soumissions en attente
        </Link>

        <Link to="/trainings/registrations" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <UserRoundPlus className="h-4 w-4" /> Voir les inscriptions
        </Link>

        <Link to="/trainings/sessions" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
          <Speech className="h-4 w-4" /> Voir sessions
        </Link>
      </div>

      {summary && <PaymentsSummary summary={summary} />}
      <PaymentsFilters value={filters} onChange={updateFilters} onReset={() => updateFilters(EMPTY)} />

      {isError ? (
        <div className="rounded-2xl border bg-card p-12 text-center text-destructive">
          Impossible de charger les paiements.
        </div>
      ) : (
        <DataTable<APIPaymentListItem>
          data={payments}
          isLoading={isLoading}
          searchKeys={["studentName", "studentEmail", "trainingTitle", "reference"]}
          onView={(r) => navigate({ to: "/trainings/payments/$id", params: { id: r.paymentId } })}
          columns={[
            {
              key: "paidAt",
              label: "Date",
              render: (r) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatPaymentDate(r.paidAt)}</span>,
            },
            {
              key: "studentName",
              label: "Apprenant",
              render: (r) => (
                <div>
                  <div className="font-medium">{r.studentName}</div>
                  <div className="text-xs text-muted-foreground">{r.studentEmail}</div>
                </div>
              ),
            },
            {
              key: "trainingTitle",
              label: "Formation",
              render: (r) => <span>{r.trainingTitle}</span>,
            },
            {
              key: "amount",
              label: "Montant",
              render: (r) => <span className="whitespace-nowrap font-semibold">{formatFcfa(r.amount)}</span>,
            },
            {
              key: "method",
              label: "Moyen",
              render: (r) => <PaymentMethodBadge method={r.method} />,
            },
            {
              key: "paymentStatus",
              label: "Solde inscription",
              render: (r) => (
                <div className="flex items-center gap-2">
                  <PaymentStatusBadge status={r.paymentStatus} />
                  <span className="text-xs text-muted-foreground">reste {formatFcfa(r.enrollmentRemaining)}</span>
                </div>
              ),
            },
          ]}
        />
      )}

    </>
  );
}