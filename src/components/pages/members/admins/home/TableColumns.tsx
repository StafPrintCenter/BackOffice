import { UserAvatar } from "@/components/site";
import type { Column } from "@/components/site/DataTable";
import { ADMIN_LEVEL_BADGES, ADMIN_LEVEL_LABELS, type APIAdminAdminListItem } from "@/data/admins";
import { formatLastActivityAt } from "@/data/memberAction";

export const adminTableColumns: Column<APIAdminAdminListItem>[] = [
  {
    key: "fullname",
    label: "Administrateur",
    render: (admin) => (
      <div className="flex items-center gap-3">
        <UserAvatar
          name={admin.fullname}
          photo={admin.photo}
          className="size-10 shrink-0"
          imageClassName="object-cover"
        />
        <div>
          <div className="font-medium">{admin.fullname}</div>
          <div className="text-xs text-muted-foreground">{admin.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: "level",
    label: "Niveau",
    render: (admin) => (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${ADMIN_LEVEL_BADGES[admin.level] ?? "bg-muted text-muted-foreground"
          }`}
      >
        {ADMIN_LEVEL_LABELS[admin.level] ?? admin.level}
      </span>
    ),
  },
  {
    key: "status",
    label: "Statut",
    render: (admin) => (
      <span
        className={[
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
          admin.isPending
            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
            : admin.isBlocked
              ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
              : admin.isActive
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-muted text-muted-foreground border-border",
        ].join(" ")}
      >
        {admin.isPending
          ? "Invitation en attente"
          : admin.isBlocked
            ? "Bloqué"
            : admin.isActive
              ? "Actif"
              : "Inactif"}
      </span>
    ),
  },
  {
    key: "lastActivityAt",
    label: "Dernière activité",
    render: (admin) => (
      <span className="text-xs text-muted-foreground">
        {formatLastActivityAt(admin.lastActivityAt)}
      </span>
    ),
  },
  {
    key: "createdAt",
    label: "Ajouté le",
    render: (admin) => (
      <span className="text-xs text-muted-foreground">
        {new Date(admin.createdAt.replace("Z", "")).toLocaleString("fr-FR", {
          dateStyle: "short",
          timeStyle: "short",
        })}
      </span>
    ),
  },
];
