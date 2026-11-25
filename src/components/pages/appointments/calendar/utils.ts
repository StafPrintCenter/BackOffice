import { format } from "date-fns";
import type { APIAdminAppointment, APIAppointmentCalendarDay } from "@/data/appointments";

export type CalendarAppointment = {
  appointment: APIAdminAppointment;
  time: string;
};

export function toCalendarDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function getCalendarAppointments(day: APIAppointmentCalendarDay | undefined) {
  return (
    day?.slots
      .flatMap((slot) => slot.appointments.map((appointment) => ({ appointment, time: slot.time })))
      .sort((a, b) => a.time.localeCompare(b.time)) ?? []
  );
}
