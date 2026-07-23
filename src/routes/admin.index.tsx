import { createFileRoute } from "@tanstack/react-router";
import { Wrench, GraduationCap, FolderKanban, FileText, MessagesSquare, Users, Activity, Star, Inbox, ShieldAlert, Link2, MousePointerClick, ShieldUser, CircleUser, SquareUser } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AdminShell, PageHeader, StatCard } from "@/components/site";
import { useAdminContactsList, useAdminUsersList, useAdminStudentsList, useAdminAdminsList, useAdminProjectsList, useAdminTestimonialsList, useAdminShortLinksList, useAdminServicesList, useAdminTrainingsList, useAdminReportsList, useAdminArticlesList } from "@/stores";
import { SITE } from "@/data/site";

// --- Encore sur mock : aucune spec reçue pour les articles ---
import { articlesApi } from "@/api/articles.api";
import { useQuery } from "@tanstack/react-query";


export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: `Tableau de bord | ${SITE.name}` },
      { name: "robots", content: "noindex" }
    ],
  }),
  component: DashboardPage,
});

const pieColors = ["#E07856", "#3C82AB", "#5A9B6E", "#C89A3E", "#8B5CF6", "#EC4899"];

function DashboardPage() {
  const { items: contacts, isLoading: contactsLoading } = useAdminContactsList({ perPage: 100 });
  const { items: users, isLoading: usersLoading } = useAdminUsersList({ perPage: 100 });
  const { items: students, isLoading: studentsLoading } = useAdminStudentsList({ perPage: 100 });
  const { items: admins, isLoading: adminsLoading } = useAdminAdminsList({ perPage: 100 });
  const { items: projects, isLoading: projectsLoading } = useAdminProjectsList({ perPage: 100 });
  const { items: testimonials, isLoading: testimonialsLoading } = useAdminTestimonialsList({ perPage: 100 });
  const { items: shortLinks, isLoading: shortLinksLoading } = useAdminShortLinksList({ perPage: 100 });
  const { items: services, isLoading: servicesLoading } = useAdminServicesList({ perPage: 100 });
  const { items: trainings, isLoading: trainingsLoading } = useAdminTrainingsList({ perPage: 100 });
  const { items: reports, isLoading: reportsLoading } = useAdminReportsList({ perPage: 100 });

  // --- Mock en attente ---
  const articles = useQuery({ queryKey: ["articles"], queryFn: articlesApi.list });

  // --- KPIs réels ---
  const newMessages = contacts.filter((c) => c.status === "new").length;
  const openReports = reports.filter((r) => r.status === "pending" || r.status === "in_review").length;

  const activeUsers = users.filter((u) => u.isActive && !u.isBlocked).length;
  const activeStudents = students.filter((s) => s.isActive && !s.isBlocked).length;
  const activeAdmins = admins.filter((a) => a.isActive && !a.isBlocked && !a.isPending).length;
  const totalMembers = users.length + students.length + admins.length;

  const totalClicks = shortLinks.reduce((s, l) => s + l.clicksCount, 0);
  const activeShortLinks = shortLinks.filter((l) => l.isActive).length;

  const avgRating = testimonials.length ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length) : "…";
  const featuredTestimonials = testimonials.filter((t) => t.featured).length;
  const featuredServices = services.filter((s) => s.featured).length;

  const msgByStatus = Object.entries(
    contacts.reduce<Record<string, number>>((a, c) => { a[c.status] = (a[c.status] ?? 0) + 1; return a; }, {})
  ).map(([name, value]) => ({ name, value }));

  const reportsByStatus = Object.entries(
    reports.reduce<Record<string, number>>((a, r) => { a[r.status] = (a[r.status] ?? 0) + 1; return a; }, {})
  ).map(([name, value]) => ({ name, value }));

  const membersByType = [
    { type: "Utilisateurs", value: users.length },
    { type: "Apprenants", value: students.length },
    { type: "Administrateurs", value: admins.length },
  ];

  const projectsByCategory = Object.entries(
    projects.reduce<Record<string, number>>((acc, p) => { const key = p.category || "Sans catégorie"; acc[key] = (acc[key] ?? 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const topLinks = [...shortLinks].sort((a, b) => b.clicksCount - a.clicksCount).slice(0, 5).map((l) => ({ name: l.alias, value: l.clicksCount }));

  const linksByCategory = Object.entries(
    shortLinks.reduce<Record<string, number>>((acc, l) => { acc[l.category] = (acc[l.category] ?? 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const trainingsByLevel = Object.entries(
    trainings.reduce<Record<string, number>>((acc, t) => { acc[t.level] = (acc[t.level] ?? 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const servicesByCategory = Object.entries(
    services.reduce<Record<string, number>>((acc, s) => { const key = s.category || "Sans catégorie"; acc[key] = (acc[key] ?? 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const recent = [
    ...projects.slice(0, 3).map((p) => ({ type: "Projet", title: p.title, meta: p.client, icon: FolderKanban })),
    ...trainings.slice(0, 2).map((t) => ({ type: "Formation", title: t.title, meta: t.theme, icon: GraduationCap })),
    ...(articles.data ?? []).slice(0, 1).map((a) => ({ type: "Article", title: a.title, meta: a.author, icon: FileText })), // ⚠️ mock
  ].slice(0, 6);

  return (
    <AdminShell>
      <PageHeader title="Dashboard" description="Vue d'ensemble de votre activité." />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Services" value={servicesLoading ? "…" : services.length} icon={<Wrench className="h-5 w-5" />} hint={`${featuredServices} en vedette`} />
        <StatCard label="Formations" value={trainingsLoading ? "…" : trainings.length} icon={<GraduationCap className="h-5 w-5" />} hint="Programmes actifs" />
        <StatCard label="Projets" value={projectsLoading ? "…" : projects.length} icon={<FolderKanban className="h-5 w-5" />} hint="Portfolio" />
        <StatCard label="Articles" value={articles.data?.length ?? "…"} icon={<FileText className="h-5 w-5" />} hint="Publiés" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Messages nouveaux" value={contactsLoading ? "…" : newMessages} icon={<Inbox className="h-5 w-5" />} hint={`${contacts.length} au total`} />
        <StatCard label="Signalements ouverts" value={reportsLoading ? "…" : openReports} icon={<ShieldAlert className="h-5 w-5" />} hint={`${reports.length} au total`} />
        <StatCard label="Clics liens courts" value={shortLinksLoading ? "…" : totalClicks} icon={<MousePointerClick className="h-5 w-5" />} hint={`${shortLinks.length} liens`} />
        <StatCard label="Note moyenne" value={testimonialsLoading ? "…" : avgRating + " / 5"} icon={<Star className="h-5 w-5" />} hint={`${testimonials.length} témoignages`} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Membres actifs" value={usersLoading || studentsLoading || adminsLoading ? "…" : activeUsers + activeStudents + activeAdmins} icon={<Users className="h-5 w-5" />} hint={`${totalMembers} au total`} />
        <StatCard label="Utilisateurs actifs" value={usersLoading ? "…" : activeUsers} icon={<SquareUser className="h-5 w-5" />} hint={`${users.length} au total`} />
        <StatCard label="Apprenants actifs" value={studentsLoading ? "…" : activeStudents} icon={<CircleUser className="h-5 w-5" />} hint={`${students.length} au total`} />
        <StatCard label="Administrateurs actifs" value={adminsLoading ? "…" : activeAdmins} icon={<ShieldUser className="h-5 w-5" />} hint={`${admins.length} au total`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-elegant lg:col-span-2">
          <div className="font-display text-lg font-semibold">Liens courts par catégorie</div>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <BarChart data={linksByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="value" fill="#3C82AB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="font-display text-lg font-semibold">Messages par statut</div>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={msgByStatus} dataKey="value" nameKey="name" innerRadius={35} outerRadius={70}>{msgByStatus.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}</Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-elegant lg:col-span-2">
          <div className="flex items-center gap-2"><Link2 className="h-4 w-4 text-primary" /><div className="font-display text-lg font-semibold">Top 5 liens courts</div></div>
          <div className="text-xs text-muted-foreground">{activeShortLinks} liens actifs</div>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <BarChart data={topLinks} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={11} width={90} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="font-display text-lg font-semibold">Signalements par statut</div>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={reportsByStatus} dataKey="value" nameKey="name" innerRadius={35} outerRadius={70}>{reportsByStatus.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}</Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="font-display text-lg font-semibold">Répartition des membres</div>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <BarChart data={membersByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="type" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="value" fill="#5A9B6E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="font-display text-lg font-semibold">Services par catégorie</div>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <BarChart data={servicesByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="value" fill="#C89A3E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="font-display text-lg font-semibold">Formations par niveau</div>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={trainingsByLevel}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="font-display text-lg font-semibold">Projets par catégorie</div>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={projectsByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={12} width={90} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="value" fill="#5A9B6E" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-elegant lg:col-span-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <div className="font-display text-lg font-semibold">Activité récente</div>
          </div>
          <div className="text-xs text-muted-foreground">Articles encore mock</div>
          <ul className="mt-4 divide-y">
            {recent.map((r, i) => {
              const Icon = r.icon;
              return (
                <li key={i} className="flex items-center gap-3 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{r.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{r.meta}</div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{r.type}</span>
                </li>
              );
            })}
            {recent.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Aucune activité</li>}
          </ul>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="flex items-center gap-2">
            <MessagesSquare className="h-4 w-4 text-primary" />
            <div className="font-display text-lg font-semibold">Derniers témoignages</div>
          </div>
          <div className="text-xs text-muted-foreground">{featuredTestimonials} en vedette</div>
          <ul className="mt-4 space-y-4">
            {testimonialsLoading && <li className="text-center text-sm text-muted-foreground">Chargement...</li>}
            {[...testimonials]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 3)
              .map((t) => (
                <li key={t.id} className="rounded-xl border p-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="mt-2 text-xs italic line-clamp-3">"{t.quote}"</p>
                  <div className="mt-2 text-xs font-medium">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground">{t.role}</div>
                </li>
              ))}
            {!testimonialsLoading && testimonials.length === 0 && (
              <li className="text-center text-sm text-muted-foreground">Aucun témoignage</li>
            )}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}