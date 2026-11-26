import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader, DataTable } from "@/components/site";
import { GraduationCap, ClipboardClock, UserRoundPlus, Speech } from "lucide-react";
import { PaymentsFilters, type PaymentsFiltersValue } from "@/components/pages/trainings/payments/Filters";
import { PaymentsSummary } from "@/components/pages/trainings/payments/Summary";
import { PaymentMethodBadge } from "@/components/pages/trainings/payments/MethodBadge";
import { PaymentStatusBadge } from "@/components/pages/trainings/enrollments/Badges";
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
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/trainings/catalogs" })}>
              <GraduationCap className="h-4 w-4" /> Catalogue des formations
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/trainings/reviews" })}>
              <ClipboardClock className="h-4 w-4" /> Soumissions en attente
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/trainings/registrations" })}>
              <UserRoundPlus className="h-4 w-4" /> Inscriptions
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/trainings/sessions" })}>
              <Speech className="h-4 w-4" /> Sessions
            </Button>
          </div>
        }
      />

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