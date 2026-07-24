import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  KeyRound,
  Save,
  LogOut,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Pencil,
  X,
  Eye,
  EyeOff,
  AlignLeft,
} from "lucide-react";
import { AdminShell, PageHeader } from "@/components/site";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({
    meta: [
      { title: "Profil — Admin Staf Print" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);

  // États éditables dérivés de APIAdminUser
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");

  // Synchronisation si le user est chargé/mis à jour
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
    }
  }, [user]);

  // Mot de passe & Affichage Œil
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Administrateur";

  const initials = fullName
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const formattedDate = (dateStr?: string | null) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      : "Non renseigné";

  const handleCancel = () => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setEmail(user.email || "");
      setBio(user.bio || "");
    }
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setIsEditing(false);
  };

  const onSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connecter à l'API de mise à jour du profil
    toast.success("Profil mis à jour");
    setIsEditing(false);
  };

  const onChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw) return toast.error("Veuillez remplir les champs de mot de passe");
    if (newPw.length < 6)
      return toast.error("Le mot de passe doit contenir au moins 6 caractères");
    if (newPw !== confirmPw) return toast.error("Les mots de passe ne correspondent pas");

    // TODO: Connecter à l'API de changement de mot de passe
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    toast.success("Mot de passe modifié avec succès");
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Déconnecté");
    navigate({ to: "/auth/login" });
  };

  return (
    <AdminShell>
      <PageHeader title="Mon Profil" description="Gérez vos informations d'identification et la sécurité de votre compte." />

      {/* Barre d'action & En-tête du profil */}
      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="h-32 bg-gradient-hero" />
        <div className="p-6 pt-0">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl border-4 border-card bg-primary font-display text-3xl font-bold text-primary-foreground shadow-sm">
                {initials}
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
              </div>
            </div>

            {/* Actions Édition / Déconnexion */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-1" /> Annuler
                  </Button>
                  <Button size="sm" onClick={onSaveProfile}>
                    <Save className="h-4 w-4 mr-1" /> Enregistrer
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-1" /> Modifier le profil
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4 mr-1" /> Déconnexion
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grille 2 colonnes */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Colonne Principale (2/3) : Informations Personnelles */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-4 mb-5">
              <UserIcon className="h-5 w-5 text-primary" />
              <h3 className="font-display text-lg font-semibold">Informations personnelles</h3>
            </div>

            {isEditing ? (
              <form onSubmit={onSaveProfile} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="first_name">Prénom</Label>
                    <Input
                      id="first_name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Nom</Label>
                    <Input
                      id="last_name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5"
                  />
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
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Prénom</Label>
                    <div className="mt-1 text-sm font-medium">{user?.first_name || "Non renseigné"}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Nom</Label>
                    <div className="mt-1 text-sm font-medium">{user?.last_name || "Non renseigné"}</div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Adresse email</Label>
                  <div className="mt-1 flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user?.email}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Biographie / Note</Label>
                  <div className="mt-1.5 rounded-xl border bg-muted/20 p-4 text-sm text-foreground leading-relaxed">
                    {user?.bio ? user.bio : <span className="italic text-muted-foreground">Aucune biographie disponible.</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Barre Latérale (1/3) : Sécurité (si Édition) & Statuts Système */}
        <div className="space-y-6 lg:col-span-1">
          {/* Bloc de Sécurité / Changement de mot de passe (affiché uniquement en mode édition) */}
          {isEditing && (
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b pb-3 mb-4">
                <KeyRound className="h-4 w-4 text-primary" />
                <h3 className="font-display text-sm font-semibold">Changer le mot de passe</h3>
              </div>

              <form onSubmit={onChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="cpw" className="text-xs">Mot de passe actuel</Label>
                  <div className="relative mt-1">
                    <Input
                      id="cpw"
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      className="pr-10 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                    >
                      {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="npw" className="text-xs">Nouveau mot de passe</Label>
                  <div className="relative mt-1">
                    <Input
                      id="npw"
                      type={showNewPw ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      className="pr-10 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                      onClick={() => setShowNewPw(!showNewPw)}
                    >
                      {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="cnpw" className="text-xs">Confirmation</Label>
                  <div className="relative mt-1">
                    <Input
                      id="cnpw"
                      type={showConfirmPw ? "text" : "password"}
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      className="pr-10 text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:bg-transparent"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                    >
                      {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" variant="secondary" size="sm" className="w-full mt-2">
                  <Save className="mr-2 h-3.5 w-3.5" /> Mettre à jour
                </Button>
              </form>
            </div>
          )}

          {/* Statut du Compte */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-3 mb-4">
              <Shield className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-semibold">Statut du compte</h3>
            </div>

            <div className="space-y-4 text-sm">
              {/* Niveau d'accès */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Rôle système</span>
                <span className="font-semibold capitalize px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                  {user?.level ?? "Inconnu"}
                </span>
              </div>

              {/* Statut Actif */}
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

              {/* Email Vérifié */}
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

              {/* Blocage éventuel */}
              {user?.blocked_at && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive space-y-1">
                  <div className="flex items-center gap-1 font-semibold">
                    <ShieldAlert className="h-3.5 w-3.5" /> Compte restreint
                  </div>
                  <div>Bloqué le {formattedDate(user.blocked_at)}</div>
                  {user.blocked_reason && <div>Motif : {user.blocked_reason}</div>}
                </div>
              )}
            </div>
          </div>

          {/* Métadonnées de dates */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b pb-3 mb-4">
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
    </AdminShell>
  );
}