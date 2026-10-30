import { LayoutDashboard, Wrench, FolderKanban, FileText, MessagesSquare, Tags, BarChart3, HelpCircle, Link2, ClipboardClock, Form, Inbox, ShieldAlert, CalendarClock, GraduationCap, UserRoundPen, UserCheck, UserStar, UserCog, Mailbox, Flag, BriefcaseBusiness, Building2, MessageSquareDiff, Group, Bell } from "lucide-react";

export type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  matchPrefixes?: string[];
};

export type NavGroup = { label: string; items: NavItem[] };

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Général",
    items: [
      { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
      { to: "/notifications", label: "Notifications", icon: Bell, matchPrefixes: ["/notifications"] },
    ],
  },
  {
    label: "Contenu",
    items: [
      { to: "/categories", label: "Catégories", icon: Tags },
      { to: "/services", label: "Services", icon: Wrench },
      { to: "/projects", label: "Projets", icon: FolderKanban },
      { to: "/trainings/catalogs", label: "Formations", icon: GraduationCap, matchPrefixes: ["/trainings"] },
      { to: "/articles", label: "Articles", icon: FileText },
      { to: "/faqs", label: "FAQ", icon: HelpCircle },
      { to: "/testimonials", label: "Témoignages", icon: MessagesSquare },
      { to: "/stats", label: "Statistiques", icon: BarChart3 },
      { to: "/ecosystem", label: "Écosystème", icon: Group },
    ],
  },
  {
    label: "Communication",
    items: [
      { to: "/messages", label: "Messages", icon: Inbox },
      { to: "/newsletter/subscribers", label: "Newsletter", icon: Mailbox, matchPrefixes: ["/newsletter"] },
      { to: "/announces", label: "Annonces", icon: Flag },
    ],
  },
  {
    label: "Interactions",
    items: [
      { to: "/appointments", label: "Rendez-vous", icon: CalendarClock },
      { to: "/reports", label: "Signalements", icon: ShieldAlert },
      { to: "/reviews/forms", label: "Formulaires d'avis", icon: Form, matchPrefixes: ["/reviews"] },
      { to: "/waitlist", label: "Liste d'attente", icon: ClipboardClock },
      { to: "/articleFeedback/unique", label: "Feedback d'articles", icon: MessageSquareDiff, matchPrefixes: ["/articleFeedback"] },
    ],
  },
  {
    label: "Outils",
    items: [
      { to: "/shortlinks", label: "Liens courts", icon: Link2 },
    ],
  },
  {
    label: "Recrutements",
    items: [
      { to: "/jobs/offers", label: "Offres d'emploi", icon: BriefcaseBusiness, matchPrefixes: ["/jobs"] },
      { to: "/internships", label: "Stages", icon: Building2 },
    ],
  },
  {
    label: "Membres",
    items: [
      { to: "/members/users", label: "Utilisateurs", icon: UserCheck },
      { to: "/members/students", label: "Apprenants", icon: UserRoundPen },
      { to: "/members/instructors", label: "Instructeurs", icon: UserStar },
      { to: "/members/admins", label: "Administrateurs", icon: UserCog },
    ],
  },
];

export const navItemClass =
  "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground " +
  "data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground " +
  "data-[active=true]:hover:bg-sidebar-primary data-[active=true]:hover:text-sidebar-primary-foreground";