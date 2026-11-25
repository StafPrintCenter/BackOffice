import {
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
import { CalendarDays, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { APIAppointmentCalendarDay } from "@/data/appointments";
import { getCalendarAppointments, toCalendarDateKey } from "./utils";

interface MonthViewProps {
  visibleMonth: Date;
  selectedDate: string;
  calendarDays: Date[];
  daysByDate: ReadonlyMap<string, APIAppointmentCalendarDay>;
  isLoading: boolean;
  isError: boolean;
  onMonthChange: (amount: number) => void;
  onToday: () => void;
  onSelectDate: (date: Date) => void;
}

const weekdays = eachDayOfInterval({
  start: new Date(2024, 0, 1),
  end: new Date(2024, 0, 7),
});

export function MonthView({
  visibleMonth,
  selectedDate,
  calendarDays,
  daysByDate,
  isLoading,
  isError,
  onMonthChange,
  onToday,
  onSelectDate,
}: MonthViewProps) {
  return (
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
            onClick={() => onMonthChange(-1)}
          >
            <ChevronLeft />
          </Button>
          <Button size="sm" variant="ghost" onClick={onToday}>
            Aujourd'hui
          </Button>
          <Button
            size="icon"
            variant="outline"
            aria-label="Mois suivant"
            onClick={() => onMonthChange(1)}
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
              key={toCalendarDateKey(weekday)}
              className="border-b border-r bg-muted/40 py-2 text-center text-[10px] font-semibold uppercase text-muted-foreground sm:text-xs"
            >
              {format(weekday, "EEE", { locale: fr })}
            </div>
          ))}
          {calendarDays.map((date) => {
            const dateKey = toCalendarDateKey(date);
            const appointments = getCalendarAppointments(daysByDate.get(dateKey));
            const selected = dateKey === selectedDate;

            return (
              <button
                key={dateKey}
                type="button"
                aria-label={`${format(date, "d MMMM yyyy", { locale: fr })}, ${appointments.length} rendez-vous`}
                aria-pressed={selected}
                onClick={() => onSelectDate(date)}
                className={[
                  "min-h-16 border-b border-r p-1 text-left align-top transition-colors sm:min-h-24 sm:p-2 cursor-pointer",
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
  );
}
