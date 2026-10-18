export type PaymentMethod = "cash" | "mobile_money" | "bank_transfer" | "other";

export const PAYMENT_METHODS: PaymentMethod[] = ["cash", "mobile_money", "bank_transfer", "other"];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Espèces",
  mobile_money: "Mobile Money",
  bank_transfer: "Virement bancaire",
  other: "Autre",
};

export const getPaymentMethodLabel = (m: string) => PAYMENT_METHOD_LABELS[m as PaymentMethod] ?? m;

export type APIPaymentListItem = {
  paymentId: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  paidAt: string;
  recordedBy: string | null;
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  trainingId: string;
  trainingTitle: string;
  trainingPrice: number;
  enrollmentAmountPaid: number;
  enrollmentRemaining: number;
  paymentStatus: string;
};

export type APIPaymentsSummary = {
  totalAmount: number;
  byMethod: { method: PaymentMethod; count: number; total: number }[];
};

export type APIPaymentDetailResponse = {
  data: {
    paymentId: string;
    amount: number;
    method: PaymentMethod;
    reference: string | null;
    paidAt: string;
    createdAt: string;
    recordedBy: { id: string; name: string } | null;
    balance: {
      trainingPrice: number;
      paidBefore: number;
      paidAfter: number;
      remainingBefore: number;
      remainingAfter: number;
      unlockThreshold: number;
      unlockedByThisPayment: boolean;
    };
  };
  enrollment: {
    id: string;
    status: string;
    paymentStatus: string;
    progress: number;
    amountPaid: number;
    remaining: number;
    accessUnlocked: boolean;
    accessUnlockedAt: string | null;
    enrolledAt: string;
    completedAt: string | null;
  };
  student: { id: string; name: string; email: string; phone: string | null };
  training: { id: string; title: string; price: number; accessMinRatio: number };
  enrollmentPayments: {
    paymentId: string;
    amount: number;
    method: PaymentMethod;
    reference: string | null;
    paidAt: string;
    cumulativePaid: number;
    remainingAfter: number;
    isCurrent: boolean;
  }[];
};

export type PaymentsListParams = {
  page?: number;
  perPage?: number;
  trainingId?: string;
  enrollmentId?: string;
  studentId?: string;
  method?: PaymentMethod | "";
  from?: string;
  to?: string;
  query?: string;
};

export type CreatePaymentPayload = {
  amount: number;
  method: PaymentMethod;
  reference?: string;
  paid_at: string; // ISO 8601
};

export const formatPaymentDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";