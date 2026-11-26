import { UserAvatar } from "@/components/site";
import type { Column } from "@/components/site/DataTable";
import type { APIAdminInstructor } from "@/data/instructors";

function getStatusLabel(instructor: APIAdminInstructor) {
  if (instructor.isBlocked) return "Bloqué";
  if (instructor.isPending) return "Invitation en attente";
  if (instructor.needsApproval) return "À approuver";
  return instructor.isActive ? "Actif" : "Inactif";
}

function getStatusClassName(instructor: APIAdminInstructor) {
  if (instructor.isBlocked) return "bg-destructive/10 text-destructive";
  if (instructor.isPending) return "bg-sky-500/10 text-sky-600";
  if (instructor.needsApproval) return "bg-amber-500/10 text-amber-600";
  return instructor.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground";
}

export const instructorTableColumns: Column<APIAdminInstructor>[] = [
  {
    key: "name",
    label: "Instructeur",
    render: (instructor) => (
      <div className="flex items-center gap-3">
        <UserAvatar
          name={instructor.name}
          photo={instructor.photo}
          className="size-10 shrink-0"
          imageClassName="object-cover"
        />
        <div>
          <div className="font-medium">{instructor.name}</div>
          <div className="text-xs text-muted-foreground">{instructor.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: "registrationSource",
    label: "Origine",
    render: (instructor) => (
      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
        {instructor.registrationSource === "invited"
          ? "Invité"
          : instructor.registrationSource === "self_registered"
            ? "Auto-inscrit"
            : "-"}
      </span>
    ),
  },
  {
    key: "status",
    label: "Statut",
    render: (instructor) => (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClassName(
          instructor
        )}`}
      >
        {getStatusLabel(instructor)}
      </span>
    ),
  },
  {
    key: "createdAt",
    label: "Créé le",
    render: (instructor) => (
      <span className="text-xs text-muted-foreground">
        {new Date(instructor.createdAt).toLocaleDateString("fr-FR")}
      </span>
    ),
  },
];
