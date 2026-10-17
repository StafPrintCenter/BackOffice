import { Bell, CreditCard, GraduationCap, ShieldCheck, UserCircle, Users, type LucideIcon } from "lucide-react";

export type NotificationCategory = "security" | "general" | "profile" | "training" | "payment" | "community";

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  "security", "general", "profile", "training", "payment", "community",
];

export const CATEGORY_META: Record<NotificationCategory, { label: string; description: string; icon: LucideIcon; className: string }> = {
  security: {
    label: "Sécurité",
    description: "Connexions et alertes de compte. Toujours actives, toujours instantanées.",
    icon: ShieldCheck,
    className: "bg-red-500/10 text-red-600"
  },
  general: {
    label: "Général",
    description: "Messages de contact, rendez-vous, signalements et activité du site.",
    icon: Bell,
    className: "bg-blue-500/10 text-blue-600"
  },
  profile: {
    label: "Profil",
    description: "Modifications liées à votre profil.",
    icon: UserCircle,
    className: "bg-violet-500/10 text-violet-600"
  },
  training: {
    label: "Formations",
    description: "Inscriptions et activité des formations.",
    icon: GraduationCap,
    className: "bg-amber-500/10 text-amber-600"
  },
  payment: {
    label: "Paiements",
    description: "Paiements et facturation.",
    icon: CreditCard,
    className: "bg-emerald-500/10 text-emerald-600"
  },
  community: {
    label: "Communauté",
    description: "Interactions de la communauté.",
    icon: Users,
    className: "bg-pink-500/10 text-pink-600"
  },
};

export type APINotificationListItem = {
  id: string;
  category: NotificationCategory;
  type: string;
  title: string;
  isRead: boolean;
  deliveredAt: string;
};

export type APINotificationDetail = APINotificationListItem & {
  body: string;
  data?: Record<string, unknown> | null;
  actionUrl?: string | null;
  readAt: string | null;
};

export type APINotificationsMeta = {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  unreadTotal: number;
};

export type DeliveryMode = "instant" | "scheduled";

export type APINotificationPreference = {
  category: NotificationCategory;
  locked: boolean;
  enabled: boolean;
  deliveryMode: DeliveryMode;
  scheduleDays: number[];
  scheduleStartTime: string | null; // "HH:mm:ss"
  scheduleEndTime: string | null;
};

export const WEEKDAYS = [
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mer" },
  { value: 4, label: "Jeu" },
  { value: 5, label: "Ven" },
  { value: 6, label: "Sam" },
  { value: 7, label: "Dim" },
];

export function formatNotificationDate(iso: string): string {
  return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}