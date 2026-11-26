import type { ReactNode } from "react";
import {
  CalendarArrowDown,
  CalendarArrowUp,
  CalendarPlus,
  Info,
  Mail,
  Shield,
  UserCheck,
  XCircle,
} from "lucide-react";
import { UserAvatar } from "@/components/site";
import {
  ADMIN_LEVEL_BADGES,
  ADMIN_LEVEL_LABELS,
  type APIAdminAdminDetail,
} from "@/data/admins";

interface AdminProfileCardProps {
  admin: APIAdminAdminDetail;
}

function formatDateTime(date: string) {
  const value = new Date(date);
  return `${value.toLocaleDateString("fr-FR")} à ${value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function AdminProfileCard({ admin }: AdminProfileCardProps) {
  const isInviteRevoked = Boolean(admin.invitationRevokedAt);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b bg-muted/40 p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={admin.fullname}
              photo={admin.photo}
              className="size-16 shrink-0"
              imageClassName="object-cover"
              fallbackClassName="bg-primary/10 font-display text-xl font-bold text-primary"
            />
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">{admin.fullname}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{admin.email}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                ADMIN_LEVEL_BADGES[admin.level] ?? "bg-muted text-muted-foreground border-border"
              }`}
            >
              {ADMIN_LEVEL_LABELS[admin.level] ?? admin.level}
            </span>
            <span
              className={[
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                admin.isPending
                  ? isInviteRevoked
                    ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  : admin.isBlocked
                    ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                    : admin.isActive
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-muted text-muted-foreground border-border",
              ].join(" ")}
            >
              <span
                className={[
                  "h-1.5 w-1.5 rounded-full",
                  admin.isPending
                    ? isInviteRevoked
                      ? "bg-rose-500"
                      : "bg-amber-500"
                    : admin.isBlocked
                      ? "bg-rose-500"
                      : admin.isActive
                        ? "bg-emerald-500"
                        : "bg-muted-foreground",
                ].join(" ")}
              />
              {admin.isPending
                ? isInviteRevoked
                  ? "Invitation révoquée"
                  : "Invitation en attente"
                : admin.isBlocked
                  ? "Bloqué"
                  : admin.isActive
                    ? "Actif"
                    : "Inactif"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminInfoItem
            icon={<Shield className="h-5 w-5" />}
            label="Niveau de privilège"
            value={ADMIN_LEVEL_LABELS[admin.level] ?? admin.level}
          />
          <AdminInfoItem
            icon={<UserCheck className="h-5 w-5" />}
            label="Invité par"
            value={admin.invitedBy || "-"}
          />
          {admin.invitedAt && (
            <AdminInfoItem
              icon={<CalendarArrowUp className="h-5 w-5" />}
              label="Invité le"
              value={formatDateTime(admin.invitedAt)}
            />
          )}
          {admin.invitationRevokedAt && (
            <AdminInfoItem
              icon={<XCircle className="h-5 w-5 text-destructive" />}
              label="Invitation révoquée le"
              value={formatDateTime(admin.invitationRevokedAt)}
              destructive
            />
          )}
          {admin.acceptedAt && (
            <AdminInfoItem
              icon={<CalendarArrowDown className="h-5 w-5" />}
              label="Invitation acceptée le"
              value={formatDateTime(admin.acceptedAt)}
            />
          )}
          <AdminInfoItem
            icon={<CalendarPlus className="h-5 w-5" />}
            label="Ajouté le"
            value={formatDateTime(admin.createdAt)}
            className="sm:col-span-2"
          />
        </div>

        {admin.bio && (
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Info className="h-3.5 w-3.5" /> Biographie
            </div>
            <p className="rounded-xl border bg-background p-4 text-sm leading-relaxed text-foreground/90">
              {admin.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminInfoItem({
  icon,
  label,
  value,
  className = "",
  destructive = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
  destructive?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-3 rounded-xl border p-4",
        destructive ? "border-destructive/20 bg-destructive/5" : "bg-background/50",
        className,
      ].join(" ")}
    >
      <span className={destructive ? "shrink-0 text-destructive" : "shrink-0 text-muted-foreground"}>
        {icon}
      </span>
      <div>
        <div className={`text-xs font-medium ${destructive ? "text-destructive/80" : "text-muted-foreground"}`}>
          {label}
        </div>
        <div className={`mt-0.5 text-sm font-semibold ${destructive ? "text-destructive" : ""}`}>
          {value}
        </div>
      </div>
    </div>
  );
}
