# ⚔️ Lolpage - Application League of Legends

Application web Vue.js pour consulter les informations de League of Legends via l'API Riot Games.

## 🎯 Fonctionnalités

### Pages prévues

- **CHAMPION** : Liste et détails des champions
- **ITEM** : Catalogue des items avec prix et caractéristiques
- **RUNES** : Liste des runes et leurs caractéristiques
- **PRE BUILD** : Combinaisons de champion, items et runes avec filtres
- **ACCOUNT** : Recherche de joueurs avec statistiques et historique de parties

### Actuellement implémenté

✅ Liste complète des champions avec images et rôles  
✅ Recherche de joueurs par nom d'invocateur  
✅ Affichage du classement (Solo/Duo et Flex)  
✅ Service API complet pour champions, items, runes  
✅ Interface avec design League of Legends

## 🚀 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer la clé API Riot Games

1. Obtenez votre clé sur [Riot Games Developer Portal](https://developer.riotgames.com/)
2. Copiez le fichier `.env.example` vers `.env`
3. Remplacez `RGAPI-VOTRE-CLE-API-ICI` par votre vraie clé

```env
VITE_RIOT_API_KEY=RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 3. Lancer l'application

```bash
npm run dev
```

## 📚 Documentation

Pour un guide complet d'installation et d'utilisation de l'API, consultez le [Guide d'installation](file:///C:/Users/user/.gemini/antigravity/brain/c0323b18-e85d-437c-a158-55bdd499bf85/guide_installation_api.md).

## 🏗️ Structure du projet

```
Lolpage/
├── src/
│   ├── components/
│   │   ├── ChampionList.vue      # Liste des champions
│   │   └── SummonerSearch.vue    # Recherche de joueur
│   ├── services/
│   │   └── riotApi.js            # Service API Riot Games
│   └── App.vue                    # Composant principal
├── .env                           # Clé API (ne pas versionner)
└── .env.example                   # Exemple de configuration
```

## 🔧 Services disponibles

### RiotApiService

- Recherche de joueurs
- Informations de classement
- Historique des parties

### DataDragonService

- Données des champions
- Données des items
- Données des runes
- URLs des images

## 📝 Prochaines étapes

- [ ] Implémenter la page Items
- [ ] Implémenter la page Runes
- [ ] Créer le système de Pre Build
- [ ] Ajouter l'historique des parties
- [ ] Ajouter Vue Router pour la navigation

## ⚠️ Limitations

La clé de développement Riot Games a les limites suivantes :

- 20 requêtes par seconde
- 100 requêtes toutes les 2 minutes
- Expire après 24 heures

## 📄 Licence

Ce projet n'est pas approuvé par Riot Games et ne reflète pas les opinions ou les points de vue de Riot Games ou de toute personne officiellement impliquée dans la production ou la gestion de League of Legends.
