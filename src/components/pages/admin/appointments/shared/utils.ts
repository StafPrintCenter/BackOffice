import { MapPin, Video } from "lucide-react";
import { APPOINTMENT_MODE_LABELS, type AppointmentMode } from "@/data/appointments";

export const modeIcon = (m: AppointmentMode) =>
  ({ presentiel: MapPin, en_ligne: Video }[m]);

export const modeLabel = (m: AppointmentMode) => APPOINTMENT_MODE_LABELS[m];

export const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "-";
  return new Date(dateStr.replace("Z", "")).toLocaleString("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};