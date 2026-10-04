# B&T Corp

Prototype local de marketplace de créneaux sportifs, en français, réalisé à partir du cahier des charges V1. Il réunit les espaces sportif, professionnel et administrateur autour des mêmes données fictives.

## Démarrage sous Windows

Prérequis : Node.js 20.9 ou plus récent et npm. Le projet a été vérifié avec Node.js 24.21.0.

Ouvrir PowerShell dans le dossier du projet :

```powershell
cd "C:\Users\benja\Documents\BT Corp"
npm.cmd install
npm.cmd run dev
```

Ouvrir **http://127.0.0.1:3000**. Les dépendances sont déjà installées dans le dossier livré ; pour le prochain lancement, seule la commande `npm.cmd run dev` est nécessaire. Garder le terminal ouvert et utiliser Ctrl+C pour arrêter le serveur. Si le port 3000 est occupé, suivre l’adresse indiquée dans le terminal.

Pour vérifier la version optimisée :

```powershell
npm.cmd run build
npm.cmd start
```

## Parcours de démonstration

1. Depuis l’accueil, choisir une date, un nombre de participants, puis les sports et horaires dans les filtres. Les créneaux doivent tenir entièrement dans la plage horaire sélectionnée.
2. Ouvrir une fiche établissement, ajouter un favori, puis consulter un créneau. « Je suis intéressé » est indépendant du favori et ne réserve aucune place.
3. Réserver, choisir les participants et cliquer sur **Simuler le paiement**. Simuler ensuite l’accord du club pour obtenir la confirmation et le QR code fictif.
4. Dans **Mes réservations**, afficher le QR code, rendre la partie visible en indiquant des joueurs manquants ou annuler. Les règles financières non définies restent explicitement « à définir ».
5. Dans **Espace pro**, activer le compte professionnel et choisir l’un des deux établissements gérés. Créer un créneau ou une série, dupliquer une offre, consulter le calendrier et répondre aux avis.
6. Dans **Administration**, consulter les indicateurs, chercher les utilisateurs et établissements, afficher leurs détails et simuler une activation/désactivation.

Pour créer rapidement une série sans conflit avec les créneaux de départ : choisir **demain à 07:00**, une durée de **90 minutes**, puis **3 créneaux** quotidiens. Les conflits horaires sur un même équipement sont refusés. La modification d’un créneau ayant des réservations actives est bloquée ; son annulation par le club rembourse fictivement les réservations actives à 100 %.

## Comptes fictifs

Sur `/login`, mot de passe commun : **demo**. Les boutons d’accès direct sont également disponibles.

| Compte                  | Espace                             |
| ----------------------- | ---------------------------------- |
| demo.sportif@local.test | Sportif                            |
| demo.pro@local.test     | Professionnel multi-établissements |
| demo.admin@local.test   | Administration                     |

Google, Apple et téléphone/SMS sont des boutons de connexion **simulée**. Ils n’envoient aucune requête à un fournisseur d’identité. Ne pas saisir de véritables identifiants.

## Données et limites intentionnelles

- 12 établissements fictifs, 9 sports, 300 créneaux couvrant cinq jours, plus deux créneaux d’historique. Les équipements, adresses, notes, avis, joueurs, distances et positions cartographiques sont fictifs.
- Les données sont initialisées à la date locale du premier lancement et conservées dans le `localStorage` de ce navigateur. Elles ne sont pas synchronisées entre navigateurs, appareils ou onglets. Le pied de page permet de **réinitialiser la démo** et de renouveler les dates.
- Le sélecteur de localisation propose des aperçus ; les distances restent celles de la démonstration autour de La Roche-sur-Yon. La carte est schématique, sans API ni itinéraires réels.
- Une réservation de terrain bloque le terrain entier et facture son prix une fois. Une réservation de places individuelles facture le prix multiplié par les participants.
- Les intérêts et joueurs manquants sont des états de démonstration, sans messagerie ni coordination réelle entre comptes.
- Plus de 24 h avant : 100 %. Entre 10 h et 24 h : remboursement partiel dont le pourcentage reste à définir. Entre 2 h et 10 h et aux limites exactes non précisées : règle à définir. Moins de 2 h : aucun remboursement. Annulation du club : 100 %. Absence : aucun remboursement et aucune pénalité supplémentaire.
- Les indicateurs agrègent les fixtures et les actions locales. Le taux de remplissage mesure les places occupées sur la capacité des créneaux ; il ne représente pas une métrique comptable de production.
- La désactivation d’un établissement masque ses offres de la marketplace et interdit de nouvelles réservations. La désactivation d’un utilisateur est une simulation administrative, sans contrôle d’accès réel.
- Les photos sont des illustrations de sports, sans lien avec de vrais partenaires. Voir [les crédits](public/demo/CREDITS.md).
- Aucun paiement, remboursement, email, SMS, push, check-in, authentification réelle, base SQL ou API métier. Le serveur Next.js ne sert que l’application locale. Aucune V2 ou publication cloud n’a été engagée.

## Organisation technique

- [Types métier](lib/types.ts) : établissements, offres, réservations, profils et notifications.
- [Fixtures](data/seed.ts) : données locales et sports disponibles.
- [Règles métier](lib/domain.ts) : filtres, disponibilité, prix, réservation, annulation et validation.
- [État partagé](components/store.tsx) : contexte React et persistance locale.
- [Interface sportive](components/consumer.tsx), [gestion](components/management.tsx), [composants communs](components/ui.tsx) et [navigation](components/application.tsx).
- [Styles responsive](app/globals.css), avec Tailwind CSS v4 disponible via PostCSS.
- [Route commune Next.js](app/[[...path]]/page.tsx) : les routes du cahier des charges sont interprétées côté client, pour conserver une V1 sans backend métier. Les types et fonctions métier pourront être réutilisés lors de l’introduction d’une couche API.

Stack installée : Next.js 16, React 19, TypeScript, Tailwind CSS 4, Lucide et qrcode.react. Les versions exactes sont figées dans [package-lock.json](package-lock.json).

## Vérification

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

Pour les parcours automatisés, démarrer le serveur sur le port 3000 dans un terminal puis lancer, dans un autre :

```powershell
npm.cmd run test:e2e
```

Les tests Playwright utilisent Microsoft Edge installé sur Windows, en mode sans fenêtre, en desktop et à 375 px. Ils couvrent recherche, réservation, confirmation, QR code, annulation, favoris, préférences, persistance, création en série et débordements horizontaux. Les résultats intermédiaires sont ignorés par Git.

## Publication sur GitHub Pages

Le projet génère un site statique dans `out/`. Le workflow [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) le publie sur GitHub Pages à chaque envoi sur la branche `main`.

1. Créer un dépôt GitHub vide, par exemple `bt-corp`.
2. Dans **Settings > Pages**, choisir **GitHub Actions** comme source.
3. Envoyer ce dossier dans la branche `main` du dépôt.
4. Ouvrir l'URL indiquée par l'action « Déployer sur GitHub Pages ».

Le lien prendra la forme `https://<compte>.github.io/<dépôt>/`. Les données de démonstration restent enregistrées dans le navigateur de chaque visiteur et ne sont pas synchronisées.

## Prochaine phase

Valider les écrans et les parcours avant toute V2. Le logo et la palette sont des propositions. Les règles financières incomplètes, le modèle de commission, la base de données, l’authentification et l’hébergement de production restent à décider conformément au cahier des charges.
