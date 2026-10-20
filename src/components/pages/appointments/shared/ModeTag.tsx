import { type AppointmentMode } from "@/data/appointments";
import { modeIcon, modeLabel } from "./utils";

interface AppointmentModeTagProps {
  mode: AppointmentMode;
  duration?: number;
  className?: string;
}

export function AppointmentModeTag({ mode, duration, className = "bg-muted px-2 py-0.5 text-xs font-medium" }: AppointmentModeTagProps) {
  const Icon = modeIcon(mode);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${className}`}>
      <Icon className="h-3.5 w-3.5" /> {modeLabel(mode)}
      {duration !== undefined && ` · ${duration} min`}
    </span>
  );
}