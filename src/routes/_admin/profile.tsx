import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Calendar, CheckCircle2, Clock, LogOut, Mail, Pencil, Shield, ShieldAlert, User as UserIcon, XCircle } from "lucide-react";
import { ConfirmDisconnect, PageHeader } from "@/components/site";
import { EmailChangeDialog } from "@/components/pages/profile/EmailChangeDialog";
import { ChangePasswordCard } from "@/components/pages/security/ChangePasswordCard";
import { ProfileEditDialog } from "@/components/pages/profile/ProfileEditDialog";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/profile")({
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Mon profil | ${SITE.name}` },
      {
        name: "description",
        content: "Consultez et mettez à jour les informations de votre compte administrateur.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [confirmDisconnectOpen, setConfirmDisconnectOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const fullName =
    user?.fullname ||
    user?.name ||
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    "Administrateur";
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const formatDate = (value?: string | null) => {
    if (!value) return "Non renseigné";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Non renseigné"
      : date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Déconnecté");
      navigate({ to: "/login" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "La déconnexion a échoué.");
    }
  };

  return (
    <>
      <PageHeader
        title="Mon profil"
        description="Gérez vos informations d'identification et la sécurité de votre compte."
      />

      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="h-32 bg-gradient-hero" />
        <div className="p-6 pt-0">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-card bg-primary font-display text-3xl font-bold text-primary-foreground shadow-sm">
                {user?.photo ? (
                  <img src={user.photo} alt={fullName} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="min-w-0 pb-1">
                <h2 className="truncate font-display text-2xl font-bold">{fullName}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    {user?.email || "E-mail non renseigné"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 capitalize">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    {user?.level ?? "Admin"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    Inscrit le {formatDate(user?.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 self-start sm:self-auto">
              <Button variant="outline" size="sm" onClick={() => setEditProfileOpen(true)}>
                <Pencil className="mr-1 h-4 w-4" /> Modifier
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEmailDialogOpen(true)}>
                <Mail className="mr-1 h-4 w-4" /> Changer l'e-mail
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDisconnectOpen(true)}
                className="text-destructive hover:bg-destructive/10"
              >
                <LogOut className="mr-1 h-4 w-4" /> Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2 border-b pb-4">
              <UserIcon className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-semibold">Informations personnelles</h3>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <ProfileField label="Prénom" value={user?.firstName} />
              <ProfileField label="Nom" value={user?.lastName} />
              <ProfileField label="Adresse e-mail" value={user?.email} />
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Biographie / Note personnelle</p>
                <div className="mt-1.5 rounded-xl border bg-muted/20 p-4 text-sm leading-relaxed">
                  {user?.bio?.trim() || (
                    <span className="italic text-muted-foreground">
                      Aucune biographie disponible.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <ChangePasswordCard />
          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b pb-3">
              <Shield className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-semibold">Statut du compte</h3>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rôle système</span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold capitalize text-primary">
                  {user?.level ?? "Inconnu"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">État du compte</span>
                {user?.is_active ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Actif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                    <XCircle className="h-3.5 w-3.5" /> Inactif
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">E-mail vérifié</span>
                {user?.email_verified_at ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Vérifié
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                    <Clock className="h-3.5 w-3.5" /> En attente
                  </span>
                )}
              </div>
              {user?.blocked_at && (
                <div className="space-y-1 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                  <div className="flex items-center gap-1 font-semibold">
                    <ShieldAlert className="h-3.5 w-3.5" /> Compte restreint
                  </div>
                  <div>Bloqué le {formatDate(user.blocked_at)}</div>
                  {user.blocked_reason && <div>Motif : {user.blocked_reason}</div>}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b pb-3">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-semibold">Dates système</h3>
            </div>
            <div className="space-y-3 text-xs text-muted-foreground">
              <DateRow label="Date d'inscription" value={formatDate(user?.created_at)} />
              <DateRow label="Dernière mise à jour" value={formatDate(user?.updated_at)} />
              {user?.accepted_at && (
                <DateRow label="Invitation acceptée" value={formatDate(user.accepted_at)} />
              )}
            </div>
          </section>
        </div>
      </div>

      <ProfileEditDialog open={editProfileOpen} onOpenChange={setEditProfileOpen} />
      <EmailChangeDialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen} />
      <ConfirmDisconnect
        open={confirmDisconnectOpen}
        onOpenChange={setConfirmDisconnectOpen}
        onConfirm={handleLogout}
      />
    </>
  );
}

function ProfileField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 wrap-break-word text-sm font-medium">{value?.trim() || "Non renseigné"}</div>
    </div>
  );
}

function DateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
