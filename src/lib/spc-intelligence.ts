import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

const LABELS: [RegExp, string, string][] = [
  [/^\/dashboard/, "Tableau de bord formateur", "Vue d'ensemble : formations assignées, prochaines sessions, statistiques."],
  [/^\/formations\/[^/]+\/contenu/, "Gestion du contenu de formation", "Édition des modules, leçons et quiz d'une formation."],
  [/^\/formations\/[^/]+/, "Détail d'une formation", "Cohorte, progression des apprenants et contenus."],
  [/^\/formations/, "Mes formations", "Liste des formations assignées au formateur."],
  [/^\/apprenants\/[^/]+/, "Fiche apprenant", "Progression, résultats de quiz et travaux à corriger d'un apprenant."],
  [/^\/apprenants/, "Mes apprenants", "Suivi de la progression des apprenants."],
  [/^\/corrections/, "File de correction", "Notation des travaux rendus et rédaction de feedback pédagogique."],
  [/^\/sessions/, "Sessions & présences", "Planification des sessions en ligne ou sur site et suivi des présences."],
  [/^\/communaute/, "Communauté", "Annonces et messagerie avec les apprenants."],
  [/^\/profil/, "Profil formateur", "Réglages du profil, disponibilités et notifications."],
  [/^\/charte/, "Charte d'engagement & CGU formateur", "Document contractuel : gouvernance, propriété des contenus, confidentialité, corrections, assistant IA et déontologie."],
];

/** Pushes the current screen (no personal data) to SPC Intelligence. */
export function useSpcPageContext() {
  const pathname = useLocation({ select: (l) => l.pathname });
  useEffect(() => {
    const m = LABELS.find(([re]) => re.test(pathname));
    const title = m?.[1] ?? "Espace Formateur STAF PRINT CENTER";
    const text = m?.[2] ?? "Connexion et accès à l'espace formateur du LMS STAF PRINT CENTER.";
    const apply = () => window.SPCIntelligence?.setContext(() => ({ title, text }));
    apply();
    const t = window.setTimeout(apply, 1500); // widget loads async
    return () => window.clearTimeout(t);
  }, [pathname]);
}

export function askSpc(prompt: string) {
  window.SPCIntelligence?.open(prompt);
}
