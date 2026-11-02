import type { useAdminTrainingDetail } from "@/stores/useTrainingsStore";
import type { AdminTrainingPayload, TrainingStatus } from "@/data/trainings";

export type TrainingDetailItem = NonNullable<ReturnType<typeof useAdminTrainingDetail>["item"]>;

export const STATUS_OPTIONS: { value: TrainingStatus; label: string }[] = [
  { value: "draft", label: "Brouillon" },
  { value: "published", label: "Publiée" },
  { value: "archived", label: "Archivée" },
];

export function toPayload(t: TrainingDetailItem): AdminTrainingPayload {
  return {
    title: t.title, theme_id: t.themeId, duration: t.duration, duration_hours: t.durationHours,
    level: t.level, price: t.price, max_seats: t.maxSeats ?? 0, short: t.short, audience: t.audience,
    objectives: [...t.objectives], prerequisites: [...t.prerequisites],
    program: t.program.map((m) => ({ title: m.title, items: [...m.items] })),
    certification: t.certification, schedule: t.schedule,
    registration_fee: t.registrationFee ?? 0, access_min_ratio: t.accessMinRatio ?? 0,
    registration_deadline: t.registrationDeadline ?? "", start_date: t.startDate ?? "", end_date: t.endDate ?? "",
    location: t.location ?? "", waiting_list_enabled: t.waitingListEnabled ?? false,
    cover_color: t.coverColor ?? "", status: t.status ?? "draft",
  };
}

export const formatAssignedAt = (d: string) => new Date(d).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
export const formatDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString("fr-FR") : "-");