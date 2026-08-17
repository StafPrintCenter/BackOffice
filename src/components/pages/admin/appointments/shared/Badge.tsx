import { APPOINTMENT_STATUS_BADGES, APPOINTMENT_STATUS_LABELS, type AppointmentStatus } from "@/data/appointments";

interface AppointmentBadgeProps {
  status: AppointmentStatus;
}

export function AppointmentBadge({ status }: AppointmentBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${APPOINTMENT_STATUS_BADGES[status]}`}>
      {APPOINTMENT_STATUS_LABELS[status]}
    </span>
  );
}