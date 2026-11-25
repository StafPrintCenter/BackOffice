import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Clock3 } from "lucide-react";
import { AppointmentBadge } from "@/components/pages/appointments/shared/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { APIAppointmentCalendarDay } from "@/data/appointments";
import { getCalendarAppointments } from "./utils";

interface DayAppointmentsProps {
  date: string;
  day: APIAppointmentCalendarDay | undefined;
  isLoading: boolean;
  onOpenAppointment: (id: string) => void;
}

export function DayAppointments({
  date,
  day,
  isLoading,
  onOpenAppointment,
}: DayAppointmentsProps) {
  const appointments = getCalendarAppointments(day);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">
          {format(new Date(`${date}T00:00:00`), "EEEE d MMMM yyyy", { locale: fr })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {appointments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Chargement des rendez-vous..." : "Aucun rendez-vous prévu pour cette date."}
          </p>
        ) : (
          appointments.map(({ appointment, time }) => (
            <button
              key={appointment.id}
              type="button"
              onClick={() => onOpenAppointment(appointment.id)}
              className="w-full rounded-xl border p-3 text-left transition-colors hover:bg-muted/50 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {appointment.firstName} {appointment.lastName}
                  </div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">
                    {appointment.subject}
                  </div>
                </div>
                <AppointmentBadge status={appointment.status} />
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                {time} · {appointment.duration} min
              </div>
            </button>
          ))
        )}
      </CardContent>
    </Card>
  );
}
