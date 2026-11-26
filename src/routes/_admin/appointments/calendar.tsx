import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { PageHeader } from "@/components/site";
import { Button } from "@/components/ui/button";
import { DayAppointments, MonthView } from "@/components/pages/appointments/calendar";
import type { APIAppointmentCalendarDay } from "@/data/appointments";
import { SITE } from "@/data/site";
import { useAdminAppointmentCalendar } from "@/stores/useAppointmentsStore";
import { toCalendarDateKey } from "@/components/pages/appointments/calendar/utils";

export const Route = createFileRoute("/_admin/appointments/calendar")({
  head: () => ({
    meta: [
      { title: `Calendrier des rendez-vous | ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminAppointmentsCalendar,
});

function AdminAppointmentsCalendar() {
  const navigate = useNavigate();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => toCalendarDateKey(new Date()));

  const firstGridDay = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 1 });
  const lastGridDay = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 1 });
  const from = toCalendarDateKey(firstGridDay);
  const to = toCalendarDateKey(lastGridDay);
  const { calendar, isLoading, isError } = useAdminAppointmentCalendar(from, to);
  const daysByDate = useMemo(() => {
    const days = new Map<string, APIAppointmentCalendarDay>();
    calendar?.days.forEach((day) => days.set(day.date, day));
    return days;
  }, [calendar]);
  const calendarDays = eachDayOfInterval({ start: firstGridDay, end: lastGridDay });

  const changeMonth = (amount: number) => {
    const nextMonth = startOfMonth(addMonths(visibleMonth, amount));
    setVisibleMonth(nextMonth);
    setSelectedDate(toCalendarDateKey(nextMonth));
  };

  const selectDate = (date: Date) => {
    setSelectedDate(toCalendarDateKey(date));
    if (!isSameMonth(date, visibleMonth)) setVisibleMonth(startOfMonth(date));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendrier des rendez-vous"
        description="Consultez les rendez-vous par date et accédez à leur suivi."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate({ to: "/appointments/liste" })}>
              <CalendarClock className="h-4 w-4" /> Liste des rendez-vous
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <MonthView
          visibleMonth={visibleMonth}
          selectedDate={selectedDate}
          calendarDays={calendarDays}
          daysByDate={daysByDate}
          isLoading={isLoading}
          isError={isError}
          onMonthChange={changeMonth}
          onToday={() => {
            const today = new Date();
            setVisibleMonth(startOfMonth(today));
            setSelectedDate(toCalendarDateKey(today));
          }}
          onSelectDate={selectDate}
        />
        <DayAppointments
          date={selectedDate}
          day={daysByDate.get(selectedDate)}
          isLoading={isLoading}
          onOpenAppointment={(id) =>
            navigate({ to: "/appointments/liste/$id", params: { id } })
          }
        />
      </div>
    </div>
  );
}
