import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Wrench, GraduationCap, FolderKanban, FileText, MessagesSquare, TrendingUp, Users, Eye, Activity, Star, Inbox, ShieldAlert, Link2, MousePointerClick } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from "recharts";
import { AdminShell, PageHeader, StatCard } from "@/components/site";
import { servicesApi } from "@/api/services.api";
import { formationsApi } from "@/api/formations.api";
import { projectsApi } from "@/api/projects.api";
import { articlesApi } from "@/api/articles.api";
import { testimonialsApi } from "@/api/testimonials.api";
import { messagesApi, reportsApi, shortLinksApi, shortLinkClicksApi, usersApi } from "@/api/extra.api";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Admin Staf Print" }, { name: "robots", content: "noindex" }] }),
  component: DashboardPage,
});

const pieColors = ["#E07856", "#3C82AB", "#5A9B6E", "#C89A3E", "#8B5CF6", "#EC4899"];

function DashboardPage() {
  const services = useQuery({ queryKey: ["services"], queryFn: servicesApi.list });
  const formations = useQuery({ queryKey: ["formations"], queryFn: formationsApi.list });
  const projects = useQuery({ queryKey: ["projects"], queryFn: projectsApi.list });
  const articles = useQuery({ queryKey: ["articles"], queryFn: articlesApi.list });
  const testimonials = useQuery({ queryKey: ["testimonials"], queryFn: testimonialsApi.list });
  const messages = useQuery({ queryKey: ["messages"], queryFn: messagesApi.list });
  const reports = useQuery({ queryKey: ["reports"], queryFn: reportsApi.list });
  const shortLinks = useQuery({ queryKey: ["short-links"], queryFn: shortLinksApi.list });
  const clicks = useQuery({ queryKey: ["short-link-clicks"], queryFn: shortLinkClicksApi.list });
  const users = useQuery({ queryKey: ["users"], queryFn: usersApi.list });

  const newMessages = (messages.data ?? []).filter((m) => m.status === "nouveau").length;
  const openReports = (reports.data ?? []).filter((r) => r.status === "ouvert" || r.status === "en_cours").length;
  const totalClicks = (shortLinks.data ?? []).reduce((s, l) => s + l.clicksCount, 0);
  const activeUsers = (users.data ?? []).filter((u) => u.status === "active").length;

  const msgByStatus = Object.entries((messages.data ?? []).reduce<Record<string, number>>((a, m) => { a[m.status] = (a[m.status] ?? 0) + 1; return a; }, {})).map(([name, value]) => ({ name, value }));
  const topLinks = [...(shortLinks.data ?? [])].sort((a, b) => b.clicksCount - a.clicksCount).slice(0, 5).map((l) => ({ name: l.alias, value: l.clicksCount }));
  const usersByRole = [{ role: "Admins", value: (users.data ?? []).filter((u) => u.role === "admin").length }, { role: "Apprenants", value: (users.data ?? []).filter((u) => u.role === "learner").length }, { role: "Utilisateurs", value: (users.data ?? []).filter((u) => u.role === "user").length }];
  const clicks30 = (() => {
    const map = new Map<string, number>();
    for (let i = 29; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); map.set(d.toISOString().slice(0, 10), 0); }
    (clicks.data ?? []).forEach((c) => { const k = c.clickedAt.slice(0, 10); if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1); });
    return Array.from(map.entries()).map(([day, value]) => ({ day: day.slice(5), value }));
  })();


  const formationsByTheme = Object.entries(
    (formations.data ?? []).reduce<Record<string, number>>((acc, f) => { acc[f.theme] = (acc[f.theme] ?? 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const projectsByCategory = Object.entries(
    (projects.data ?? []).reduce<Record<string, number>>((acc, p) => { acc[p.category] = (acc[p.category] ?? 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

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

  const avgRating = testimonials.data && testimonials.data.length
    ? (testimonials.data.reduce((s, t) => s + t.rating, 0) / testimonials.data.length).toFixed(1)
    : "…";

  const recent = [
    ...(projects.data ?? []).slice(0, 3).map((p) => ({ type: "Projet", title: p.title, meta: p.client, icon: FolderKanban })),
    ...(articles.data ?? []).slice(0, 2).map((a) => ({ type: "Article", title: a.title, meta: a.author, icon: FileText })),
    ...(formations.data ?? []).slice(0, 2).map((f) => ({ type: "Formation", title: f.title, meta: f.theme, icon: GraduationCap })),
  ].slice(0, 6);

  return (
    <AdminShell>
      <PageHeader title="Dashboard" description="Vue d'ensemble de votre activité." />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Services" value={services.data?.length ?? "…"} icon={<Wrench className="h-5 w-5" />} hint={`${services.data?.filter((s) => s.featured).length ?? 0} en vedette`} />
        <StatCard label="Formations" value={formations.data?.length ?? "…"} icon={<GraduationCap className="h-5 w-5" />} hint="Programmes actifs" />
        <StatCard label="Projets" value={projects.data?.length ?? "…"} icon={<FolderKanban className="h-5 w-5" />} hint="Portfolio" />
        <StatCard label="Articles" value={articles.data?.length ?? "…"} icon={<FileText className="h-5 w-5" />} hint="Publiés" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Visites 7j" value="2 450" icon={<Eye className="h-5 w-5" />} hint="+12% vs sem. précédente" />
        <StatCard label="Leads mois" value="1 240" icon={<Users className="h-5 w-5" />} hint="+8% ce mois" />
        <StatCard label="Taux conversion" value="14.5%" icon={<TrendingUp className="h-5 w-5" />} hint="Objectif 15%" />
        <StatCard label="Note moyenne" value={avgRating + " / 5"} icon={<Star className="h-5 w-5" />} hint={`${testimonials.data?.length ?? 0} témoignages`} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Messages nouveaux" value={newMessages} icon={<Inbox className="h-5 w-5" />} hint={`${messages.data?.length ?? 0} au total`} />
        <StatCard label="Signalements ouverts" value={openReports} icon={<ShieldAlert className="h-5 w-5" />} hint="À traiter" />
        <StatCard label="Clics liens courts" value={totalClicks} icon={<MousePointerClick className="h-5 w-5" />} hint={`${shortLinks.data?.length ?? 0} liens`} />
        <StatCard label="Utilisateurs actifs" value={activeUsers} icon={<Users className="h-5 w-5" />} hint={`${users.data?.length ?? 0} au total`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-elegant lg:col-span-2">
          <div className="font-display text-lg font-semibold">Clics liens courts — 30 jours</div>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <AreaChart data={clicks30}>
                <defs><linearGradient id="clk" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3C82AB" stopOpacity={0.4} /><stop offset="100%" stopColor="#3C82AB" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Area type="monotone" dataKey="value" stroke="#3C82AB" strokeWidth={2} fill="url(#clk)" />
              </AreaChart>
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
          <div className="font-display text-lg font-semibold">Répartition utilisateurs</div>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <BarChart data={usersByRole}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="role" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="value" fill="#5A9B6E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>


      {/* Row 1: revenus area + visits line */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-elegant lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-lg font-semibold">Revenus mensuels</div>
              <div className="text-xs text-muted-foreground">Estimation en milliers FCFA</div>
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
          <div className="text-xs text-muted-foreground">7 derniers jours</div>
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

      {/* Row 2: bar activity + pie themes */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-elegant lg:col-span-2">
          <div className="font-display text-lg font-semibold">Activité mensuelle</div>
          <div className="text-xs text-muted-foreground">Projets & formations livrés</div>
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

      {/* Row 3: radar + projects category + funnel */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="font-display text-lg font-semibold">Performance par domaine</div>
          <div className="text-xs text-muted-foreground">Score interne /100</div>
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
          <div className="text-xs text-muted-foreground">Ce mois-ci</div>
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

      {/* Row 4: activity feed + testimonials */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-elegant lg:col-span-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <div className="font-display text-lg font-semibold">Activité récente</div>
          </div>
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
          <ul className="mt-4 space-y-4">
            {(testimonials.data ?? []).slice(0, 3).map((t) => (
              <li key={t.id} className="rounded-xl border p-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mt-2 text-xs italic line-clamp-3">"{t.quote}"</p>
                <div className="mt-2 text-xs font-medium">{t.name}</div>
                <div className="text-[10px] text-muted-foreground">{t.company}</div>
              </li>
            ))}
            {(!testimonials.data || testimonials.data.length === 0) && (
              <li className="text-center text-sm text-muted-foreground">Aucun témoignage</li>
            )}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}
