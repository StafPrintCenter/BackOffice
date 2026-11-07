import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

const LABELS: [RegExp, string, string][] = [
  [/^\/dashboard(?:\/|$)/, "Tableau de bord d'administration", "Suivez les indicateurs clés et accédez aux outils de gestion de la plateforme."],
  [/^\/announces\/[^/]+(?:\/|$)/, "Détail d'une annonce", "Consultez et gérez une annonce publiée sur la plateforme."],
  [/^\/announces(?:\/|$)/, "Annonces", "Créez et gérez les annonces affichées sur la plateforme."],
  [/^\/appointments\/[^/]+(?:\/|$)/, "Détail d'un rendez-vous", "Consultez et gérez un rendez-vous."],
  [/^\/appointments(?:\/|$)/, "Rendez-vous", "Consultez et gérez les rendez-vous de la plateforme."],
  [/^\/articleFeedback\/group\/[^/]+(?:\/|$)/, "Retours groupés sur un article", "Consultez les retours des utilisateurs regroupés pour un article."],
  [/^\/articleFeedback\/group(?:\/|$)/, "Retours groupés sur les articles", "Consultez les retours des utilisateurs regroupés par article."],
  [/^\/articleFeedback\/unique\/[^/]+(?:\/|$)/, "Détail d'un retour sur un article", "Consultez un retour individuel sur un article."],
  [/^\/articleFeedback\/unique(?:\/|$)/, "Retours individuels sur les articles", "Consultez les retours individuels des utilisateurs sur les articles."],
  [/^\/articles\/[^/]+(?:\/|$)/, "Détail d'un article", "Consultez et gérez le contenu d'un article."],
  [/^\/articles(?:\/|$)/, "Articles", "Créez et gérez les articles de la plateforme."],
  [/^\/categories\/[^/]+(?:\/|$)/, "Détail d'une catégorie", "Consultez et modifiez une catégorie."],
  [/^\/categories(?:\/|$)/, "Catégories", "Organisez les catégories utilisées sur la plateforme."],
  [/^\/community\/categories(?:\/|$)/, "Catégories de la communauté", "Gérez les catégories des publications de la communauté."],
  [/^\/community\/posts\/[^/]+(?:\/|$)/, "Détail d'une publication", "Consultez et gérez une publication de la communauté."],
  [/^\/community\/posts(?:\/|$)/, "Publications de la communauté", "Consultez et gérez les publications de la communauté."],
  [/^\/community\/reports\/[^/]+(?:\/|$)/, "Détail d'un signalement", "Examinez et traitez un contenu signalé dans la communauté."],
  [/^\/community\/reports(?:\/|$)/, "Signalements de la communauté", "Examinez et traitez les contenus signalés par les utilisateurs."],
  [/^\/community\/stats(?:\/|$)/, "Statistiques de la communauté", "Consultez les indicateurs d'activité de la communauté."],
  [/^\/ecosystem\/[^/]+(?:\/|$)/, "Détail d'un partenaire de l'écosystème", "Consultez et gérez une organisation partenaire."],
  [/^\/ecosystem(?:\/|$)/, "Écosystème", "Gérez les organisations partenaires de la plateforme."],
  [/^\/faqs\/[^/]+(?:\/|$)/, "Détail d'une FAQ", "Consultez et modifiez une question fréquente."],
  [/^\/faqs(?:\/|$)/, "FAQ", "Créez et gérez les questions fréquentes de la plateforme."],
  [/^\/health(?:\/|$)/, "Santé de la plateforme", "Consultez l'état des services et les indicateurs de santé de la plateforme."],
  [/^\/internships\/[^/]+(?:\/|$)/, "Détail d'une offre de stage", "Consultez et gérez une offre de stage."],
  [/^\/internships(?:\/|$)/, "Offres de stage", "Consultez et gérez les offres de stage publiées."],
  [/^\/jobs\/applications\/[^/]+(?:\/|$)/, "Détail d'une candidature", "Consultez et gérez une candidature à une offre d'emploi."],
  [/^\/jobs\/applications(?:\/|$)/, "Candidatures", "Consultez et gérez les candidatures reçues."],
  [/^\/jobs\/offers\/[^/]+(?:\/|$)/, "Détail d'une offre d'emploi", "Consultez et gérez une offre d'emploi."],
  [/^\/jobs\/offers(?:\/|$)/, "Offres d'emploi", "Consultez et gérez les offres d'emploi publiées."],
  [/^\/members\/admins\/[^/]+(?:\/|$)/, "Détail d'un administrateur", "Consultez et gérez un compte administrateur."],
  [/^\/members\/admins(?:\/|$)/, "Administrateurs", "Gérez les comptes administrateurs de la plateforme."],
  [/^\/members\/instructors\/[^/]+(?:\/|$)/, "Détail d'un formateur", "Consultez et gérez un compte formateur."],
  [/^\/members\/instructors(?:\/|$)/, "Formateurs", "Gérez les comptes formateurs de la plateforme."],
  [/^\/members\/students\/[^/]+(?:\/|$)/, "Détail d'un étudiant", "Consultez et gérez un compte étudiant."],
  [/^\/members\/students(?:\/|$)/, "Étudiants", "Gérez les comptes étudiants de la plateforme."],
  [/^\/members\/users\/[^/]+(?:\/|$)/, "Détail d'un utilisateur", "Consultez et gérez un compte utilisateur."],
  [/^\/members\/users(?:\/|$)/, "Utilisateurs", "Consultez et gérez les comptes utilisateurs de la plateforme."],
  [/^\/messages\/[^/]+(?:\/|$)/, "Détail d'un message", "Consultez le contenu et le statut d'un message."],
  [/^\/messages(?:\/|$)/, "Messages", "Consultez et gérez les messages reçus par la plateforme."],
  [/^\/newsletter\/campaigns\/[^/]+(?:\/|$)/, "Détail d'une campagne newsletter", "Consultez et gérez une campagne de newsletter."],
  [/^\/newsletter\/campaigns(?:\/|$)/, "Campagnes newsletter", "Créez et gérez les campagnes de newsletter."],
  [/^\/newsletter\/subscribers\/[^/]+(?:\/|$)/, "Détail d'un abonné", "Consultez et gérez un abonné à la newsletter."],
  [/^\/newsletter\/subscribers(?:\/|$)/, "Abonnés à la newsletter", "Consultez et gérez les abonnés à la newsletter."],
  [/^\/notifications\/preferences(?:\/|$)/, "Préférences de notifications", "Configurez les notifications de votre compte administrateur."],
  [/^\/notifications\/[^/]+(?:\/|$)/, "Détail d'une notification", "Consultez une notification de votre espace d'administration."],
  [/^\/notifications(?:\/|$)/, "Notifications", "Consultez les notifications de votre espace d'administration."],
  [/^\/profile(?:\/|$)/, "Mon profil administrateur", "Consultez et gérez les informations de votre compte."],
  [/^\/projects\/[^/]+(?:\/|$)/, "Détail d'un projet", "Consultez et gérez un projet."],
  [/^\/projects(?:\/|$)/, "Projets", "Consultez et gérez les projets de la plateforme."],
  [/^\/reports\/[^/]+(?:\/|$)/, "Détail d'un rapport", "Consultez les informations d'un rapport."],
  [/^\/reports(?:\/|$)/, "Rapports", "Consultez les rapports de la plateforme."],
  [/^\/reviews\/forms\/[^/]+(?:\/|$)/, "Détail d'un formulaire d'évaluation", "Consultez et gérez un formulaire d'évaluation."],
  [/^\/reviews\/forms(?:\/|$)/, "Formulaires d'évaluation", "Créez et gérez les formulaires d'évaluation."],
  [/^\/reviews\/invites\/[^/]+(?:\/|$)/, "Détail d'une invitation à évaluer", "Consultez et gérez une invitation à répondre à une évaluation."],
  [/^\/reviews\/invites(?:\/|$)/, "Invitations aux évaluations", "Consultez et gérez les invitations aux évaluations."],
  [/^\/reviews\/responses\/[^/]+(?:\/|$)/, "Détail d'une réponse d'évaluation", "Consultez une réponse à un formulaire d'évaluation."],
  [/^\/reviews\/responses(?:\/|$)/, "Réponses aux évaluations", "Consultez les réponses aux formulaires d'évaluation."],
  [/^\/security\/mfa(?:\/|$)/, "Sécurité du compte", "Gérez la double authentification, les méthodes de connexion et les codes de secours."],
  [/^\/security\/sessions(?:\/|$)/, "Sessions actives", "Consultez et fermez les sessions ouvertes sur votre compte administrateur."],
  [/^\/services\/[^/]+(?:\/|$)/, "Détail d'un service", "Consultez et gérez un service de la plateforme."],
  [/^\/services(?:\/|$)/, "Services", "Consultez et gérez les services proposés sur la plateforme."],
  [/^\/shortlinks\/[^/]+(?:\/|$)/, "Détail d'un lien court", "Consultez et gérez un lien court."],
  [/^\/shortlinks(?:\/|$)/, "Liens courts", "Créez et gérez les liens courts de la plateforme."],
  [/^\/stats\/[^/]+(?:\/|$)/, "Détail d'une statistique", "Consultez les indicateurs détaillés de la plateforme."],
  [/^\/stats(?:\/|$)/, "Statistiques", "Consultez les statistiques de la plateforme."],
  [/^\/testimonials\/[^/]+(?:\/|$)/, "Détail d'un témoignage", "Consultez et gérez un témoignage."],
  [/^\/testimonials(?:\/|$)/, "Témoignages", "Consultez et gérez les témoignages publiés sur la plateforme."],
  [/^\/trainings\/catalogs\/[^/]+\/manage(?:\/|$)/, "Gestion du catalogue de formation", "Gérez les modules, les leçons et les contenus d'un catalogue de formation."],
  [/^\/trainings\/catalogs\/[^/]+(?:\/|$)/, "Détail d'un catalogue de formation", "Consultez et gérez un catalogue de formation."],
  [/^\/trainings\/catalogs(?:\/|$)/, "Catalogues de formation", "Créez et gérez les catalogues de formation."],
  [/^\/trainings\/payments\/[^/]+(?:\/|$)/, "Détail d'un paiement de formation", "Consultez les informations d'un paiement de formation."],
  [/^\/trainings\/payments(?:\/|$)/, "Paiements de formation", "Consultez et gérez les paiements liés aux formations."],
  [/^\/trainings\/registrations\/[^/]+(?:\/|$)/, "Détail d'une inscription", "Consultez et gérez une inscription à une formation."],
  [/^\/trainings\/registrations(?:\/|$)/, "Inscriptions aux formations", "Consultez et gérez les inscriptions aux formations."],
  [/^\/trainings\/reviews(?:\/|$)/, "Évaluations des formations", "Consultez les évaluations des formations."],
  [/^\/trainings\/sessions\/[^/]+(?:\/|$)/, "Détail d'une session de formation", "Consultez et gérez une session de formation."],
  [/^\/trainings\/sessions(?:\/|$)/, "Sessions de formation", "Consultez et gérez les sessions des formations."],
  [/^\/waitlist\/[^/]+(?:\/|$)/, "Détail d'une demande d'attente", "Consultez et gérez une demande de la liste d'attente."],
  [/^\/waitlist(?:\/|$)/, "Liste d'attente", "Consultez et gérez les demandes de la liste d'attente."],
  [/^\/login(?:\/|$)/, "Connexion administrateur", "Connectez-vous à votre espace d'administration."],
  [/^\/invite(?:\/|$)/, "Activation du compte administrateur", "Finalisez l'activation de votre compte à partir de votre invitation."],
  [/^\/forgot-password(?:\/|$)/, "Mot de passe oublié", "Demandez un lien pour réinitialiser votre mot de passe."],
  [/^\/reset-password(?:\/|$)/, "Nouveau mot de passe", "Choisissez un nouveau mot de passe pour votre compte administrateur."],
];

/** Pushes the current screen (no personal data) to SPC Intelligence. */
export function useSpcPageContext() {
  const pathname = useLocation({ select: (l) => l.pathname });
  useEffect(() => {
    const m = LABELS.find(([re]) => re.test(pathname));
    const title = m?.[1] ?? "Administration STAF PRINT CENTER";
    const text = m?.[2] ?? "Gérez la plateforme STAF PRINT CENTER depuis votre espace d'administration.";
    const apply = () => window.SPCIntelligence?.setContext(() => ({ title, text }));
    apply();
    const t = window.setTimeout(apply, 1500); // widget loads async
    return () => window.clearTimeout(t);
  }, [pathname]);
}

export function askSpc(prompt: string) {
  window.SPCIntelligence?.open(prompt);
}
