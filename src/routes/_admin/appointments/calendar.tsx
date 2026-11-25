import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/site";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentBadge } from "@/components/pages/appointments/shared/Badge";
import { type APIAppointmentCalendarDay } from "@/data/appointments";
import { SITE } from "@/data/site";
import { useAdminAppointmentCalendar } from "@/stores/useAppointmentsStore";

export const Route = createFileRoute("/_admin/appointments/calendar")({
  head: () => ({
    meta: [
      { title: `Calendrier des rendez-vous | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminAppointmentsCalendar,
});

function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function getAppointments(day: APIAppointmentCalendarDay | undefined) {
  return (
    day?.slots
      .flatMap((slot) => slot.appointments.map((appointment) => ({ appointment, time: slot.time })))
      .sort((a, b) => a.time.localeCompare(b.time)) ?? []
  );
}

function AdminAppointmentsCalendar() {
  const navigate = useNavigate();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  const firstGridDay = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 1 });
  const lastGridDay = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 1 });
  const from = toDateKey(firstGridDay);
  const to = toDateKey(lastGridDay);
  const { calendar, isLoading, isError } = useAdminAppointmentCalendar(from, to);
  const daysByDate = useMemo(() => {
    const days = new Map<string, APIAppointmentCalendarDay>();
    calendar?.days.forEach((day) => days.set(day.date, day));
    return days;
  }, [calendar]);
  const calendarDays = eachDayOfInterval({ start: firstGridDay, end: lastGridDay });
  const weekdays = eachDayOfInterval({
    start: new Date(2024, 0, 1),
    end: new Date(2024, 0, 7),
  });
  const selectedDay = daysByDate.get(selectedDate);
  const selectedAppointments = getAppointments(selectedDay);
  const selectedDateValue = new Date(`${selectedDate}T00:00:00`);

  const changeMonth = (amount: number) => {
    const nextMonth = startOfMonth(addMonths(visibleMonth, amount));
    setVisibleMonth(nextMonth);
    setSelectedDate(toDateKey(nextMonth));
  };

  const selectDate = (date: Date) => {
    setSelectedDate(toDateKey(date));
    if (!isSameMonth(date, visibleMonth)) setVisibleMonth(startOfMonth(date));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendrier des rendez-vous"
        description="Consultez les rendez-vous par date et accédez à leur suivi."
        actions={
          <Button variant="outline" onClick={() => navigate({ to: "/appointments/liste" })}>
            Liste des rendez-vous
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 capitalize">
              <CalendarDays className="h-5 w-5 text-primary" />
              {format(visibleMonth, "MMMM yyyy", { locale: fr })}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="outline"
                aria-label="Mois précédent"
                onClick={() => changeMonth(-1)}
              >
                <ChevronLeft />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const today = new Date();
                  setVisibleMonth(startOfMonth(today));
                  setSelectedDate(toDateKey(today));
                }}
              >
                Aujourd'hui
              </Button>
              <Button
                size="icon"
                variant="outline"
                aria-label="Mois suivant"
                onClick={() => changeMonth(1)}
              >
                <ChevronRight />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isError && (
              <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                Impossible de charger le calendrier des rendez-vous.
              </p>
            )}
            {isLoading && (
              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Chargement du calendrier...
              </div>
            )}

            <div className="grid grid-cols-7 border-l border-t">
              {weekdays.map((weekday) => (
                <div
                  key={weekday.toISOString()}
                  className="border-b border-r bg-muted/40 py-2 text-center text-[10px] font-semibold uppercase text-muted-foreground sm:text-xs"
                >
                  {format(weekday, "EEE", { locale: fr })}
                </div>
              ))}
              {calendarDays.map((date) => {
                const dateKey = toDateKey(date);
                const day = daysByDate.get(dateKey);
                const appointments = getAppointments(day);
                const selected = dateKey === selectedDate;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    aria-label={`${format(date, "d MMMM yyyy", { locale: fr })}, ${appointments.length} rendez-vous`}
                    aria-pressed={selected}
                    onClick={() => selectDate(date)}
                    className={[
                      "min-h-16 border-b border-r p-1 text-left align-top transition-colors sm:min-h-24 sm:p-2",
                      selected ? "bg-primary/10 ring-1 ring-inset ring-primary" : "hover:bg-muted/50",
                      isSameMonth(date, visibleMonth) ? "" : "text-muted-foreground/60",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={[
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                          isToday(date) ? "bg-primary text-primary-foreground" : "",
                        ].join(" ")}
                      >
                        {format(date, "d")}
                      </span>
                      {appointments.length > 0 && (
                        <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          {appointments.length}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 hidden space-y-1 sm:block">
                      {appointments.slice(0, 2).map(({ appointment, time }) => (
                        <div
                          key={appointment.id}
                          className="truncate rounded bg-muted px-1 py-0.5 text-[10px] leading-4"
                          title={`${time} · ${appointment.firstName} ${appointment.lastName}`}
                        >
                          {time} · {appointment.firstName}
                        </div>
                      ))}
                      {appointments.length > 2 && (
                        <div className="text-[10px] text-muted-foreground">
                          +{appointments.length - 2} autres
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="capitalize">
              {format(selectedDateValue, "EEEE d MMMM yyyy", { locale: fr })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {isLoading ? "Chargement des rendez-vous..." : "Aucun rendez-vous prévu pour cette date."}
              </p>
            ) : (
              selectedAppointments.map(({ appointment, time }) => (
                <button
                  key={appointment.id}
                  type="button"
                  onClick={() =>
                    navigate({ to: "/appointments/liste/$id", params: { id: appointment.id } })
                  }
                  className="w-full rounded-xl border p-3 text-left transition-colors hover:bg-muted/50"
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
      </div>
    </div>
  );
}
