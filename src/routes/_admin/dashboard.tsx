import { createFileRoute } from "@tanstack/react-router";
import { Wrench, GraduationCap, FolderKanban, FileText, MessagesSquare, Users, Activity, Star, Inbox, ShieldAlert, Link2, MousePointerClick, ShieldUser, CircleUser, SquareUser, UserCheck, Megaphone, Briefcase, FileCheck2, UserPlus } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AdminShell, PageHeader, StatCard } from "@/components/site";
import { useAdminContactsList, useAdminUsersList, useAdminStudentsList, useAdminAdminsList, useAdminInstructorsList, useAdminProjectsList, useAdminTestimonialsList, useAdminShortLinksList, useAdminServicesList, useAdminTrainingsList, useAdminReportsList, useAdminArticlesList, useAdminAnnouncementsList, useAdminJobOffersList, useAdminJobApplicationsList, useAdminInternshipRequestsList } from "@/stores";
import { SITE } from "@/data/site";
import { ANNOUNCEMENT_TYPE_LABELS } from "@/data/announcements";
import { JOB_OFFER_CONTRACT_LABELS } from "@/data/jobOffers";
import { JOB_APPLICATION_STATUS_LABELS } from "@/data/jobApplications";
import { INTERNSHIP_REQUEST_STATUS_LABELS } from "@/data/internshipRequests";

export const Route = createFileRoute("/_admin/dashboard")({
  head: () => ({
    meta: [
      { title: `Tableau de bord | ${SITE.name}` },
      { name: "robots", content: "noindex" }
    ],
  }),
  component: DashboardPage,
});

const pieColors = ["#E07856", "#3C82AB", "#5A9B6E", "#C89A3E", "#8B5CF6", "#EC4899", "#10B981"];

function DashboardPage() {
  const { items: contacts, isLoading: contactsLoading } = useAdminContactsList({ perPage: 100 });
  const { items: users, isLoading: usersLoading } = useAdminUsersList({ perPage: 100 });
  const { items: students, isLoading: studentsLoading } = useAdminStudentsList({ perPage: 100 });
  const { items: instructors, isLoading: instructorsLoading } = useAdminInstructorsList({ perPage: 100 });
  const { items: admins, isLoading: adminsLoading } = useAdminAdminsList({ perPage: 100 });
  const { items: projects, isLoading: projectsLoading } = useAdminProjectsList({ perPage: 100 });
  const { items: testimonials, isLoading: testimonialsLoading } = useAdminTestimonialsList({ perPage: 100 });
  const { items: shortLinks, isLoading: shortLinksLoading } = useAdminShortLinksList({ perPage: 100 });
  const { items: services, isLoading: servicesLoading } = useAdminServicesList({ perPage: 100 });
  const { items: trainings, isLoading: trainingsLoading } = useAdminTrainingsList({ perPage: 100 });
  const { items: reports, isLoading: reportsLoading } = useAdminReportsList({ perPage: 100 });
  const { items: articles, isLoading: articlesLoading } = useAdminArticlesList({ perPage: 100 });
  const { items: announcements, isLoading: announcementsLoading } = useAdminAnnouncementsList({ perPage: 100 });
  const { items: jobOffers, isLoading: jobOffersLoading } = useAdminJobOffersList({ perPage: 100 });
  const { items: jobApplications, isLoading: jobApplicationsLoading } = useAdminJobApplicationsList({ perPage: 100 });
  const { items: internshipRequests, isLoading: internshipRequestsLoading } = useAdminInternshipRequestsList({ perPage: 100 });

  // --- KPIs ---
  const newMessages = contacts.filter((c) => c.status === "new").length;
  const openReports = reports.filter((r) => r.status === "pending" || r.status === "in_review").length;

  const activeUsers = users.filter((u) => u.isActive && !u.isBlocked).length;
  const activeStudents = students.filter((s) => s.isActive && !s.isBlocked).length;
  const activeInstructors = instructors.filter((i) => i.isActive && !i.isBlocked && !i.isPending).length;
  const activeAdmins = admins.filter((a) => a.isActive && !a.isBlocked && !a.isPending).length;

  const activeMembers = activeUsers + activeStudents + activeInstructors + activeAdmins;
  const totalMembers = users.length + students.length + instructors.length + admins.length;

  const totalClicks = shortLinks.reduce((s, l) => s + l.clicksCount, 0);
  const activeShortLinks = shortLinks.filter((l) => l.isActive).length;

  const activeAnnouncements = announcements.filter((a) => a.isEnabled && a.isActive).length;
  const publishedJobOffers = jobOffers.filter((j) => j.status === "published").length;

  const pendingJobApplications = jobApplications.filter((a) => a.status === "pending" || a.status === "reviewing").length;
  const pendingInternshipRequests = internshipRequests.filter((i) => i.status === "pending" || i.status === "under_review").length;

  const avgRating = testimonials.length ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1) : "…";
  const featuredServices = services.filter((s) => s.featured).length;
  const publicProjects = projects.filter((p) => p.isPublic).length;

  // --- Mappings des graphiques & Top 5 Liens ---
  const topLinks = [...shortLinks]
    .sort((a, b) => b.clicksCount - a.clicksCount)
    .slice(0, 5)
    .map((l) => ({ name: l.alias, value: l.clicksCount, url: l.shortUrl || l.longUrl }));

  const reportsByStatus = Object.entries(
    reports.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const internshipByStatus = Object.entries(
    internshipRequests.reduce<Record<string, number>>((acc, i) => {
      const label = INTERNSHIP_REQUEST_STATUS_LABELS[i.status] || i.status;
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const msgByStatus = Object.entries(
    contacts.reduce<Record<string, number>>((a, c) => { a[c.status] = (a[c.status] ?? 0) + 1; return a; }, {})
  ).map(([name, value]) => ({ name, value }));

  const membersByType = [
    { type: "Utilisateurs", value: users.length },
    { type: "Apprenants", value: students.length },
    { type: "Formateurs", value: instructors.length },
    { type: "Administrateurs", value: admins.length },
  ];

  const projectsByCategory = Object.entries(
    projects.reduce<Record<string, number>>((acc, p) => { const key = p.category || "Sans catégorie"; acc[key] = (acc[key] ?? 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const announcementsByType = Object.entries(
    announcements.reduce<Record<string, number>>((acc, a) => {
      const label = ANNOUNCEMENT_TYPE_LABELS[a.type] || a.type;
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const jobsByContract = Object.entries(
    jobOffers.reduce<Record<string, number>>((acc, j) => {
      const label = JOB_OFFER_CONTRACT_LABELS[j.contractType] || j.contractType;
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const applicationsByStatus = Object.entries(
    jobApplications.reduce<Record<string, number>>((acc, a) => {
      const label = JOB_APPLICATION_STATUS_LABELS[a.status] || a.status;
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

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
    ...jobOffers.slice(0, 2).map((j) => ({ type: "Emploi", title: j.title, meta: JOB_OFFER_CONTRACT_LABELS[j.contractType], icon: Briefcase })),
    ...internshipRequests.slice(0, 2).map((i) => ({ type: "Stage", title: `${i.firstName} ${i.lastName}`, meta: i.institution || "Demande de stage", icon: UserPlus })),
    ...projects.slice(0, 1).map((p) => ({ type: "Projet", title: p.title, meta: p.client, icon: FolderKanban })),
    ...announcements.slice(0, 1).map((a) => ({ type: "Annonce", title: a.title, meta: ANNOUNCEMENT_TYPE_LABELS[a.type], icon: Megaphone })),
  ].slice(0, 6);

  const membersLoading = usersLoading || studentsLoading || instructorsLoading || adminsLoading;

  return (
    <AdminShell>
      <PageHeader title="Tableau de bord" description="Vue d'ensemble de votre activité." />

      {/* KPIs Services, Formations, Projets, Articles, Liens */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Clics liens courts" value={shortLinksLoading ? "…" : totalClicks} icon={<MousePointerClick className="h-5 w-5" />} hint={`${activeShortLinks} liens actifs`} />
        <StatCard label="Services" value={servicesLoading ? "…" : services.length} icon={<Wrench className="h-5 w-5" />} hint={`${featuredServices} en vedette`} />
        <StatCard label="Formations" value={trainingsLoading ? "…" : trainings.length} icon={<GraduationCap className="h-5 w-5" />} hint="Programmes actifs" />
        <StatCard label="Projets" value={projectsLoading ? "…" : projects.length} icon={<FolderKanban className="h-5 w-5" />} hint={`${publicProjects} publics`} />
        <StatCard label="Articles" value={articlesLoading ? "…" : articles.length} icon={<FileText className="h-5 w-5" />} hint="Publiés" />
      </div>

      {/* KPIs Emplois, Candidatures, Stages, Messages, Signalements */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Offres d'emploi" value={jobOffersLoading ? "…" : publishedJobOffers} icon={<Briefcase className="h-5 w-5" />} hint={`${jobOffers.length} au total`} />
        <StatCard label="Candidatures" value={jobApplicationsLoading ? "…" : jobApplications.length} icon={<FileCheck2 className="h-5 w-5" />} hint={`${pendingJobApplications} à traiter`} />
        <StatCard label="Demandes de stage" value={internshipRequestsLoading ? "…" : internshipRequests.length} icon={<UserPlus className="h-5 w-5" />} hint={`${pendingInternshipRequests} en attente`} />
        <StatCard label="Messages nouveaux" value={contactsLoading ? "…" : newMessages} icon={<Inbox className="h-5 w-5" />} hint={`${contacts.length} au total`} />
        <StatCard label="Signalements ouverts" value={reportsLoading ? "…" : openReports} icon={<ShieldAlert className="h-5 w-5" />} hint={`${reports.length} au total`} />
      </div>

      {/* KPIs Membres */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Membres actifs" value={membersLoading ? "…" : activeMembers} icon={<Users className="h-5 w-5" />} hint={`${totalMembers} au total`} />
        <StatCard label="Utilisateurs actifs" value={usersLoading ? "…" : activeUsers} icon={<SquareUser className="h-5 w-5" />} hint={`${users.length} au total`} />
        <StatCard label="Apprenants actifs" value={studentsLoading ? "…" : activeStudents} icon={<CircleUser className="h-5 w-5" />} hint={`${students.length} au total`} />
        <StatCard label="Formateurs actifs" value={instructorsLoading ? "…" : activeInstructors} icon={<UserCheck className="h-5 w-5" />} hint={`${instructors.length} au total`} />
        <StatCard label="Administrateurs actifs" value={adminsLoading ? "…" : activeAdmins} icon={<ShieldUser className="h-5 w-5" />} hint={`${admins.length} au total`} />
      </div>

      {/* Section Top 5 Liens Courts & Signalements par Statut */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 shadow-elegant lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MousePointerClick className="h-5 w-5 text-primary" />
              <div className="font-display text-lg font-semibold">Top 5 - Liens les plus cliqués</div>
            </div>
            <span className="text-xs text-muted-foreground">{totalClicks} clics cumulés</span>
          </div>
          <div className="mt-4 divide-y">
            {shortLinksLoading && <div className="py-6 text-center text-sm text-muted-foreground">Chargement des liens...</div>}
            {topShortLinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate">{link.title || link.slug}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                      /{link.slug}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{link.destinationUrl}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-bold">{link.clicksCount}</div>
                    <div className="text-[10px] text-muted-foreground">clics</div>
                  </div>
                  <a href={link.destinationUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
            {!shortLinksLoading && topShortLinks.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">Aucun lien disponible</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="font-display text-lg font-semibold">Signalements par statut</div>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={reportsByStatus} dataKey="value" nameKey="name" innerRadius={35} outerRadius={70}>
                  {reportsByStatus.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Offres d'emploi & Demandes de Stage */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="font-display text-lg font-semibold">Candidatures par statut</div>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <BarChart data={applicationsByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-elegant">
          <div className="font-display text-lg font-semibold">Demandes de stage par statut</div>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <BarChart data={internshipByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="value" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Graphiques Liens & Annonces */}
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
          <div className="font-display text-lg font-semibold">Annonces par type</div>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={announcementsByType} dataKey="value" nameKey="name" innerRadius={35} outerRadius={70}>
                  {announcementsByType.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Membres & Services */}
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

      {/* Formations & Projets */}
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

      {/* Activité récente & Témoignages */}
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
          <div className="text-xs text-muted-foreground">{avgRating} / 5 de moyenne</div>
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