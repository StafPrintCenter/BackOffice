import type { ReactNode } from "react";
import { Calendar, Info, Mail, Shield } from "lucide-react";
import { UserAvatar } from "@/components/site";
import type { APIAdminUserDetail } from "@/data/users";

interface UserProfileCardProps {
  user: APIAdminUserDetail;
}

function InfoItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-background/50 p-4">
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <div>
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b bg-muted/40 p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={user.fullname}
              photo={user.photo}
              className="size-16 shrink-0"
              imageClassName="object-cover"
              fallbackClassName="bg-primary/10 font-display text-xl font-bold text-primary"
            />
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">{user.fullname}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
              user.isBlocked
                ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                : user.isActive
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-muted text-muted-foreground border-border",
            ].join(" ")}
          >
            <span
              className={[
                "h-1.5 w-1.5 rounded-full",
                user.isBlocked
                  ? "bg-rose-500"
                  : user.isActive
                    ? "bg-emerald-500"
                    : "bg-muted-foreground",
              ].join(" ")}
            />
            {user.isBlocked ? "Bloqué" : user.isActive ? "Actif" : "Inactif"}
          </span>
        </div>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem icon={<Shield className="h-5 w-5" />} label="Rôle sur la plateforme" value={user.role} />
          <InfoItem
            icon={<Calendar className="h-5 w-5" />}
            label="Date d'inscription"
            value={`${new Date(user.createdAt).toLocaleDateString()} à ${new Date(
              user.createdAt
            ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
          />
        </div>
        {user.bio && (
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Info className="h-3.5 w-3.5" /> Biographie
            </div>
            <p className="rounded-xl border bg-background p-4 text-sm leading-relaxed text-foreground/90">
              {user.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
