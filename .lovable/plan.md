Gros lot de travail — je le découpe en 4 phases pour rester lisible.

## 1. Refonte du modèle de données (`src/types` + `src/data/seed.ts` + `src/api/*`)

J'aligne les types sur le schéma fourni :

- **Category** (nouveau) — `id, name, slug, colorClass, isTrainingTheme, isProjectCategory, isArticleCategory`
- **Service** — ajout `projectCategoryId, features[], process[]`, renomme `shortDescription→short`, `longDescription→long`
- **Formation** — ajout `themeId, durationHours, short, audience, prerequisites, certification, schedule`
- **Project** — passe à `categoryId, cover` (remplace `imageUrl`)
- **Article** — ajout `categoryId, publishedAt, body` (remplace `htmlContent`), garde `slug`
- **Testimonial** — inchangé
- **Stat** (nouveau) — `id, key, value, suffix, label`
- **Faq** (nouveau) — `id, categoryId, question, answer, order`
- **ShortLink** (nouveau) — `id, longUrl, longUrlHash, alias, category, createdBy, clicksCount, activateAt, expiresAt, isActive`
- **ShortLinkClick** (nouveau) — `id, shortLinkId, ipAddress, userAgent, referer, country, region, city, device, browser, platform, clickedAt`
- **Message** (nouveau) — `id, ticketNumber, name, email, service, customService, message, status, adminNotes, handledBy, handledAt`
- **Report** (nouveau) — `id, reportableType, reportableId, reason, message, reporterEmail, status, resolvedBy, resolvedAt`
- **AppUser** (nouveau) — `id, name, email, role ('admin'|'learner'|'user'), status ('active'|'suspended'|'blocked'), invitedAt, lastLoginAt`

APIs correspondantes en mémoire (`categories.api.ts`, `stats.api.ts`, `faqs.api.ts`, `shortLinks.api.ts`, `shortLinkClicks.api.ts`, `messages.api.ts`, `reports.api.ts`, `users.api.ts`) suivant le même pattern `list / getById / create / update / remove`.

## 2. Pages détail existantes (id / slug) + modal d'édition intégré

Une page détail par entité, accessible depuis la table admin (bouton "Voir") :

- `/admin/services/$slug` — aperçu complet + bouton "Modifier" ouvrant le modal existant
- `/admin/formations/$id`
- `/admin/projects/$id`
- `/admin/articles/$slug`
- `/admin/testimonials/$id`

Chaque page détail : header (titre, meta), sections structurées (description, features/process, program, etc.), et modal de modification réutilisant la logique déjà présente dans les pages liste.

## 3. Nouveaux modules admin

Chacun avec **liste + création + édition** (id sauf catégories qui gardent le slug). Les entités taggées "(id)" auront aussi une page détail.

| Route | Type | Notes |
|---|---|---|
| `/admin/categories` + `/admin/categories/$slug` | CRUD | 1er lien — permet de choisir le type (formation/projet/article) via toggles |
| `/admin/stats` | CRUD simple | Stats vitrine (chiffres publics) |
| `/admin/faqs` | CRUD | Lié à catégorie, tri par `order` |
| `/admin/short-links` + `/admin/short-links/$id` | CRUD + détail | La page détail affiche l'historique des clics (`ShortLinkClick`) avec graphiques (device, pays, timeline) |
| `/admin/messages` + `/admin/messages/$id` | CRUD + détail | Ticket, statut, notes admin |
| `/admin/reports` + `/admin/reports/$id` | CRUD + détail | Signalements avec résolution |
| `/admin/users` | CRUD spécial | Onglets : Admins / Apprenants / Utilisateurs. Actions : inviter admin, suspendre, changer rôle · bloquer/désactiver/réactiver/supprimer utilisateur ou apprenant |

## 4. AdminShell + Dashboard

- **`AdminShell.tsx`** : retirer l'item "Profil" de la nav principale (ligne 14) et le placer dans la section footer (ligne 94), à côté de l'email connecté, avant le bouton de déconnexion. Ajouter dans la nav les nouveaux liens : Catégories, Stats, FAQ, Liens courts, Messages, Signalements, Utilisateurs. Regroupement visuel léger (labels de section : "Contenu", "Système", "Communauté").
- **`admin.index.tsx`** : enrichir avec de nouveaux blocs alimentés par les nouvelles données :
  - KPIs supplémentaires : Messages non lus, Signalements en attente, Clics liens courts (total), Utilisateurs actifs
  - Graphique aire : clics liens courts sur 30j
  - Répartition messages par statut (donut)
  - Top 5 liens courts (bar chart)
  - Distribution utilisateurs (admin/apprenant/user) — stacked bar
  - Signalements par type — mini bar
  - Feed activité étendu incluant nouveaux messages + signalements récents

## Détails techniques

- Toutes les nouvelles routes sont typées via `createFileRoute` avec `head()` `robots: noindex`.
- Le `routeTree.gen.ts` se régénère automatiquement — je ne l'édite pas manuellement.
- Les APIs restent des mocks en mémoire (`delay` + `uid`) pour préparer une future intégration REST.
- Les modaux existants (`Dialog` shadcn) sont réutilisés ; les formulaires sont validés via Zod.
- Les catégories sont référencées par `categoryId` dans Services / Formations / Projets / Articles / FAQ — les selects du modal listent les catégories filtrées par flag (`isProjectCategory`, etc.).
- La page utilisateurs utilise des `Tabs` shadcn pour les 3 onglets, avec un `AlertDialog` de confirmation pour chaque action destructrice.

## Ordre d'exécution

1. Types + seeds + APIs (fondation)
2. AdminShell (nav enrichie + déplacement Profil)
3. Modules simples : catégories, stats, FAQ, messages, signalements
4. Liens courts + page détail avec stats de clics
5. Utilisateurs (3 onglets + actions)
6. Pages détail des entités existantes
7. Dashboard enrichi

⚠️ Volume : ~30 nouveaux fichiers. Le travail est conséquent — confirme-moi que le périmètre te va tel quel, ou dis-moi si tu préfères que je découpe en plusieurs livraisons (par ex. commencer par phases 1–3, puis phases 4–7 dans un second temps).
