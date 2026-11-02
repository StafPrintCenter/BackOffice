import { Globe, MapPin } from "lucide-react";
import {
  MODALITY_LABELS, REVIEW_STATUS_LABELS, SESSION_STATUS_LABELS,
  type ReviewStatus, type SessionModality, type SessionStatus,
} from "@/data/trainingSessions";

const base = "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold";

export const SessionStatusBadge = ({ status }: { status: SessionStatus }) => (
  <span className={`${base} ${status === "published" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600" : "border-rose-500/20 bg-rose-500/10 text-destructive"}`}>
    {SESSION_STATUS_LABELS[status] ?? status}
  </span>
);

export const ModalityBadge = ({ modality }: { modality: SessionModality }) => {
  const Icon = modality === "online" ? Globe : MapPin;
  return (
    <span className={`${base} border-border bg-muted/50 text-muted-foreground`}>
      <Icon className="h-3 w-3" /> {MODALITY_LABELS[modality] ?? modality}
    </span>
  );
};

const REVIEW_CLASS: Record<ReviewStatus, string> = {
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-600",
  validated: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  rejected: "border-rose-500/20 bg-rose-500/10 text-destructive",
};

export const ReviewStatusBadge = ({ status }: { status: ReviewStatus }) => (
  <span className={`${base} ${REVIEW_CLASS[status] ?? "border-border bg-muted text-muted-foreground"}`}>
    {REVIEW_STATUS_LABELS[status] ?? status}
  </span>
);