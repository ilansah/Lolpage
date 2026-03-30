<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();

const loading = ref(true);
const error = ref(null);
const profileData = ref(null);
const rankedData = ref([]);
const lastMatches = ref([]);
const expandedMatch = ref(null);
const versionCache = ref('14.1.1');

const API_KEY = import.meta.env.VITE_RIOT_API_KEY;
const DDRAGON_URL = 'https://ddragon.leagueoflegends.com';

const regions = {
  euw1: 'europe',
  eun1: 'europe',
  na1: 'americas',
  kr: 'asia',
  jp1: 'asia',
};

async function getVersion() {
  try {
    const res = await axios.get(`${DDRAGON_URL}/api/versions.json`);
    versionCache.value = res.data[0];
    return res.data[0];
  } catch {
    return '14.1.1';
  }
}

function toggleMatch(id) {
  if (expandedMatch.value === id) expandedMatch.value = null;
  else expandedMatch.value = id;
}

async function fetchProfile() {
  loading.value = true;
  error.value = null;

  const { region, puuid } = route.params;
  const routing = regions[region] || 'europe';

  try {
    const version = await getVersion();

    const accountRes = await axios.get(
      `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`,
      { headers: { 'X-Riot-Token': API_KEY } }
    );
    const riotId = `${accountRes.data.gameName}#${accountRes.data.tagLine}`;

    const summonerRes = await axios.get(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: { 'X-Riot-Token': API_KEY } }
    );
    
    const rankedRes = await axios.get(
      `https://${region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
      { headers: { 'X-Riot-Token': API_KEY } }
    );

    profileData.value = {
      riotId,
      summonerLevel: summonerRes.data.summonerLevel,
      iconUrl: `${DDRAGON_URL}/cdn/${version}/img/profileicon/${summonerRes.data.profileIconId}.png`,
    };

    rankedData.value = rankedRes.data;

    try {
      const matchIdsRes = await axios.get(
        `https://${routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10`,
        { headers: { 'X-Riot-Token': API_KEY } }
      );
      
      if (matchIdsRes.data && matchIdsRes.data.length > 0) {
        const matchPromises = matchIdsRes.data.map(id => 
          axios.get(`https://${routing}.api.riotgames.com/lol/match/v5/matches/${id}`, { headers: { 'X-Riot-Token': API_KEY } })
        );
        
        const matchResponses = await Promise.allSettled(matchPromises);
        
        lastMatches.value = matchResponses
          .filter(res => res.status === 'fulfilled')
          .map(res => {
            const match = res.value.data;
            const me = match.info.participants.find(p => p.puuid === puuid);
            
            return {
              id: match.metadata.matchId,
              win: me.win,
              championName: me.championName,
              kills: me.kills,
              deaths: me.deaths,
              assists: me.assists,
              kda: ((me.kills + me.assists) / Math.max(1, me.deaths)).toFixed(2),
              duration: Math.floor(match.info.gameDuration / 60),
              gameMode: match.info.gameMode,
              championUrl: `${DDRAGON_URL}/cdn/${version}/img/champion/${me.championName}.png`,
              items: [me.item0, me.item1, me.item2, me.item3, me.item4, me.item5, me.item6],
              cs: me.totalMinionsKilled + me.neutralMinionsKilled,
              participants: match.info.participants.map(p => ({
                puuid: p.puuid,
                riotId: p.riotIdGameName ? `${p.riotIdGameName}#${p.riotIdTagline}` : p.summonerName || p.championName,
                championName: p.championName,
                teamId: p.teamId,
                championUrl: `${DDRAGON_URL}/cdn/${version}/img/champion/${p.championName}.png`
              }))
            };
          });
      }
    } catch (e) {
      // pas de parties trouvees
    }

  } catch (err) {
    // erreur globale
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (route.params.puuid) {
    fetchProfile();
  } else {
    error.value = "Joueur non trouvé";
    loading.value = false;
  }
});

function getRankColor(tier) {
  const t = tier?.toUpperCase() || '';
  if (t === 'CHALLENGER') return '#f4c842';
  if (t === 'GRANDMASTER') return '#e74c3c';
  if (t === 'MASTER') return '#9b59b6';
  if (t === 'DIAMOND') return '#3498db';
  if (t === 'EMERALD') return '#2ecc71';
  if (t === 'PLATINUM') return '#1abc9c';
  if (t === 'GOLD') return '#f1c40f';
  if (t === 'SILVER') return '#bdc3c7';
  if (t === 'BRONZE') return '#d35400';
  if (t === 'IRON') return '#7f8c8d';
  return '#a09b8c'; // Unranked
}
</script>

<template>
  <div class="profile-page">
    <div class="back-btn-wrap">
      <router-link to="/leaderboard" class="back-btn">← Retour au Leaderboard</router-link>
    </div>

    <div v-if="loading" class="profile-loading">
      <div class="spinner"></div>
      <p>Recherche du joueur...</p>
    </div>

    <div v-else-if="profileData" class="profile-content">
      <div class="profile-header">
        <div class="icon-wrap">
          <img :src="profileData.iconUrl" alt="Profile Icon" class="profile-icon" />
          <div class="level-badge">{{ profileData.summonerLevel }}</div>
        </div>
        <div class="profile-info">
          <h1 class="riot-id">{{ profileData.riotId }}</h1>
          <p class="region-info">Région : <strong>{{ route.params.region.toUpperCase() }}</strong></p>
        </div>
      </div>

      <div class="ranked-section">
        <h2 class="section-title">Classement Actuel</h2>

        <div v-if="rankedData.length === 0" class="unranked-msg">
          Ce joueur n'est pas classé cette saison.
        </div>

        <div class="ranked-cards">
          <div v-for="queue in rankedData" :key="queue.queueType" class="ranked-card">
            <div class="queue-type">
              {{ queue.queueType === 'RANKED_SOLO_5x5' ? 'Classé Solo/Duo' : 'Classé Flex' }}
            </div>
            
            <div class="rank-info">
              <div class="tier-badge" :style="{ borderColor: getRankColor(queue.tier), color: getRankColor(queue.tier) }">
                {{ queue.tier }} {{ queue.rank }}
              </div>
              <div class="lp-info">{{ queue.leaguePoints }} LP</div>
            </div>

            <div class="winrate-info">
              <div class="stats">
                <span class="wins">{{ queue.wins }} V</span>
                <span class="divider">-</span>
                <span class="losses">{{ queue.losses }} D</span>
              </div>
              <div class="wr-bar-bg">
                <div 
                  class="wr-bar" 
                  :style="{ 
                    width: Math.round(queue.wins / (queue.wins + queue.losses) * 100) + '%',
                    backgroundColor: Math.round(queue.wins / (queue.wins + queue.losses) * 100) >= 50 ? '#2ecc71' : '#e74c3c'
                  }"
                ></div>
              </div>
              <div class="wr-text">
                Win Rate: {{ Math.round(queue.wins / (queue.wins + queue.losses) * 100) }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="lastMatches.length > 0" class="last-match-section">
        <h2 class="section-title">10 Dernières Parties</h2>
        
        <div class="matches-list">
          <div v-for="match in lastMatches" :key="match.id" class="match-item">
            <div class="match-card" :class="match.win ? 'match-win' : 'match-loss'" @click="toggleMatch(match.id)">
              <img :src="match.championUrl" :alt="match.championName" class="match-champ-icon" />
              <div class="match-details">
                <h3 class="match-result">{{ match.win ? 'Victoire' : 'Défaite' }} <span class="mode-tag">{{ match.gameMode }}</span></h3>
                <p class="match-kda">{{ match.kills }} / {{ match.deaths }} / {{ match.assists }} <span class="kda-ratio">({{ match.kda }} KDA)</span></p>
              </div>
              
              <div class="match-meta">
                <p>{{ match.duration }} min</p>
                <p class="match-cs">{{ match.cs }} CS</p>
              </div>
              <div class="expand-icon">{{ expandedMatch === match.id ? '▲' : '▼' }}</div>
            </div>

            <div v-if="expandedMatch === match.id" class="match-expanded">
              <div class="items-row">
                <span class="items-label">Équipement :</span>
                <div class="items-list">
                  <div v-for="(itemId, idx) in match.items" :key="idx" class="item-slot">
                    <img v-if="itemId !== 0" :src="`${DDRAGON_URL}/cdn/${versionCache}/img/item/${itemId}.png`" alt="Item" />
                  </div>
                </div>
              </div>

              <div class="teams-container">
                <div class="team team-blue">
                  <h4 class="team-title">Équipe Bleue</h4>
                  <div class="team-players">
                    <div v-for="p in match.participants.filter(x => x.teamId === 100)" :key="p.puuid" class="player-row">
                      <img :src="p.championUrl" class="mini-champ" />
                      <span class="player-name" :class="{'me': p.puuid === route.params.puuid}">{{ p.riotId }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="team team-red">
                  <h4 class="team-title">Équipe Rouge</h4>
                  <div class="team-players">
                    <div v-for="p in match.participants.filter(x => x.teamId === 200)" :key="p.puuid" class="player-row">
                      <img :src="p.championUrl" class="mini-champ" />
                      <span class="player-name" :class="{'me': p.puuid === route.params.puuid}">{{ p.riotId }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="profile-empty">
      <h2 style="color: #a09b8c;">Profil indisponible</h2>
      <p style="color: #6b6b6b; font-size: 0.9rem;">Impossible de charger les données pour ce joueur.</p>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.back-btn-wrap {
  margin-bottom: 2rem;
}

.back-btn {
  color: #c89b3c;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid rgba(200, 155, 60, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: rgba(200, 155, 60, 0.1);
  border-color: #c89b3c;
}

.profile-loading {
  text-align: center;
  padding: 5rem 0;
  color: #a09b8c;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(200, 155, 60, 0.15);
  border-top-color: #c89b3c;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

.profile-empty {
  text-align: center;
  padding: 4rem;
  background: rgba(10, 20, 40, 0.4);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  background: rgba(10, 20, 40, 0.6);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid rgba(200, 155, 60, 0.2);
  margin-bottom: 2rem;
}

.icon-wrap {
  position: relative;
}

.profile-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid #785a28;
}

.level-badge {
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  background: #0a1428;
  color: #f0e6d2;
  font-size: 0.8rem;
  font-weight: bold;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  border: 1px solid #785a28;
}

.profile-info {
  flex: 1;
}

.riot-id {
  font-size: 2rem;
  color: #f0e6d2;
  margin: 0 0 0.5rem;
}

.region-info {
  color: #a09b8c;
  margin: 0;
  font-size: 0.9rem;
}

.section-title {
  color: #c89b3c;
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(200, 155, 60, 0.2);
  padding-bottom: 0.5rem;
}

.unranked-msg {
  color: #a09b8c;
  font-style: italic;
  padding: 1rem 0;
}

.ranked-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.ranked-card {
  background: rgba(10, 20, 40, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.2s;
}

.ranked-card:hover {
  transform: translateY(-2px);
  border-color: rgba(200, 155, 60, 0.3);
}

.queue-type {
  font-size: 0.85rem;
  color: #a09b8c;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.rank-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.tier-badge {
  font-size: 1.2rem;
  font-weight: bold;
  padding: 0.3rem 0.8rem;
  border: 1px solid;
  border-radius: 6px;
  background: rgba(0,0,0,0.2);
}

.lp-info {
  font-size: 1.2rem;
  color: #f0e6d2;
  font-weight: 600;
}

.winrate-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stats {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.wins { color: #2ecc71; }
.losses { color: #e74c3c; }
.divider { color: #6b6b6b; }

.wr-bar-bg {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.wr-bar {
  height: 100%;
}

.wr-text {
  text-align: center;
  font-size: 0.8rem;
  color: #a09b8c;
}

/* Match History */
.last-match-section {
  margin-top: 2rem;
}

.matches-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.match-item {
  display: flex;
  flex-direction: column;
}

.match-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  background: rgba(10, 20, 40, 0.4);
  border-left: 5px solid;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s;
}

.match-card:hover {
  background: rgba(200, 155, 60, 0.1);
}

.match-win {
  border-left-color: #2ecc71;
  background: linear-gradient(90deg, rgba(46, 204, 113, 0.05) 0%, rgba(10, 20, 40, 0.4) 100%);
}

.match-loss {
  border-left-color: #e74c3c;
  background: linear-gradient(90deg, rgba(231, 76, 60, 0.05) 0%, rgba(10, 20, 40, 0.4) 100%);
}

.match-champ-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid rgba(200, 155, 60, 0.5);
  object-fit: cover;
}

.match-details {
  flex: 1;
}

.match-result {
  margin: 0 0 0.3rem 0;
  font-size: 1.1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.mode-tag {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  background: rgba(0,0,0,0.3);
  color: #a09b8c;
  font-weight: normal;
}

.match-win .match-result { color: #2ecc71; }
.match-loss .match-result { color: #e74c3c; }

.match-kda {
  margin: 0;
  font-size: 1.05rem;
  font-weight: bold;
  color: #f0e6d2;
}

.kda-ratio {
  font-size: 0.85rem;
  color: #a09b8c;
  font-weight: normal;
}

.match-meta {
  text-align: right;
  color: #a09b8c;
  font-weight: 500;
  font-size: 0.9rem;
}

.match-cs {
  font-size: 0.85rem;
  margin-top: 0.2rem;
  color: #785a28;
}

.expand-icon {
  color: #6b6b6b;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

/* Expanded section */
.match-expanded {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-top: none;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  padding: 1.5rem;
  margin-top: -4px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.items-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  padding: 0.8rem;
  border-radius: 6px;
}

.items-label {
  color: #a09b8c;
  font-size: 0.9rem;
  font-weight: 600;
}

.items-list {
  display: flex;
  gap: 0.4rem;
}

.item-slot {
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  border: 1px solid rgba(200, 155, 60, 0.2);
  overflow: hidden;
}

.item-slot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.teams-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.team-title {
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.team-blue .team-title { color: #3498db; }
.team-red .team-title { color: #e74c3c; }

.team-players {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.mini-champ {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.player-name {
  font-size: 0.85rem;
  color: #a09b8c;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.player-name.me {
  color: #c89b3c;
  font-weight: bold;
}

@media (max-width: 768px) {
  .teams-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
}
</style>
