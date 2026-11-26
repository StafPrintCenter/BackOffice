import type { ReactNode } from "react";
import { Calendar, CheckCircle2, FolderGit2, Info, Mail, UserCheck } from "lucide-react";
import { UserAvatar } from "@/components/site";
import type { APIAdminInstructor } from "@/data/instructors";

interface InstructorProfileCardProps {
  instructor: APIAdminInstructor;
}

function formatDate(date?: string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export function InstructorProfileCard({ instructor }: InstructorProfileCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b bg-muted/40 p-6 sm:p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <UserAvatar
              name={instructor.name}
              photo={instructor.photo}
              className="size-16 shrink-0"
              imageClassName="object-cover"
              fallbackClassName="bg-primary/10 font-display text-xl font-bold text-primary"
            />
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">{instructor.name}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{instructor.email}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                instructor.isActive
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  instructor.isActive ? "bg-emerald-500" : "bg-muted-foreground"
                }`}
              />
              {instructor.isActive ? "Actif" : "Inactif"}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                instructor.isBlocked
                  ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                  : "bg-muted/50 text-muted-foreground/70 border-transparent"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  instructor.isBlocked ? "bg-rose-500" : "bg-muted-foreground/40"
                }`}
              />
              {instructor.isBlocked ? "Bloqué" : "Non bloqué"}
            </span>
            {instructor.isPending && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-600">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                Invitation en attente
              </span>
            )}
            {instructor.needsApproval && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Approbation requise
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem
            icon={<Mail className="h-5 w-5" />}
            label="Origine du compte"
            value={
              instructor.registrationSource === "invited"
                ? "Invité par l'administration"
                : "Auto-inscription"
            }
          />
          <InfoItem
            icon={<Calendar className="h-5 w-5" />}
            label="Créé le"
            value={formatDate(instructor.createdAt)}
          />
          {instructor.invitedAt && (
            <InfoItem
              icon={<Calendar className="h-5 w-5" />}
              label="Invité le"
              value={formatDate(instructor.invitedAt)}
            />
          )}
          {instructor.acceptedAt && (
            <InfoItem
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Invitation acceptée le"
              value={formatDate(instructor.acceptedAt)}
            />
          )}
          {instructor.approvedAt && (
            <InfoItem
              icon={<UserCheck className="h-5 w-5" />}
              label="Approuvé le"
              value={formatDate(instructor.approvedAt)}
            />
          )}
        </div>

        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <FolderGit2 className="h-3.5 w-3.5" /> Spécialités / Catégories
          </div>
          {instructor.categories?.length ? (
            <div className="flex flex-wrap gap-2">
              {instructor.categories.map((category) => (
                <span
                  key={category.id}
                  className="inline-flex items-center rounded-lg border bg-secondary/50 px-3 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {category.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs italic text-muted-foreground">Aucune catégorie sélectionnée.</p>
          )}
        </div>

        {instructor.bio && (
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Info className="h-3.5 w-3.5" /> Biographie
            </div>
            <p className="rounded-xl border bg-background p-4 text-sm leading-relaxed text-foreground/90">
              {instructor.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
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
