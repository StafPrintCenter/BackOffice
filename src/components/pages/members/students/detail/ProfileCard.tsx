import type { ReactNode } from "react";
import { Briefcase, Cake, Calendar, Info, Mail, MapPin, Phone } from "lucide-react";
import { UserAvatar } from "@/components/site";
import type { APIAdminStudentDetail } from "@/data/students";

interface StudentProfileCardProps {
  student: APIAdminStudentDetail;
}

function InfoItem({
  icon,
  label,
  value,
  className = "",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border bg-background/50 p-4 ${className}`}>
      <span className="shrink-0 text-muted-foreground">{icon}</span>
      <div>
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

export function StudentProfileCard({ student }: StudentProfileCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b bg-muted/40 p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={student.fullname}
              photo={student.photo}
              className="size-16 shrink-0"
              imageClassName="object-cover"
              fallbackClassName="bg-primary/10 font-display text-xl font-bold text-primary"
            />
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">{student.fullname}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{student.email}</span>
              </div>
            </div>
          </div>
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
              student.isBlocked
                ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                : student.isActive
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-muted text-muted-foreground border-border",
            ].join(" ")}
          >
            <span
              className={[
                "h-1.5 w-1.5 rounded-full",
                student.isBlocked
                  ? "bg-rose-500"
                  : student.isActive
                    ? "bg-emerald-500"
                    : "bg-muted-foreground",
              ].join(" ")}
            />
            {student.isBlocked ? "Bloqué" : student.isActive ? "Actif" : "Inactif"}
          </span>
        </div>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem icon={<Phone className="h-5 w-5" />} label="Téléphone" value={student.phone || "-"} />
          <InfoItem
            icon={<Cake className="h-5 w-5" />}
            label="Date de naissance"
            value={student.birthDate ? new Date(student.birthDate).toLocaleDateString("fr-FR") : "-"}
          />
          <InfoItem
            icon={<Briefcase className="h-5 w-5" />}
            label="Profession"
            value={student.occupation || "-"}
          />
          <InfoItem icon={<MapPin className="h-5 w-5" />} label="Adresse" value={student.address || "-"} />
          <InfoItem
            icon={<Calendar className="h-5 w-5" />}
            label="Inscrit le"
            value={`${new Date(student.createdAt).toLocaleDateString("fr-FR")} à ${new Date(
              student.createdAt
            ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
            className="sm:col-span-2"
          />
        </div>

        {student.bio && (
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Info className="h-3.5 w-3.5" /> Biographie
            </div>
            <p className="rounded-xl border bg-background p-4 text-sm leading-relaxed text-foreground/90">
              {student.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
