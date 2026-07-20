import type { Appointment } from "@/types";
import { seedAppointments } from "@/data/seedAppointments";
import { makeApi } from "./_makeApi";

export const appointmentsApi = makeApi<Appointment>(seedAppointments);
