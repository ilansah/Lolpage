# Lolpage

## L'objectif de notre projet

L'idée de base du projet Lolpage, c'était de faire une application web utilitaire pour les joueurs de League of Legends. Le but est d'utiliser l'API officielle de Riot Games pour afficher des stats en direct sur les joueurs, chercher des profils, et avoir un système pour garder ses champions ou ses builds en favoris.

## Les fonctionnalités principales

- Une page avce tout les champions et toutes leurs caractéristiques.
- Une page avec tout les items et toutes leurs caractéristiques.
- Une page avec tout les runes et toutes leurs caractéristiques.
- Une page Leaderboard pour voir le classement des meilleurs joueurs.
- Un système de favoris pour sauvegarder des éléments qu'on aime bien.
- Un système de Pre Build pour préparer ses items en vue d'une partie.
- Une interface propre avec une barre de navigation pour se balader facilement entre les vues.

## Qui a fait quoi

- Ilan : J'ai fait l'initialisation du projet. Je me suis beaucoup occupé de la logique, comme les appels à l'API Riot, le traitement des données pour le Leaderboard, l'affichage des profils, et la création de la logique du store pour nos favoris.
- Victorian : Il a géré la partie visuelle et la création de plusieurs composants clés. Il a fait la mise en forme générale des pages, l'architecture CSS, la NavBar, l'intégration du système complet de pre-build, et la retouche de composants quand on avait des problèmes d'affichage.

## Comment on s'est organisé

On a travaillé avec Git et GitHub pour partager notre code au fur et à mesure. On s'est fait une séparation simple et efficace : moi je m'attaquais d'abord aux mécaniques de fond (la data, l'API, les actions et requêtes) et Victorian s'occupait de l'intégration, de relier tout ça au visuel et de faire en sorte que nos pages rendent bien.
## Les difficultés rencontrées et les solutions apportées

- **API Riot et limites de requêtes** : L'API limite le nombre d'appels et a changé sa façon de rechercher les joueurs (utilisation du `puuid`).
  **Solution** : On a optimisé les appels avec des requêtes asynchrones et ajouté des sécurités (`try/catch`) pour gérer les erreurs.

- **Perte des données au rafraîchissement** : Passer les données de page en page était trop complexe et tout s'effaçait en rechargeant la page.
  **Solution** : On a utilisé un "Store" (gestionnaire d'état) connecté au stockage du navigateur (`localStorage`) pour sauvegarder les données.

- **Problèmes d'affichage sur les petits écrans** : Notre mise en page initiale posait problème sur les pages avec beaucoup d'éléments.
  **Solution** : On a refait le design avec Flexbox pour rendre le site fluide et responsive sur tous les écrans.

## Comment installer et lancer l'application

1. Il faut cloner le repo avec un "git clone".
2. Ouvrir le dossier dans le terminal et taper "npm install" pour installer toutes les dépendances.
3. Pour que les requêtes marchent, il faut fournir une clé API Riot Games. Créez un fichier appelé ".env" à la racine du projet et ajoutez-y votre clé comme ceci : VITE_RIOT_API_KEY=votre_cle_ici (la clé se récupère sur le portail dev de Riot et dure souvent 24h).
4. Taper "npm run dev" pour lancer le projet en local.
5. Ouvrir le lien affiché dans le terminal.
