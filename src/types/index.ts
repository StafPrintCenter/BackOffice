export interface Service {
  id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  icon: string;
  color: string;
  featured: boolean;
  features?: string[];
  process?: string[];
  createdAt: string;
}

export interface FormationModule {
  title: string;
  lessons: string[];
}

export interface Formation {
  id: string;
  title: string;
  theme: string;
  duration: string;
  durationHours?: number;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  price: number;
  short?: string;
  audience?: string;
  objectives: string[];
  prerequisites?: string[];
  program: FormationModule[];
  certification?: string;
  schedule?: string;
  image?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  client: string;
  description: string;
  year: number;
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  htmlContent: string;
  excerpt: string;
  author: string;
  category: string;
  coverImage: string;
  publishedAt: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar?: string;
  rating: number;
  createdAt: string;
}

export interface User {
  email: string;
  name: string;
  token: string;
}

/* ============ Nouveaux modèles ============ */

export interface Category {
  id: string;
  name: string;
  slug: string;
  colorClass: string;
  isTrainingTheme: boolean;
  isProjectCategory: boolean;
  isArticleCategory: boolean;
  createdAt: string;
}

export interface Stat {
  id: string;
  key: string;
  value: number;
  suffix: string;
  label: string;
  createdAt: string;
}

export interface ShortLink {
  id: string;
  longUrl: string;
  longUrlHash: string;
  alias: string;
  category: string;
  createdBy: string;
  clicksCount: number;
  activateAt: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface ShortLinkClick {
  id: string;
  shortLinkId: string;
  ipAddress: string;
  userAgent: string;
  referer: string;
  country: string;
  region: string;
  city: string;
  device: string;
  browser: string;
  platform: string;
  clickedAt: string;
  createdAt: string;
}

export type MessageStatus = "nouveau" | "en_cours" | "traite" | "archive";

export type ReportStatus = "ouvert" | "en_cours" | "resolu" | "rejete";

export interface Report {
  id: string;
  reportableType: string;
  reportableId: string;
  reason: string;
  message: string;
  reporterEmail: string;
  status: ReportStatus;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export type AppUserRole = "admin" | "learner" | "user";
export type AppUserStatus = "active" | "suspended" | "blocked";
export type AppointmentMode = "presentiel" | "visio" | "telephone" | "whatsapp";
export type AppointmentStatus = "en_attente" | "confirme" | "refuse" | "annule" | "termine";

export interface Appointment {
  id: string;
  mode: AppointmentMode;
  duration: number; // minutes
  scheduledAt: string; // ISO date-time
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  subject: string;
  message: string;
  acceptedTerms: boolean;
  status: AppointmentStatus;
  adminNotes?: string;
  handledBy?: string;
  handledAt?: string;
  createdAt: string;
}

