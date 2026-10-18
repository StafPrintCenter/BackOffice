import {
  getCertificateStatusMeta, getEnrollmentStatusMeta, getPaymentStatusMeta,
} from "@/data/trainingEnrollments";

const base = "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold";

export const EnrollmentStatusBadge = ({ status }: { status: string }) => {
  const m = getEnrollmentStatusMeta(status);
  return <span className={`${base} ${m.className}`}>{m.label}</span>;
};

export const PaymentStatusBadge = ({ status }: { status: string }) => {
  const m = getPaymentStatusMeta(status);
  return <span className={`${base} ${m.className}`}>{m.label}</span>;
};

export const CertificateStatusBadge = ({ status }: { status: string }) => {
  const m = getCertificateStatusMeta(status);
  return <span className={`${base} ${m.className}`}>{m.label}</span>;
};