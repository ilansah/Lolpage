<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

const players = ref([]);
const loading = ref(true);
const activeQueue = ref('RANKED_SOLO_5x5');
const activeRegion = ref('euw1');

const API_KEY = import.meta.env.VITE_RIOT_API_KEY;
const DDRAGON_URL = 'https://ddragon.leagueoflegends.com';

const queues = [
  { key: 'RANKED_SOLO_5x5', label: 'Solo / Duo' },
  { key: 'RANKED_FLEX_SR', label: 'Flex' },
];

const regions = [
  { key: 'euw1', label: 'EUW', routing: 'europe' },
  { key: 'na1', label: 'NA', routing: 'americas' },
  { key: 'kr', label: 'KR', routing: 'asia' },
  { key: 'eun1', label: 'EUNE', routing: 'europe' },
];

let cachedVersion = null;

async function getVersion() {
  if (cachedVersion) return cachedVersion;
  try {
    const res = await axios.get(`${DDRAGON_URL}/api/versions.json`);
    cachedVersion = res.data[0];
    return cachedVersion;
  } catch {
    return '14.1.1';
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// associe une région à la bonne URL de routage
function getRegionalRouting(platform) {
  const reg = regions.find(r => r.key === platform);
  return reg ? reg.routing : 'europe';
}

async function fetchLeaderboard() {
  loading.value = true;
  players.value = [];

  try {
    const chalRes = await axios.get(
      `https://${activeRegion.value}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/${activeQueue.value}`,
      { headers: { 'X-Riot-Token': API_KEY } }
    );

    const version = await getVersion();
    const defaultIcon = `${DDRAGON_URL}/cdn/${version}/img/profileicon/29.png`;

    const entries = chalRes.data.entries
      .sort((a, b) => b.leaguePoints - a.leaguePoints)
      .slice(0, 15);

    const enriched = [];
    const regionRouting = getRegionalRouting(activeRegion.value);

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      let displayName = 'Chargement...';
      let iconUrl = defaultIcon;
      const puuid = entry.puuid;

      try {
        const summonerRes = await axios.get(
          `https://${activeRegion.value}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
          { headers: { 'X-Riot-Token': API_KEY } }
        );
        iconUrl = `${DDRAGON_URL}/cdn/${version}/img/profileicon/${summonerRes.data.profileIconId}.png`;

        try {
          const accountRes = await axios.get(
            `https://${regionRouting}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${puuid}`,
            { headers: { 'X-Riot-Token': API_KEY } }
          );
          displayName = `${accountRes.data.gameName}#${accountRes.data.tagLine}`;
        } catch { 
           displayName = 'Joueur ' + (i + 1);
        }

      } catch { 
         displayName = 'Joueur ' + (i + 1);
      }

      enriched.push({
        rank: i + 1,
        displayName,
        leaguePoints: entry.leaguePoints,
        wins: entry.wins,
        losses: entry.losses,
        winRate: Math.round((entry.wins / (entry.wins + entry.losses)) * 100),
        hotStreak: entry.hotStreak,
        iconUrl,
        puuid,
      });

      players.value = [...enriched];

      // on attend un peu pour pas bloquer la clé api
      if (i < entries.length - 1) await sleep(300);
    }

  } catch (err) {
    players.value = [];
  } finally {
    loading.value = false;
  }
}

function switchQueue(queue) {
  activeQueue.value = queue;
}

function switchRegion(event) {
  activeRegion.value = event.target.value;
}

watch([activeQueue, activeRegion], () => {
  fetchLeaderboard();
});

onMounted(() => {
  fetchLeaderboard();
});

function goToProfile(player) {
  if (player.puuid) {
    router.push(`/profile/${activeRegion.value}/${player.puuid}`);
  }
}
</script>

<template>
  <div class="leaderboard-page">
    <div class="lb-header">
      <div>
        <h1 class="lb-title">Leaderboard</h1>
        <p class="lb-subtitle">Top 15 Challenger en temps réel</p>
      </div>

      <div class="filters">
        <select class="region-select" @change="switchRegion" :value="activeRegion">
          <option v-for="r in regions" :key="r.key" :value="r.key">{{ r.label }}</option>
        </select>

        <div class="queue-tabs">
          <button
            v-for="q in queues"
            :key="q.key"
            class="queue-tab"
            :class="{ active: activeQueue === q.key }"
            @click="switchQueue(q.key)"
          >
            {{ q.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="podium" v-if="players.length >= 3">
      <div class="podium-card podium-2" @click="goToProfile(players[1])">
        <div class="podium-rank">2</div>
        <img :src="players[1].iconUrl" :alt="players[1].displayName" class="podium-icon" />
        <div class="podium-name">{{ players[1].displayName }}</div>
        <div class="podium-lp">{{ players[1].leaguePoints.toLocaleString() }} LP</div>
        <div class="podium-wr">{{ players[1].winRate }}% WR</div>
      </div>
      <div class="podium-card podium-1" @click="goToProfile(players[0])">
        <div class="podium-top-label">Challenger</div>
        <img :src="players[0].iconUrl" :alt="players[0].displayName" class="podium-icon podium-icon-lg" />
        <div class="podium-name">{{ players[0].displayName }}</div>
        <div class="podium-lp gold">{{ players[0].leaguePoints.toLocaleString() }} LP</div>
        <div class="podium-wr">{{ players[0].winRate }}% WR</div>
        <div class="hot-streak-badge" v-if="players[0].hotStreak">Hot Streak</div>
      </div>
      <div class="podium-card podium-3" @click="goToProfile(players[2])">
        <div class="podium-rank">3</div>
        <img :src="players[2].iconUrl" :alt="players[2].displayName" class="podium-icon" />
        <div class="podium-name">{{ players[2].displayName }}</div>
        <div class="podium-lp">{{ players[2].leaguePoints.toLocaleString() }} LP</div>
        <div class="podium-wr">{{ players[2].winRate }}% WR</div>
      </div>
    </div>

    <div class="lb-table-wrap">
      <div class="lb-table">
        <div class="lb-table-header">
          <span>#</span>
          <span>Joueur</span>
          <span>LP</span>
          <span>Victoires</span>
          <span>Défaites</span>
          <span>Win Rate</span>
          <span>Statut</span>
        </div>

        <div
          v-for="player in players"
          :key="player.rank"
          class="lb-row"
          :class="{
            'top-1': player.rank === 1,
            'top-2': player.rank === 2,
            'top-3': player.rank === 3,
            'clickable': player.puuid
          }"
          @click="goToProfile(player)"
        >
          <div class="rank-cell">
            <span class="rank-num" :class="{ 'rank-gold': player.rank === 1, 'rank-silver': player.rank === 2, 'rank-bronze': player.rank === 3 }">
              {{ player.rank }}
            </span>
          </div>

          <div class="player-cell">
            <img :src="player.iconUrl" :alt="player.displayName" class="player-icon" />
            <div class="player-info">
              <span class="player-name">{{ player.displayName }}</span>
              <span class="player-tier">Challenger</span>
            </div>
          </div>

          <div class="lp-cell">
            <span class="lp-value">{{ player.leaguePoints.toLocaleString() }}</span>
            <span class="lp-label">LP</span>
          </div>

          <div class="stat-cell wins">{{ player.wins }}W</div>

          <div class="stat-cell losses">{{ player.losses }}L</div>

          <div class="wr-cell">
            <div class="wr-bar-bg">
              <div
                class="wr-bar"
                :style="{
                  width: player.winRate + '%',
                  background: player.winRate >= 60 ? '#2ecc71' : player.winRate >= 50 ? '#f39c12' : '#e74c3c'
                }"
              ></div>
            </div>
            <span
              class="wr-text"
              :class="{ 'wr-high': player.winRate >= 60, 'wr-mid': player.winRate >= 50 && player.winRate < 60, 'wr-low': player.winRate < 50 }"
            >
              {{ player.winRate }}%
            </span>
          </div>

          <div class="status-cell">
            <span class="hot-tag" v-if="player.hotStreak">Hot</span>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="lb-loading">
        <div class="spinner"></div>
        <p>Chargement des joueurs suivants...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.leaderboard-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.lb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.lb-title {
  font-size: 2rem;
  color: #c89b3c;
  margin: 0 0 0.3rem;
}

.lb-subtitle {
  color: #a09b8c;
  font-size: 0.9rem;
  margin: 0;
}

.filters {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.region-select {
  background: rgba(10, 20, 40, 0.8);
  border: 1px solid rgba(200, 155, 60, 0.4);
  color: #f0e6d2;
  padding: 0.55rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
  cursor: pointer;
}

.region-select:focus {
  border-color: #c89b3c;
}

.queue-tabs {
  display: flex;
  gap: 0.5rem;
}

.queue-tab {
  padding: 0.55rem 1.3rem;
  border: 1px solid rgba(200, 155, 60, 0.3);
  border-radius: 6px;
  background: transparent;
  color: #a09b8c;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.queue-tab:hover {
  border-color: #c89b3c;
  color: #f0e6d2;
}

.queue-tab.active {
  border-color: #c89b3c;
  color: #c89b3c;
  background: rgba(200, 155, 60, 0.1);
}

/* Loading */
.lb-loading {
  text-align: center;
  padding: 2rem 0;
  color: #a09b8c;
  font-size: 0.9rem;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(200, 155, 60, 0.15);
  border-top-color: #c89b3c;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Podium */
.podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.podium-card {
  text-align: center;
  padding: 1.5rem 1.2rem;
  border-radius: 12px;
  background: linear-gradient(160deg, #1e2328, #0a1428);
  border: 1px solid rgba(200, 155, 60, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
  min-width: 155px;
  cursor: pointer;
}

.podium-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4);
  border-color: rgba(200, 155, 60, 0.6);
}

.podium-1 {
  border-color: rgba(244, 200, 66, 0.5);
  transform: scale(1.07);
  z-index: 1;
}

.podium-1:hover { transform: scale(1.07) translateY(-4px); }

.podium-2 { border-color: rgba(149, 165, 166, 0.3); }
.podium-3 { border-color: rgba(230, 126, 34, 0.3); }

.podium-top-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #c89b3c;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.8rem;
}

.podium-rank {
  font-size: 1.3rem;
  font-weight: 700;
  color: #a09b8c;
  margin-bottom: 0.6rem;
}

.podium-icon {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  border: 2px solid #785a28;
  object-fit: cover;
  margin-bottom: 0.7rem;
}

.podium-icon-lg {
  width: 86px;
  height: 86px;
  border-color: #c89b3c;
}

.podium-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #f0e6d2;
  margin-bottom: 0.3rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}

.podium-lp { font-size: 0.85rem; color: #a09b8c; }
.podium-lp.gold { color: #c89b3c; font-weight: 700; }
.podium-wr { font-size: 0.78rem; color: #6b6b6b; margin-top: 0.2rem; }

.hot-streak-badge {
  margin-top: 0.6rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: #e67e22;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* Table */
.lb-table-wrap { position: relative; }

.lb-table {
  background: rgba(10, 20, 40, 0.4);
  border: 1px solid rgba(200, 155, 60, 0.12);
  border-radius: 12px;
  overflow: hidden;
}

.lb-table-header {
  display: grid;
  grid-template-columns: 55px 1fr 110px 90px 90px 140px 80px;
  padding: 0.8rem 1.2rem;
  background: rgba(200, 155, 60, 0.06);
  border-bottom: 1px solid rgba(200, 155, 60, 0.12);
  color: #785a28;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.lb-row {
  display: grid;
  grid-template-columns: 55px 1fr 110px 90px 90px 140px 80px;
  padding: 0.7rem 1.2rem;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  transition: background 0.15s;
}

.lb-row.clickable {
  cursor: pointer;
}

.lb-row:last-child { border-bottom: none; }
.lb-row.clickable:hover { background: rgba(200, 155, 60, 0.08); }

.lb-row.top-1 { background: rgba(244, 200, 66, 0.05); }
.lb-row.top-2 { background: rgba(149, 165, 166, 0.03); }
.lb-row.top-3 { background: rgba(230, 126, 34, 0.04); }

/* Rank */
.rank-cell { text-align: center; }
.rank-num { font-size: 0.9rem; font-weight: 700; color: #6b6b6b; }
.rank-gold   { color: #c89b3c; }
.rank-silver { color: #95a5a6; }
.rank-bronze { color: #e67e22; }

/* Player */
.player-cell { display: flex; align-items: center; gap: 0.75rem; }

.player-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(120, 90, 40, 0.5);
  object-fit: cover;
  flex-shrink: 0;
}

.player-info { display: flex; flex-direction: column; gap: 0.15rem; }
.player-name { font-size: 0.9rem; font-weight: 600; color: #f0e6d2; }

.player-tier {
  font-size: 0.65rem;
  font-weight: 700;
  color: #c89b3c;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* LP */
.lp-cell { display: flex; align-items: baseline; gap: 0.3rem; }
.lp-value { font-size: 0.95rem; font-weight: 700; color: #c89b3c; }
.lp-label { font-size: 0.7rem; color: #6b6b6b; }

/* Stats */
.stat-cell { font-size: 0.85rem; font-weight: 600; }
.wins   { color: #2ecc71; }
.losses { color: #e74c3c; }

/* Win Rate */
.wr-cell { display: flex; align-items: center; gap: 0.5rem; }

.wr-bar-bg {
  flex: 1;
  height: 5px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 3px;
  overflow: hidden;
}

.wr-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.wr-text { font-size: 0.8rem; font-weight: 700; min-width: 36px; text-align: right; }
.wr-high { color: #2ecc71; }
.wr-mid  { color: #f39c12; }
.wr-low  { color: #e74c3c; }

/* Status */
.status-cell { text-align: center; }

.hot-tag {
  font-size: 0.65rem;
  font-weight: 700;
  color: #e67e22;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid rgba(230, 126, 34, 0.3);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 768px) {
  .lb-table-header,
  .lb-row {
    grid-template-columns: 40px 1fr 90px 60px 60px;
  }

  .lb-table-header span:nth-child(6),
  .lb-table-header span:nth-child(7),
  .lb-row .wr-cell,
  .lb-row .status-cell { display: none; }

  .podium { flex-direction: column; align-items: center; }
  .podium-1 { transform: none; order: -1; }
  .lb-header { flex-direction: column; gap: 1rem; }
  .filters { width: 100%; justify-content: space-between; }
}
</style>
