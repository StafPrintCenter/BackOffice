import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Wrench, GraduationCap, FolderKanban, FileText, MessagesSquare, TrendingUp, Users, Eye, Activity, Star, Inbox, ShieldAlert, Link2, MousePointerClick, ShieldCheck } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from "recharts";
import { AdminShell, PageHeader, StatCard } from "@/components/site";

// --- Encore sur mocks/anciennes API : pas de specs reçues pour ces ressources ---
import { servicesApi } from "@/api/services.api";
import { formationsApi } from "@/api/formations.api";
import { articlesApi } from "@/api/articles.api";
import { reportsApi } from "@/api/extra.api";

// --- Réel ---
import { useAdminContactsList } from "@/stores/useContactsStore";
import { useAdminUsersList } from "@/stores/useUsersStore";
import { useAdminStudentsList } from "@/stores/useStudentsStore";
import { useAdminAdminsList } from "@/stores/useAdminsStore";
import { useAdminProjectsList } from "@/stores/useProjectsStore";
import { useAdminTestimonialsList } from "@/stores/useTestimonialsStore";
import { useAdminShortLinksList } from "@/stores/useShortLinksStore";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Admin Staf Print" }, { name: "robots", content: "noindex" }] }),
  component: DashboardPage,
});

const pieColors = ["#E07856", "#3C82AB", "#5A9B6E", "#C89A3E", "#8B5CF6", "#EC4899"];

function DashboardPage() {
  // --- Mocks/anciennes API en attente de specs ---
  const services = useQuery({ queryKey: ["services"], queryFn: servicesApi.list });
  const formations = useQuery({ queryKey: ["formations"], queryFn: formationsApi.list });
  const articles = useQuery({ queryKey: ["articles"], queryFn: articlesApi.list });
  const reports = useQuery({ queryKey: ["reports"], queryFn: reportsApi.list });

  // --- Réel ---
  const { items: contacts, isLoading: contactsLoading } = useAdminContactsList({ perPage: 100 });
  const { items: users, isLoading: usersLoading } = useAdminUsersList({ perPage: 100 });
  const { items: students, isLoading: studentsLoading } = useAdminStudentsList({ perPage: 100 });
  const { items: admins, isLoading: adminsLoading } = useAdminAdminsList({ perPage: 100 });
  const { items: projects, isLoading: projectsLoading } = useAdminProjectsList({ perPage: 100 });
  const { items: testimonials, isLoading: testimonialsLoading } = useAdminTestimonialsList({ perPage: 100 });
  const { items: shortLinks, isLoading: shortLinksLoading } = useAdminShortLinksList({ perPage: 100 });

  // --- KPIs réels ---
  const newMessages = contacts.filter((c) => c.status === "new").length;
  const openReports = (reports.data ?? []).filter((r) => r.status === "ouvert" || r.status === "en_cours").length; // ⚠️ mock, statuts à confirmer

  const activeUsers = users.filter((u) => u.isActive && !u.isBlocked).length;
  const activeStudents = students.filter((s) => s.isActive && !s.isBlocked).length;
  const activeAdmins = admins.filter((a) => a.isActive && !a.isBlocked && !a.isPending).length;
  const totalMembers = users.length + students.length + admins.length;

  const totalClicks = shortLinks.reduce((s, l) => s + l.clicksCount, 0);
  const activeShortLinks = shortLinks.filter((l) => l.isActive).length;

  const avgRating = testimonials.length
    ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)
    : "…";
  const featuredTestimonials = testimonials.filter((t) => t.featured).length;

  const msgByStatus = Object.entries(
    contacts.reduce<Record<string, number>>((a, c) => { a[c.status] = (a[c.status] ?? 0) + 1; return a; }, {})
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

  const formationsByTheme = Object.entries(
    (formations.data ?? []).reduce<Record<string, number>>((acc, f) => { acc[f.theme] = (acc[f.theme] ?? 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value })); // ⚠️ mock

  // --- Données 100% fictives, en attente de specs analytics/tracking/revenus ---
  const monthly = [
    { month: "Jan", projets: 4, formations: 2, revenus: 1200 },
    { month: "Fév", projets: 6, formations: 3, revenus: 1800 },
    { month: "Mar", projets: 8, formations: 5, revenus: 2400 },
    { month: "Avr", projets: 5, formations: 4, revenus: 2100 },
    { month: "Mai", projets: 9, formations: 6, revenus: 3200 },
    { month: "Juin", projets: 12, formations: 7, revenus: 4100 },
    { month: "Juil", projets: 10, formations: 8, revenus: 3800 },
    { month: "Août", projets: 14, formations: 9, revenus: 4600 },
  ];
  const visits = [
    { day: "Lun", visits: 240, uniques: 180 },
    { day: "Mar", visits: 320, uniques: 240 },
    { day: "Mer", visits: 280, uniques: 210 },
    { day: "Jeu", visits: 410, uniques: 310 },
    { day: "Ven", visits: 520, uniques: 400 },
    { day: "Sam", visits: 380, uniques: 290 },
    { day: "Dim", visits: 300, uniques: 220 },
  ];
  const perf = [
    { axis: "Design", score: 92 },
    { axis: "Impression", score: 85 },
    { axis: "Web", score: 88 },
    { axis: "Formation", score: 78 },
    { axis: "Support", score: 90 },
    { axis: "Livraison", score: 82 },
  ];
  const funnel = [
    { stage: "Visiteurs", value: 4820 },
    { stage: "Leads", value: 1240 },
    { stage: "Devis", value: 480 },
    { stage: "Clients", value: 180 },
  ];

  const recent = [
    ...projects.slice(0, 3).map((p) => ({ type: "Projet", title: p.title, meta: p.client, icon: FolderKanban })),
    ...(articles.data ?? []).slice(0, 2).map((a) => ({ type: "Article", title: a.title, meta: a.author, icon: FileText })), // ⚠️ mock
    ...(formations.data ?? []).slice(0, 1).map((f) => ({ type: "Formation", title: f.title, meta: f.theme, icon: GraduationCap })), // ⚠️ mock
  ].slice(0, 6);

  return (
    <AdminShell>
      <PageHeader title="Dashboard" description="Vue d'ensemble de votre activité." />

      {/* KPIs — Services/Formations/Articles encore sur ancienne API, Projets réel */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Services" value={services.data?.length ?? "…"} icon={<Wrench className="h-5 w-5" />} hint={`${services.data?.filter((s) => s.featured).length ?? 0} en vedette`} />
        <StatCard label="Formations" value={formations.data?.length ?? "…"} icon={<GraduationCap className="h-5 w-5" />} hint="Programmes actifs" />
        <StatCard label="Projets" value={projectsLoading ? "…" : projects.length} icon={<FolderKanban className="h-5 w-5" />} hint="Portfolio (réel)" />
        <StatCard label="Articles" value={articles.data?.length ?? "…"} icon={<FileText className="h-5 w-5" />} hint="Publiés" />
      </div>

      {/* Note moyenne réelle, reste mock en attente d'analytics */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Visites 7j" value="2 450" icon={<Eye className="h-5 w-5" />} hint="+12% vs sem. précédente" />
        <StatCard label="Leads mois" value="1 240" icon={<Users className="h-5 w-5" />} hint="+8% ce mois" />
        <StatCard label="Taux conversion" value="14.5%" icon={<TrendingUp className="h-5 w-5" />} hint="Objectif 15%" />
        <StatCard label="Note moyenne" value={testimonialsLoading ? "…" : avgRating + " / 5"} icon={<Star className="h-5 w-5" />} hint={`${testimonials.length} témoignages (réel)`} />
      </div>

      {/* Messages, clics et membres réels ; signalements encore mock */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Messages nouveaux" value={contactsLoading ? "…" : newMessages} icon={<Inbox className="h-5 w-5" />} hint={`${contacts.length} au total (réel)`} />
        <StatCard label="Signalements ouverts" value={openReports} icon={<ShieldAlert className="h-5 w-5" />} hint="À traiter" />
        <StatCard label="Clics liens courts" value={shortLinksLoading ? "…" : totalClicks} icon={<MousePointerClick className="h-5 w-5" />} hint={`${shortLinks.length} liens (réel)`} />
        <StatCard label="Membres actifs" value={usersLoading || studentsLoading || adminsLoading ? "…" : activeUsers + activeStudents + activeAdmins} icon={<Users className="h-5 w-5" />} hint={`${totalMembers} au total (réel)`} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Utilisateurs actifs" value={usersLoading ? "…" : activeUsers} icon={<Users className="h-5 w-5" />} hint={`${users.length} au total`} />
        <StatCard label="Apprenants actifs" value={studentsLoading ? "…" : activeStudents} icon={<GraduationCap className="h-5 w-5" />} hint={`${students.length} au total`} />
        <StatCard label="Administrateurs actifs" value={adminsLoading ? "…" : activeAdmins} icon={<ShieldCheck className="h-5 w-5" />} hint={`${admins.length} au total`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-elegant lg:col-span-2">
          <div className="font-display text-lg font-semibold">Répartition des liens courts par catégorie</div>
          <div className="text-xs text-muted-foreground">Réel</div>
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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="flex items-center gap-2"><Link2 className="h-4 w-4 text-primary" /><div className="font-display text-lg font-semibold">Top 5 liens courts</div></div>
          <div className="text-xs text-muted-foreground">Réel · {activeShortLinks} liens actifs</div>
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
          <div className="font-display text-lg font-semibold">Répartition des membres</div>
          <div className="text-xs text-muted-foreground">Réel</div>
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
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-elegant lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-lg font-semibold">Revenus mensuels</div>
              <div className="text-xs text-muted-foreground">Estimation en milliers FCFA — ⚠️ mock, en attente de specs</div>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
              <TrendingUp className="h-3 w-3" /> +18%
            </div>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="revenus" stroke="var(--primary)" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="font-display text-lg font-semibold">Visites du site</div>
          <div className="text-xs text-muted-foreground">7 derniers jours — ⚠️ mock</div>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <LineChart data={visits}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="visits" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="uniques" stroke="var(--chart-2, #3C82AB)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-elegant lg:col-span-2">
          <div className="font-display text-lg font-semibold">Activité mensuelle</div>
          <div className="text-xs text-muted-foreground">Projets & formations livrés — ⚠️ mock</div>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="projets" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="formations" fill="#3C82AB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="font-display text-lg font-semibold">Formations par thème</div>
          <div className="text-xs text-muted-foreground">⚠️ mock</div>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={formationsByTheme} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} paddingAngle={2}>
                  {formationsByTheme.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="font-display text-lg font-semibold">Performance par domaine</div>
          <div className="text-xs text-muted-foreground">Score interne /100 — ⚠️ mock</div>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <RadarChart data={perf}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Radar dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="font-display text-lg font-semibold">Projets par catégorie</div>
          <div className="text-xs text-muted-foreground">Réel</div>
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

        <div className="rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="font-display text-lg font-semibold">Entonnoir commercial</div>
          <div className="text-xs text-muted-foreground">Ce mois-ci — ⚠️ mock</div>
          <div className="mt-4 space-y-3">
            {funnel.map((f, i) => {
              const pct = (f.value / funnel[0].value) * 100;
              return (
                <div key={f.stage}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{f.stage}</span>
                    <span className="text-muted-foreground">{f.value.toLocaleString()}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: pct + "%", background: pieColors[i % pieColors.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-elegant lg:col-span-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <div className="font-display text-lg font-semibold">Activité récente</div>
          </div>
          <div className="text-xs text-muted-foreground">Projets réel · Articles/Formations mock</div>
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
          <div className="text-xs text-muted-foreground">Réel · {featuredTestimonials} en vedette</div>
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