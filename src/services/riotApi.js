import axios from 'axios';

// Configuration de l'API Riot Games
const API_KEY = import.meta.env.VITE_RIOT_API_KEY;
const BASE_URL = 'https://euw1.api.riotgames.com'; // Serveur Europe West
const DDRAGON_URL = 'https://ddragon.leagueoflegends.com'; // Pour les assets (images, données statiques)

// Instance Axios configurée
const riotApi = axios.create({
  headers: {
    'X-Riot-Token': API_KEY
  }
});

/**
 * Service pour interagir avec l'API Riot Games
 */
export const RiotApiService = {
  /**
   * Récupère les informations d'un invocateur par son nom
   * @param {string} summonerName - Nom de l'invocateur
   * @returns {Promise} Données de l'invocateur
   */
  async getSummonerByName(summonerName) {
    try {
      const response = await riotApi.get(
        `${BASE_URL}/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'invocateur:', error);
      throw error;
    }
  },

  /**
   * Récupère les informations d'un invocateur par son PUUID
   * @param {string} puuid - PUUID de l'invocateur
   * @returns {Promise} Données de l'invocateur
   */
  async getSummonerByPuuid(puuid) {
    try {
      const response = await riotApi.get(
        `${BASE_URL}/lol/summoner/v4/summoners/by-puuid/${puuid}`
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'invocateur:', error);
      throw error;
    }
  },

  /**
   * Récupère les informations de classement d'un invocateur
   * @param {string} summonerId - ID de l'invocateur
   * @returns {Promise} Données de classement
   */
  async getRankedInfo(summonerId) {
    try {
      const response = await riotApi.get(
        `${BASE_URL}/lol/league/v4/entries/by-summoner/${summonerId}`
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du classement:', error);
      throw error;
    }
  },

  /**
   * Récupère l'historique des parties d'un joueur
   * @param {string} puuid - PUUID de l'invocateur
   * @param {number} count - Nombre de parties à récupérer (max 100)
   * @returns {Promise} Liste des IDs de parties
   */
  async getMatchHistory(puuid, count = 20) {
    try {
      const response = await riotApi.get(
        `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'une partie
   * @param {string} matchId - ID de la partie
   * @returns {Promise} Détails de la partie
   */
  async getMatchDetails(matchId) {
    try {
      const response = await riotApi.get(
        `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}`
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de la partie:', error);
      throw error;
    }
  }
};

/**
 * Service pour Data Dragon (données statiques)
 */
export const DataDragonService = {
  /**
   * Récupère la dernière version de Data Dragon
   * @returns {Promise<string>} Version actuelle
   */
  async getLatestVersion() {
    try {
      const response = await axios.get(`${DDRAGON_URL}/api/versions.json`);
      return response.data[0]; // La première version est la plus récente
    } catch (error) {
      console.error('Erreur lors de la récupération de la version:', error);
      throw error;
    }
  },

  /**
   * Récupère tous les champions
   * @param {string} version - Version de Data Dragon
   * @param {string} language - Langue (fr_FR, en_US, etc.)
   * @returns {Promise} Données des champions
   */
  async getAllChampions(version = null, language = 'fr_FR') {
    try {
      if (!version) {
        version = await this.getLatestVersion();
      }
      const response = await axios.get(
        `${DDRAGON_URL}/cdn/${version}/data/${language}/champion.json`
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des champions:', error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'un champion spécifique
   * @param {string} championName - Nom du champion
   * @param {string} version - Version de Data Dragon
   * @param {string} language - Langue
   * @returns {Promise} Détails du champion
   */
  async getChampionDetails(championName, version = null, language = 'fr_FR') {
    try {
      if (!version) {
        version = await this.getLatestVersion();
      }
      const response = await axios.get(
        `${DDRAGON_URL}/cdn/${version}/data/${language}/champion/${championName}.json`
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du champion:', error);
      throw error;
    }
  },

  /**
   * Récupère tous les items
   * @param {string} version - Version de Data Dragon
   * @param {string} language - Langue
   * @returns {Promise} Données des items
   */
  async getAllItems(version = null, language = 'fr_FR') {
    try {
      if (!version) {
        version = await this.getLatestVersion();
      }
      const response = await axios.get(
        `${DDRAGON_URL}/cdn/${version}/data/${language}/item.json`
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des items:', error);
      throw error;
    }
  },

  /**
   * Récupère toutes les runes
   * @param {string} version - Version de Data Dragon
   * @param {string} language - Langue
   * @returns {Promise} Données des runes
   */
  async getAllRunes(version = null, language = 'fr_FR') {
    try {
      if (!version) {
        version = await this.getLatestVersion();
      }
      const response = await axios.get(
        `${DDRAGON_URL}/cdn/${version}/data/${language}/runesReforged.json`
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des runes:', error);
      throw error;
    }
  },

  /**
   * Génère l'URL d'une image de champion
   * @param {string} championName - Nom du champion
   * @param {string} version - Version de Data Dragon
   * @returns {string} URL de l'image
   */
  getChampionImageUrl(championName, version = null) {
    const v = version || '14.1.1'; // Version par défaut
    return `${DDRAGON_URL}/cdn/${v}/img/champion/${championName}.png`;
  },

  /**
   * Génère l'URL d'une image de sort
   * @param {string} spellName - Nom du sort
   * @param {string} version - Version de Data Dragon
   * @returns {string} URL de l'image
   */
  getSpellImageUrl(spellName, version = null) {
    const v = version || '14.1.1';
    return `${DDRAGON_URL}/cdn/${v}/img/spell/${spellName}.png`;
  },

  /**
   * Génère l'URL d'une image d'item
   * @param {string} itemId - ID de l'item
   * @param {string} version - Version de Data Dragon
   * @returns {string} URL de l'image
   */
  getItemImageUrl(itemId, version = null) {
    const v = version || '14.1.1';
    return `${DDRAGON_URL}/cdn/${v}/img/item/${itemId}.png`;
  },

  /**
   * Récupère tous les items du shop ranked
   * @param {string} version - Version de Data Dragon
   * @param {string} language - Langue
   * @returns {Promise} Données des items du shop ranked
   */
  async getRankedShopItems(version = null, language = 'fr_FR') {
    try {
      if (!version) {
        version = await this.getLatestVersion();
      }
      const response = await axios.get(
        `${DDRAGON_URL}/cdn/${version}/data/${language}/item.json`
      );
      
      // Filtre les items pour ne garder que ceux du shop ranked
      const allItems = Object.entries(response.data.data)
        .filter(([_, item]) => item.inStore !== false && item.maps && item.maps["11"] === true)
        .map(([id, item]) => ({
          id,
          name: item.name,
          gold: item.gold?.total || 0,
          imageUrl: this.getItemImageUrl(id, version)
        }));
      
      // Déduplique par nom en gardant le plus ancien (ID le plus faible)
      const seen = new Set();
      return allItems
        .filter(item => {
          if (seen.has(item.name)) {
            return false;
          }
          seen.add(item.name);
          return true;
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Erreur lors de la récupération des items du shop ranked:', error);
      throw error;
    }
  },

  /**
   * Génère l'URL d'une image de rune
   * @param {string} runePath - Chemin de la rune
   * @returns {string} URL de l'image
   */
  getRuneImageUrl(runePath) {
    return `${DDRAGON_URL}/cdn/img/${runePath}`;
  },

  /**
   * Récupère les runes principales de la saison 15
   * @param {string} version - Version de Data Dragon
   * @param {string} language - Langue
   * @returns {Promise} Données des runes principales
   */
  async getRankedRunes(version = null, language = 'fr_FR') {
    try {
      if (!version) {
        version = await this.getLatestVersion();
      }
      const response = await axios.get(
        `${DDRAGON_URL}/cdn/${version}/data/${language}/runesReforged.json`
      );
      
      // Récupère les arbres de runes principales (paths)
      const runes = response.data.map(tree => ({
        id: tree.id,
        name: tree.name,
        key: tree.key,
        icon: tree.icon,
        imageUrl: this.getRuneImageUrl(tree.icon),
        slots: tree.slots || []
      }));
      
      return runes;
    } catch (error) {
      console.error('Erreur lors de la récupération des runes:', error);
      throw error;
    }
  }
};

export default { RiotApiService, DataDragonService };
