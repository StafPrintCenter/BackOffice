import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  User as UserIcon, Mail, Shield, Calendar, Save, LogOut, CheckCircle2, XCircle,
  Clock, ShieldAlert, Pencil, X, Camera, Trash2, Loader2, Eye, EyeOff,
} from "lucide-react";
import { PageHeader, ConfirmDisconnect } from "@/components/site";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  useUpdateAdminProfile, useRequestAdminEmailChange, useConfirmAdminEmailChange,
} from "@/stores/useAccountStore";
import type { AdminProfilePayload } from "@/data/account";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/_admin/profile")({
  head: () => ({
    meta: [
      { title: `${SITE.tool} - Mon profil | ${SITE.name}` },
      { name: "description", content: "Consultez et mettez à jour les informations de votre compte administrateur et vos préférences." },
    ]
  }),
  component: ProfilePage,
});

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis").max(80),
  lastName: z.string().trim().min(1, "Le nom est requis").max(80),
  bio: z.string().trim().max(500, "500 caractères maximum").optional(),
});

const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2 Mo (à ajuster selon le backend)

function ProfilePage() {
  const { user, logout, setUser } = useAdminAuth();
  const navigate = useNavigate();
  const updateMutation = useUpdateAdminProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [confirmDisconnectOpen, setConfirmDisconnectOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Photo
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setBio(user.bio || "");
    }
  }, [user]);

  useEffect(() => {
    if (!photoFile) { setPhotoPreview(null); return; }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Administrateur";
  const initials = fullName.split(/\s+/).map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

  const avatarSrc = isEditing
    ? photoPreview ?? (removePhoto ? null : user?.photo ?? null)
    : user?.photo ?? null;

  const formattedDate = (dateStr?: string | null) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
      : "Non renseigné";

  const resetForm = () => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setBio(user.bio || "");
    }
    setPhotoFile(null);
    setRemovePhoto(false);
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permet de re-sélectionner le même fichier
    if (!file) return;
    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      toast.error("Format non supporté (JPG, PNG ou WebP).");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      toast.error("La photo ne doit pas dépasser 2 Mo.");
      return;
    }
    setPhotoFile(file);
    setRemovePhoto(false);
  };

  const onRemovePhoto = () => {
    setPhotoFile(null);
    setRemovePhoto(true);
  };

  const onSaveProfile = (e?: React.FormEvent) => {
    e?.preventDefault();

    const parsed = profileSchema.safeParse({ firstName, lastName, bio });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    setErrors({});

    const payload: AdminProfilePayload = {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      bio: parsed.data.bio ?? "",
      photo: photoFile ?? undefined,
      removePhoto,
    };

    updateMutation.mutate(payload, {
      onSuccess: (admin) => {
        setUser(admin);
        toast.success("Profil mis à jour");
        setPhotoFile(null);
        setRemovePhoto(false);
        setIsEditing(false);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Erreur lors de la mise à jour du profil"),
    });
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Déconnecté");
    navigate({ to: "/login" });
  };

  return (
    <>
      <PageHeader title="Mon Profil" description="Gérez vos informations d'identification et la sécurité de votre compte." />

      {/* En-tête du profil */}
      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="h-32 bg-gradient-hero" />
        <div className="p-6 pt-0">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="relative shrink-0">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={fullName}
                    className="h-24 w-24 rounded-2xl border-4 border-card object-cover shadow-sm"
                  />
                ) : (
                  <div className="grid h-24 w-24 place-items-center rounded-2xl border-4 border-card bg-primary font-display text-3xl font-bold text-primary-foreground shadow-sm">
                    {initials}
                  </div>
                )}
                {isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full border bg-background shadow-sm transition-colors hover:bg-muted"
                      aria-label="Changer la photo"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_PHOTO_TYPES.join(",")}
                      className="hidden"
                      onChange={onPickPhoto}
                    />
                  </>
                )}
              </div>
              <div className="min-w-0 pb-1">
                <h2 className="truncate font-display text-2xl font-bold">{fullName}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" /> {user?.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5 capitalize">
                    <Shield className="h-3.5 w-3.5 text-primary" /> {user?.level ?? "Admin"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> Inscrit le {formattedDate(user?.created_at)}
                  </span>
                </div>
                {isEditing && (photoPreview || (user?.photo && !removePhoto)) && (
                  <button
                    type="button"
                    onClick={onRemovePhoto}
                    className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs text-destructive hover:underline"
                  >
                    <Trash2 className="h-3 w-3" /> Supprimer la photo
                  </button>
                )}
              </div>
            </div>

            <div className="self-start sm:self-auto">
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

      {/* Grille 2 colonnes */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-semibold">Informations personnelles</h3>
              </div>

              <div>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={updateMutation.isPending}>
                      <X className="mr-1 h-4 w-4" /> Annuler
                    </Button>
                    <Button size="sm" onClick={() => onSaveProfile()} disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-1 h-4 w-4" />
                      )}
                      Enregistrer
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Pencil className="mr-1 h-4 w-4" /> Modifier
                  </Button>
                )}
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={onSaveProfile} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1.5" />
                    {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1.5" />
                    {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Adresse email</Label>
                  <div className="mt-1.5 flex gap-2">
                    <Input id="email" type="email" value={user?.email ?? ""} readOnly disabled className="bg-muted/40" />
                    <Button type="button" variant="outline" onClick={() => setEmailDialogOpen(true)}>
                      Changer
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Le changement d'adresse nécessite votre mot de passe et un code envoyé à la nouvelle adresse.
                  </p>
                </div>

                <div>
                  <Label htmlFor="bio">Biographie / Note personnelle</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Écrivez une courte présentation de votre rôle..."
                    className="mt-1.5"
                  />
                  {errors.bio && <p className="mt-1 text-xs text-destructive">{errors.bio}</p>}
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Prénom</Label>
                    <div className="mt-1 text-sm font-medium">{user?.firstName || "Non renseigné"}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Nom</Label>
                    <div className="mt-1 text-sm font-medium">{user?.lastName || "Non renseigné"}</div>
                  </div>
                </div>

                {/* Adresse e-mail : le bouton Changer est accessible sans passer par "Modifier" */}
                <div>
                  <Label className="text-xs text-muted-foreground">Adresse email</Label>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium">
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{user?.email}</span>
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 px-2.5 text-xs"
                      onClick={() => setEmailDialogOpen(true)}
                    >
                      <Pencil className="mr-1 h-3 w-3" /> Changer
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Biographie / Note</Label>
                  <div className="mt-1.5 rounded-xl border bg-muted/20 p-4 text-sm leading-relaxed text-foreground">
                    {user?.bio ? user.bio : <span className="italic text-muted-foreground">Aucune biographie disponible.</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Barre latérale */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
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
                <span className="text-muted-foreground">Email vérifié</span>
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
                  <div>Bloqué le {formattedDate(user.blocked_at)}</div>
                  {user.blocked_reason && <div>Motif : {user.blocked_reason}</div>}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b pb-3">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-semibold">Dates système</h3>
            </div>

            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Date de création</span>
                <span className="font-medium text-foreground">{formattedDate(user?.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Dernière mise à jour</span>
                <span className="font-medium text-foreground">{formattedDate(user?.updated_at)}</span>
              </div>
              {user?.accepted_at && (
                <div className="flex justify-between">
                  <span>Invitation acceptée</span>
                  <span className="font-medium text-foreground">{formattedDate(user.accepted_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ChangeEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        currentEmail={user?.email ?? ""}
        onChanged={(admin) => setUser(admin)}
      />

      <ConfirmDisconnect
        open={confirmDisconnectOpen}
        onOpenChange={setConfirmDisconnectOpen}
        onConfirm={handleLogout}
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Changement d'adresse e-mail : 1/2 demande (mot de passe) · 2/2 code reçu  */
/* -------------------------------------------------------------------------- */

const requestSchema = z.object({
  newEmail: z.string().trim().min(1, "La nouvelle adresse est requise").email("Adresse e-mail invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

const codeSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Le code contient 6 chiffres"),
});

function ChangeEmailDialog({
  open,
  onOpenChange,
  currentEmail,
  onChanged,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentEmail: string;
  onChanged: (admin: unknown) => void;
}) {
  const requestMutation = useRequestAdminEmailChange();
  const confirmMutation = useConfirmAdminEmailChange();

  const [step, setStep] = useState<"request" | "confirm">("request");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [info, setInfo] = useState<{ hint: string; expiresInMinutes: number } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Réinitialise tout à la fermeture
  useEffect(() => {
    if (!open) {
      setStep("request");
      setNewEmail("");
      setPassword("");
      setShowPassword(false);
      setCode("");
      setInfo(null);
      setErrors({});
    }
  }, [open]);

  const submitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = requestSchema.safeParse({ newEmail, password });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setErrors(errs);
      return;
    }
    if (parsed.data.newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setErrors({ newEmail: "C'est déjà votre adresse actuelle" });
      return;
    }
    setErrors({});

    requestMutation.mutate(parsed.data, {
      onSuccess: (res) => {
        setInfo({ hint: res.hint, expiresInMinutes: res.expiresInMinutes });
        setPassword("");
        setCode("");
        setStep("confirm");
        toast.success(res.message);
      },
      onError: (err) =>
        setErrors({ form: err instanceof Error ? err.message : "Impossible d'envoyer le code" }),
    });
  };

  const submitConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = codeSchema.safeParse({ code });
    if (!parsed.success) {
      setErrors({ code: parsed.error.issues[0]?.message ?? "Code invalide" });
      return;
    }
    setErrors({});

    confirmMutation.mutate(parsed.data, {
      onSuccess: (admin) => {
        onChanged(admin);
        toast.success("Adresse e-mail modifiée");
        onOpenChange(false);
      },
      onError: (err) =>
        setErrors({ code: err instanceof Error ? err.message : "Code invalide ou expiré" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changer l'adresse e-mail</DialogTitle>
          <DialogDescription>
            {step === "request"
              ? "Saisissez la nouvelle adresse et votre mot de passe. Un code de confirmation y sera envoyé."
              : `Un code a été envoyé à ${info?.hint}. Il expire dans ${info?.expiresInMinutes} minutes.`}
          </DialogDescription>
        </DialogHeader>

        {step === "request" ? (
          <form onSubmit={submitRequest} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="new-email">Nouvelle adresse e-mail</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                autoComplete="email"
                className="mt-1.5"
                disabled={requestMutation.isPending}
              />
              {errors.newEmail && <p className="mt-1 text-xs text-destructive">{errors.newEmail}</p>}
            </div>

            <div>
              <Label htmlFor="email-change-pw">Mot de passe actuel</Label>
              <div className="relative mt-1.5">
                <Input
                  id="email-change-pw"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="pr-10"
                  disabled={requestMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
            </div>

            {errors.form && <p className="text-xs text-destructive">{errors.form}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={requestMutation.isPending}>
                {requestMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi...</>
                ) : (
                  "Envoyer le code"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={submitConfirm} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="email-code">Code de confirmation</Label>
              <Input
                id="email-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="mt-1.5 text-center font-mono text-lg tracking-[0.5em]"
                disabled={confirmMutation.isPending}
              />
              {errors.code && <p className="mt-1 text-xs text-destructive">{errors.code}</p>}
            </div>

            <DialogFooter className="sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setStep("request"); setErrors({}); }}
                disabled={confirmMutation.isPending}
              >
                Changer d'adresse
              </Button>
              <Button type="submit" disabled={confirmMutation.isPending}>
                {confirmMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Vérification...</>
                ) : (
                  "Confirmer"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}