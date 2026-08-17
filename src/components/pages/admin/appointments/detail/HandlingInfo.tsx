import { Clock, UserCheck } from "lucide-react";
import { formatDate } from "../shared/utils";

interface AppointmentHandlingInfoProps {
  handledBy?: string | null;
  handledAt?: string | null;
}

export function AppointmentHandlingInfo({ handledBy, handledAt }: AppointmentHandlingInfoProps) {
  if (!handledBy && !handledAt) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 text-xs text-muted-foreground">
      {handledBy && (
        <div className="flex items-center gap-1.5">
          <UserCheck className="h-4 w-4 text-primary" />
          <span>Traité par : <b className="text-foreground">{handledBy}</b></span>
        </div>
      )}
      {handledAt && (
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-primary" />
          <span>Le : <b className="text-foreground">{formatDate(handledAt)}</b></span>
        </div>
      )}
    </div>
  );
}