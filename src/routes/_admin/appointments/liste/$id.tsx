import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  useAdminAppointmentDetail,
  useAdminAppointmentCalendar,
  useUpdateAdminAppointmentStatus,
  fetchAdminAppointmentById,
} from "@/stores/useAppointmentsStore";
import { type AppointmentStatus } from "@/data/appointments";
import { SITE } from "@/data/site";
import { AppointmentDetailHeader, AppointmentDetailContent, AppointmentHandlingInfo, AppointmentSidebar } from "@/components/pages/appointments/detail";

const RESCHEDULE_NOTICE_MS = 48 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const MAX_RESCHEDULE_DAYS = 60;

function getMinimumReplacementAt() {
  return new Date(Math.ceil((Date.now() + RESCHEDULE_NOTICE_MS) / MINUTE_MS) * MINUTE_MS);
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const Route = createFileRoute("/_admin/appointments/liste/$id")({
  loader: async ({ params }) => {
    const item = await fetchAdminAppointmentById(params.id);
    return { item };
  },
  head: ({ loaderData }) => {
    const headTitle = loaderData?.item?.subject;
    return {
      meta: [
        {
          title: headTitle
            ? `Rendez-vous : ${headTitle} | ${SITE.name}`
            : `Détail rendez-vous | ${SITE.name}`,
        },
        { name: "robots", content: "noindex" },
      ],
    }
  },
  component: AppointmentDetail,
});

function AppointmentDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { item: a, isLoading } = useAdminAppointmentDetail(id);
  const updateStatus = useUpdateAdminAppointmentStatus();

  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<AppointmentStatus>("pending");
  const [notes, setNotes] = useState("");
  const [replacementDate, setReplacementDate] = useState("");
  const [replacementTime, setReplacementTime] = useState("");
  const replacementRequired = Boolean(
    a && status === "confirmed" && new Date(a.scheduledAt).getTime() < Date.now()
  );
  const minimumReplacementAt = getMinimumReplacementAt();
  const minimumReplacementDate = toDateInputValue(minimumReplacementAt);
  const maximumReplacementDate = toDateInputValue(
    new Date(Date.now() + MAX_RESCHEDULE_DAYS * 24 * 60 * 60 * 1000)
  );
  const {
    calendar: replacementCalendar,
    isLoading: isLoadingReplacementTimes,
    isError: replacementTimesError,
  } = useAdminAppointmentCalendar(
    replacementRequired ? minimumReplacementDate : undefined,
    replacementRequired ? maximumReplacementDate : undefined
  );
  const availableReplacementDates =
    replacementCalendar?.days
      .filter((day) => {
        const weekday = new Date(`${day.date}T00:00:00`).getDay();
        return (
          day.bookable &&
          weekday !== 0 &&
          day.slots.some(
            (slot) =>
              slot.available &&
              new Date(`${day.date}T${slot.time}:00`).getTime() >= minimumReplacementAt.getTime()
          )
        );
      })
      .map((day) => ({
        value: day.date,
        label: format(new Date(`${day.date}T00:00:00`), "EEEE d MMMM yyyy", { locale: fr }),
      })) ?? [];
  const availableReplacementTimes =
    replacementCalendar?.days
      .find((day) => day.date === replacementDate)
      ?.slots.filter(
        (slot) =>
          slot.available &&
          new Date(`${replacementDate}T${slot.time}:00`).getTime() >= minimumReplacementAt.getTime()
      )
      .map((slot) => slot.time) ?? [];

  useEffect(() => {
    if (a) {
      setStatus(a.status);
      setNotes(a.adminNotes ?? "");
      setReplacementDate("");
      setReplacementTime("");
    }
  }, [a]);

  const handleCancel = () => {
    if (a) {
      setStatus(a.status);
      setNotes(a.adminNotes ?? "");
      setReplacementDate("");
      setReplacementTime("");
    }
    setIsEditing(false);
  };

  const handleSave = () => {
    if (replacementRequired && (!replacementDate || !replacementTime)) {
      toast.error("Choisissez une nouvelle date et une nouvelle heure pour confirmer ce rendez-vous.");
      return;
    }
    if (
      replacementRequired &&
      new Date(`${replacementDate}T${replacementTime}:00`).getTime() < getMinimumReplacementAt().getTime()
    ) {
      toast.error("La nouvelle date et l'heure doivent être situées au moins 48 heures dans le futur.");
      return;
    }
    if (replacementRequired && !availableReplacementTimes.includes(replacementTime)) {
      toast.error("Choisissez un créneau disponible parmi les propositions.");
      return;
    }
    if (replacementRequired && !availableReplacementDates.some((date) => date.value === replacementDate)) {
      toast.error("Choisissez une date disponible, hors dimanche.");
      return;
    }

    updateStatus.mutate(
      {
        id,
        payload: {
          status,
          admin_notes: notes,
          ...(replacementRequired ? { date: replacementDate, time: replacementTime } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success("Statut et notes mis à jour");
          setIsEditing(false);
        },
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Chargement...
      </div>
    );
  }

  if (!a) {
    return <p className="text-muted-foreground">Rendez-vous introuvable.</p>;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate({ to: "/appointments/liste" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour
        </Button>
      </div>

      <div className="max-w-5xl space-y-6">
        <AppointmentDetailHeader appointment={a} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AppointmentDetailContent appointment={a} />
            <AppointmentHandlingInfo handledBy={a.handledBy} handledAt={a.handledAt} />
          </div>

          <AppointmentSidebar
            currentStatus={a.status}
            adminNotes={a.adminNotes}
            isEditing={isEditing}
            status={status}
            notes={notes}
            replacementRequired={replacementRequired}
            replacementDate={replacementDate}
            replacementTime={replacementTime}
            availableReplacementDates={availableReplacementDates}
            isLoadingReplacementDates={isLoadingReplacementTimes}
            replacementDatesError={replacementTimesError}
            availableReplacementTimes={availableReplacementTimes}
            isLoadingReplacementTimes={isLoadingReplacementTimes}
            replacementTimesError={replacementTimesError}
            isPending={updateStatus.isPending}
            onEditToggle={setIsEditing}
            onStatusChange={setStatus}
            onNotesChange={setNotes}
            onReplacementDateChange={(date) => {
              setReplacementDate(date);
              setReplacementTime("");
            }}
            onReplacementTimeChange={setReplacementTime}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </>
  );
}
