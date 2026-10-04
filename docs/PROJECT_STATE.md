# Suivi du prototype B&T Corp

Ce fichier est la mémoire de travail du projet. Le lire avant une évolution, puis le mettre à jour dans la même modification que le code. Il complète les instructions de [AGENTS.md](../AGENTS.md), sans les remplacer.

## État courant

- Phase : prototype local V1, données fictives et état navigateur uniquement.
- Stack : Next.js 16, React 19, TypeScript, Tailwind CSS 4, Lucide et QR code client.
- Source de vérité locale : `data/seed.ts`; état persistant : `components/store.tsx` (`localStorage`).
- Aucun backend, base SQL, paiement, OAuth, SMS, API GPS ou déploiement de production.

## V4 appliquée

- Accueil : le hero marketing et le CTA Pro intermédiaire sont masqués; la recherche arrive sous le header.
- Accueil et recherche : la localisation est placée avant la recherche, sans chevauchement. Le texte promotionnel redondant sous la barre a été retiré. Les filtres se dévoilent avec un seul bouton `Filtres` dans la barre.
- Accueil : le bandeau mobile `Démo locale` a été supprimé; la localisation reste indiquée dans l'introduction. Le contrôle de localisation de l'en-tête bureau reste disponible.
- Accueil : le texte d'introduction reste sur une ligne quand la largeur le permet et redevient lisible sur plusieurs lignes à 375 px. La section partenaires recherchés précède désormais les clubs favoris.
- Choix de dates : le passage d'une date à une période se fait avec la case à cocher `Plusieurs jours`, jamais avec une liste déroulante.
- Offres : `Offer.kind` distingue `classique` et `bon-plan`. Seul un bon plan affiche sa remise et son prix barré.
- Recherche : date unique ou période, sports, horaire, participants, rayon et filtre très visible `Bons plans / offres en réduction`. Les résultats sont groupés par jour.
- Trajet : carte, distance et durée simulées sur une fiche établissement, une réservation et une fiche événement. Le bouton S'y rendre donne un retour visible sans service externe.
- Espace Pro : création/édition d'établissement, contact, sports, équipements, horaires et exceptions. Les calendriers proposent les vues jour, semaine et mois.
- Événements : création depuis l'espace Pro, liste Pro, liste publique, fiche publique et participation fictive.
- Connexion : le formulaire est soumis explicitement et redirige avec `router.replace` vers `/`, `/pro` ou `/admin` selon le compte de démonstration.

## Publication de démonstration

- GitHub Pages : l'application est compatible avec un export statique Next.js (`output: "export"`) et un préfixe de dépôt, pour les liens et illustrations sous `https://<compte>.github.io/<dépôt>/`.
- Le workflow `.github/workflows/deploy-pages.yml` installe les dépendances, génère `out/` et déploie cette archive à chaque envoi sur `main`.
- L'espace de travail n'est pas encore un dépôt Git et aucun compte GitHub ni dépôt cible n'a été choisi. La publication effective reste à faire après réception de ces informations.

## Modèle métier

- `Offer.kind`: `classique | bon-plan`.
- `SearchFilters`: `dateMode`, `date`, `startDate`, `endDate`, `dealsOnly`.
- `Establishment`: contact, horaires hebdomadaires et exceptions locales.
- `DemoEvent`: événement lié à un établissement; aucune billetterie avancée.

## Vérifications réalisées

- `npm run typecheck` : succès.
- `npm test` : 6 tests réussis, incluant le filtre période et bons plans.
- `npm run build` : succès.
- Playwright : redirection de connexion vérifiée sur desktop et mobile (375 px) pour les comptes Pro et Administrateur. La suite complète démarre correctement; une exécution avec traces a été interrompue par une erreur Playwright de fichier trace manquant (`ENOENT`), extérieure à l'application.
- Playwright : accueil, localisation, ouverture des filtres et plage de dates vérifiés sur desktop et mobile (375 px).

## Parcours à revalider après une évolution

1. Connexion des trois comptes et redirection.
2. Recherche par date, période et bons plans.
3. Réservation, paiement fictif, confirmation, QR code, itinéraire et annulation.
4. Création d'un établissement, d'une exception et d'un événement Pro.
5. Largeur 375 px sur l'accueil, la recherche et la connexion.

## Points explicitement non décidés

- Remboursement entre 10 h et 24 h : pourcentage à définir.
- Remboursement entre 2 h et 10 h : règle à définir.
- Commission, abonnement, identité finale, authentification, stockage et hébergement : phase ultérieure.
