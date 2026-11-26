import { UserAvatar } from "@/components/site";
import type { Column } from "@/components/site/DataTable";
import type { APIAdminStudentListItem } from "@/data/students";

export const StudentTableColumns: Column<APIAdminStudentListItem>[] = [
  {
    key: "fullname",
    label: "Apprenant",
    render: (student) => (
      <div className="flex items-center gap-3">
        <UserAvatar
          name={student.fullname}
          photo={student.photo}
          className="size-10 shrink-0"
          imageClassName="object-cover"
        />
        <div>
          <div className="font-medium">{student.fullname}</div>
          <div className="text-xs text-muted-foreground">{student.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: "phone",
    label: "Téléphone",
    render: (student) => <span className="text-xs">{student.phone || "-"}</span>,
  },
  {
    key: "birthDate",
    label: "Date de naissance",
    render: (student) => (
      <span className="text-xs">
        {student.birthDate ? new Date(student.birthDate).toLocaleDateString("fr-FR") : "-"}
      </span>
    ),
  },
  {
    key: "isBlocked",
    label: "Statut",
    render: (student) => (
      <span
        className={[
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
          student.isBlocked
            ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
            : student.isActive
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-muted text-muted-foreground border-border",
        ].join(" ")}
      >
        {student.isBlocked ? "Bloqué" : student.isActive ? "Actif" : "Inactif"}
      </span>
    ),
  },
  {
    key: "createdAt",
    label: "Inscrit le",
    render: (student) => (
      <span className="text-xs text-muted-foreground">
        {new Date(student.createdAt.replace("Z", "")).toLocaleString("fr-FR", {
          dateStyle: "short",
          timeStyle: "short",
        })}
      </span>
    ),
  },
];
