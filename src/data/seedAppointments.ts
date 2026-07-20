import type { Appointment } from "@/types";

const inDays = (d: number, h = 10, m = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + d);
  date.setHours(h, m, 0, 0);
  return date.toISOString();
};

export const seedAppointments: Appointment[] = [
  {
    id: "ap1", mode: "presentiel", duration: 45, scheduledAt: inDays(1, 10),
    firstName: "Marie", lastName: "Kone", email: "marie@example.com", whatsapp: "+22997000001",
    subject: "Refonte identité visuelle", message: "Souhaite discuter d'une refonte complète du logo et de la charte.",
    acceptedTerms: true, status: "en_attente", createdAt: inDays(-1),
  },
  {
    id: "ap2", mode: "visio", duration: 30, scheduledAt: inDays(2, 14, 30),
    firstName: "Paul", lastName: "Aho", email: "paul@example.com", whatsapp: "+22997000002",
    subject: "Impression grand format", message: "Devis pour 3 bâches 4x3m pour un événement.",
    acceptedTerms: true, status: "confirme", handledBy: "admin@stafprint.com", handledAt: inDays(-1), createdAt: inDays(-2),
  },
  {
    id: "ap3", mode: "telephone", duration: 15, scheduledAt: inDays(3, 9),
    firstName: "Sophie", lastName: "Dossou", email: "sophie@example.com", whatsapp: "+22997000003",
    subject: "Formation UX/UI", message: "Renseignements sur la prochaine session.",
    acceptedTerms: true, status: "en_attente", createdAt: inDays(-1, 15),
  },
  {
    id: "ap4", mode: "whatsapp", duration: 20, scheduledAt: inDays(-2, 11),
    firstName: "Yves", lastName: "Sagbo", email: "yves@example.com", whatsapp: "+22997000004",
    subject: "Site vitrine", message: "Besoin d'un site 5 pages avec formulaire de contact.",
    acceptedTerms: true, status: "termine", adminNotes: "Devis envoyé et signé.", handledBy: "admin@stafprint.com", handledAt: inDays(-2, 12), createdAt: inDays(-4),
  },
  {
    id: "ap5", mode: "visio", duration: 60, scheduledAt: inDays(-5, 16),
    firstName: "Karim", lastName: "Adjovi", email: "karim@example.com", whatsapp: "+22997000005",
    subject: "Consulting branding", message: "Accompagnement pour repositionnement de marque.",
    acceptedTerms: true, status: "annule", adminNotes: "Client a annulé la veille.", createdAt: inDays(-7),
  },
  {
    id: "ap6", mode: "presentiel", duration: 30, scheduledAt: inDays(4, 15),
    firstName: "Fatou", lastName: "Sossa", email: "fatou@example.com", whatsapp: "+22997000006",
    subject: "Impression cartes de visite", message: "500 cartes recto-verso, pelliculage mat.",
    acceptedTerms: true, status: "refuse", adminNotes: "Créneau indisponible, reproposé.", handledBy: "admin@stafprint.com", handledAt: inDays(0), createdAt: inDays(-1, 8),
  },
];
