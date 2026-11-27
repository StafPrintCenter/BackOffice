import { UserAvatar } from "@/components/site";
import type { Column } from "@/components/site/DataTable";
import type { APIAdminUserListItem } from "@/data/users";
import { formatLastActivityAt } from "@/data/memberAction";

export const UserTableColumns: Column<APIAdminUserListItem>[] = [
  {
    key: "fullname",
    label: "Utilisateur",
    render: (user) => (
      <div className="flex items-center gap-3">
        <UserAvatar
          name={user.fullname}
          photo={user.photo}
          className="size-10 shrink-0"
          imageClassName="object-cover"
        />
        <div>
          <div className="font-medium">{user.fullname}</div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    label: "Rôle",
    render: (user) => <span className="text-xs capitalize">{user.role}</span>,
  },
  {
    key: "isBlocked",
    label: "Statut",
    render: (user) => (
      <span
        className={[
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
          user.isBlocked
            ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
            : user.isActive
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : "bg-muted text-muted-foreground border-border",
        ].join(" ")}
      >
        {user.isBlocked ? "Bloqué" : user.isActive ? "Actif" : "Inactif"}
      </span>
    ),
  },
  {
    key: "lastActivityAt",
    label: "Dernière activité",
    render: (user) => (
      <span className="text-xs text-muted-foreground">
        {formatLastActivityAt(user.lastActivityAt)}
      </span>
    ),
  },
  {
    key: "createdAt",
    label: "Inscrit le",
    render: (user) => (
      <span className="text-xs text-muted-foreground">
        {new Date(user.createdAt.replace("Z", "")).toLocaleString("fr-FR", {
          dateStyle: "short",
          timeStyle: "short",
        })}
      </span>
    ),
  },
];
