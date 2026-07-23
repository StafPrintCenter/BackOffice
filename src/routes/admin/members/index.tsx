import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, GraduationCap, ShieldCheck } from "lucide-react";
import { AdminShell, PageHeader } from "@/components/site";
import { SITE } from "@/data/site";

export const Route = createFileRoute("/admin/members/")({
  head: () => ({
    meta: [
      { title: `Membres | ${SITE.name}` },
      { name: "robots", content: "noindex" }
    ],
  }),
  component: AdminMembersHub,
});

const sections = [
  { to: "/admin/members/users", icon: Users, title: "Utilisateurs", description: "Comptes clients/visiteurs : consultation, alertes, blocage." },
  { to: "/admin/members/students", icon: GraduationCap, title: "Apprenants", description: "Comptes des personnes suivant vos formations." },
  { to: "/admin/members/admins", icon: ShieldCheck, title: "Administrateurs", description: "Membres de l'équipe admin, invitations et niveaux d'accès." },
] as const;

function AdminMembersHub() {
  return (
    <AdminShell>
      <PageHeader title="Membres" description="Gérez tous les types de comptes : utilisateurs, apprenants et administrateurs." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link key={s.to} to={s.to} className="rounded-2xl border bg-card p-6 transition hover:border-primary/50 hover:shadow-sm">
            <s.icon className="h-6 w-6 text-primary" />
            <div className="mt-3 font-display text-lg font-bold">{s.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}