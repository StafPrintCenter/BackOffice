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
  Wrench,
  GraduationCap,
  FolderKanban,
  FileText,
  MessagesSquare,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/layouts/AdminShell";
import { PageHeader } from "@/components/site/AdminBits";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { servicesApi } from "@/api/services.api";
import { formationsApi } from "@/api/formations.api";
import { projectsApi } from "@/api/projects.api";
import { articlesApi } from "@/api/articles.api";
import { testimonialsApi } from "@/api/testimonials.api";

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

  const services = useQuery({ queryKey: ["services"], queryFn: servicesApi.list });
  const formations = useQuery({ queryKey: ["formations"], queryFn: formationsApi.list });
  const projects = useQuery({ queryKey: ["projects"], queryFn: projectsApi.list });
  const articles = useQuery({ queryKey: ["articles"], queryFn: articlesApi.list });
  const testimonials = useQuery({ queryKey: ["testimonials"], queryFn: testimonialsApi.list });

  // États éditables initialisés avec le profil utilisateur
  const [name, setName] = useState(user?.name ?? "Administrateur");
  const [email, setEmail] = useState(user?.email ?? "");
  const [bio, setBio] = useState(
    user?.bio ??
    "Responsable du studio STAF PRINT CENTER — supervision des projets créatifs, formations et opérations."
  );
  const [phone, setPhone] = useState("+229 01 00 00 00");
  const [location, setLocation] = useState("Cotonou, Bénin");

  // Synchronisation si les données `user` chargent après le premier rendu
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.bio) setBio(user.bio);
    }
  }, [user]);

  // Mot de passe
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [notifWeekly, setNotifWeekly] = useState(true);

  const initials = (name || email || "A")
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    })
    : "Date inconnue";

  const stats = [
    { label: "Services", value: services.data?.length ?? 0, icon: Wrench },
    { label: "Formations", value: formations.data?.length ?? 0, icon: GraduationCap },
    { label: "Projets", value: projects.data?.length ?? 0, icon: FolderKanban },
    { label: "Articles", value: articles.data?.length ?? 0, icon: FileText },
    { label: "Témoignages", value: testimonials.data?.length ?? 0, icon: MessagesSquare },
  ];

  const activity = [
    { when: "Il y a 2h", text: "Publication de l'article « Tendances design 2026 »" },
    { when: "Hier", text: "Ajout du projet « Rebranding Coko »" },
    { when: "Il y a 3 jours", text: "Nouvelle formation UX ajoutée au catalogue" },
    { when: "Il y a 5 jours", text: "Mise à jour de 3 services vedettes" },
  ];

  const onSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profil mis à jour");
  };

  const onChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw) return toast.error("Veuillez remplir tous les champs");
    if (newPw.length < 6)
      return toast.error("Le mot de passe doit contenir au moins 6 caractères");
    if (newPw !== confirmPw) return toast.error("Les mots de passe ne correspondent pas");
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    toast.success("Mot de passe changé");
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Déconnecté");
    navigate({ to: "/auth/login" });
  };

  return (
    <AdminShell>
      <PageHeader title="Profil" description="Gérez vos informations personnelles et préférences." />

      {/* Header card */}
      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-elegant">
        <div className="h-32 bg-gradient-hero" />
        <div className="p-6 pt-0">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl border-4 border-card bg-primary font-display text-3xl font-bold text-primary-foreground shadow-elegant">
                {initials}
              </div>
              <div className="min-w-0 pb-1">
                <h2 className="truncate font-display text-2xl font-bold">{name}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {email}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" /> {user?.level ?? "Admin"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Membre depuis {formattedDate}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="self-start sm:self-auto">
              <LogOut className="mr-2 h-4 w-4" /> Déconnexion
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl border bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </div>
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold">{s.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Personal info form */}
        <form
          onSubmit={onSaveProfile}
          className="space-y-4 rounded-2xl border bg-card p-6 shadow-elegant lg:col-span-2"
        >
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-primary" />
            <h3 className="font-display text-lg font-semibold">Informations personnelles</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Nom complet</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="location">Localisation</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" /> Enregistrer
            </Button>
          </div>
        </form>

        {/* Notifications */}
        <div className="space-y-5 rounded-2xl border bg-card p-6 shadow-elegant">
          <h3 className="font-display text-lg font-semibold">Notifications</h3>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Emails</div>
              <div className="text-xs text-muted-foreground">Alertes de nouveaux leads et projets</div>
            </div>
            <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Push navigateur</div>
              <div className="text-xs text-muted-foreground">Notifications temps réel</div>
            </div>
            <Switch checked={notifPush} onCheckedChange={setNotifPush} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium">Récap hebdomadaire</div>
              <div className="text-xs text-muted-foreground">Résumé chaque lundi</div>
            </div>
            <Switch checked={notifWeekly} onCheckedChange={setNotifWeekly} />
          </div>
        </div>

        {/* Password */}
        <form
          onSubmit={onChangePassword}
          className="space-y-4 rounded-2xl border bg-card p-6 shadow-elegant lg:col-span-2"
        >
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            <h3 className="font-display text-lg font-semibold">Sécurité</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="cpw">Mot de passe actuel</Label>
              <Input id="cpw" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="npw">Nouveau mot de passe</Label>
              <Input id="npw" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cnpw">Confirmer</Label>
              <Input id="cnpw" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="secondary">
              <Save className="mr-2 h-4 w-4" /> Changer
            </Button>
          </div>
        </form>

        {/* Activity */}
        <div className="rounded-2xl border bg-card p-6 shadow-elegant">
          <h3 className="font-display text-lg font-semibold">Activité récente</h3>
          <ul className="mt-4 space-y-4">
            {activity.map((a, i) => (
              <li key={i} className="flex gap-3">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="min-w-0">
                  <div className="text-sm">{a.text}</div>
                  <div className="text-xs text-muted-foreground">{a.when}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}