import { Calendar, Clock, MessageCircle, User } from "lucide-react";
import { type APIAdminAppointment } from "@/data/appointments";
import { formatDate } from "../shared/utils";

interface AppointmentDetailContentProps {
  appointment: APIAdminAppointment;
}

export function AppointmentDetailContent({ appointment: a }: AppointmentDetailContentProps) {
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-2 border-b pb-3 font-display text-lg font-semibold">
        <MessageCircle className="h-5 w-5 text-primary" /> Détails du rendez-vous
      </div>

      <div className="grid gap-3 rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <span>Contact : <b className="text-foreground">{a.firstName} {a.lastName}</b></span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span>Créneau : <b className="text-foreground">{formatDate(a.scheduledAt)}</b></span>
        </div>
        {a.whatsapp && (
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span>WhatsApp : <b className="text-foreground">{a.whatsapp}</b></span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span>Reçu le : <b className="text-foreground">{formatDate(a.createdAt)}</b></span>
        </div>
      </div>

      <div className="rounded-xl border bg-muted/40 p-4 text-sm leading-relaxed whitespace-pre-wrap">
        {a.message || "Aucun message."}
      </div>
    </div>
  );
}