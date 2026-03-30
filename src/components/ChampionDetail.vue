<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { DataDragonService } from '../services/riotApi';

const route = useRoute();
const router = useRouter();

const champion = ref(null);
const version  = ref('');
const loading  = ref(true);
const error    = ref(null);

const tagColors = {
  Assassin: '#e74c3c',
  Fighter:  '#e67e22',
  Mage:     '#3498db',
  Marksman: '#f39c12',
  Support:  '#2ecc71',
  Tank:     '#95a5a6',
};

function tagColor(tag) {
  return tagColors[tag] || '#785a28';
}

onMounted(async () => {
  try {
    version.value = await DataDragonService.getLatestVersion();
    const data    = await DataDragonService.getChampionDetails(route.params.id, version.value);
    champion.value = data.data[route.params.id];
  } catch (err) {
    error.value = 'Impossible de charger le champion.';
    console.error(err);
  } finally {
    loading.value = false;
  }
});

function splashUrl() {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champion.value.id}_0.jpg`;
}

function spellUrl(spell) {
  const v = version.value || '15.6.1';
  return `https://ddragon.leagueoflegends.com/cdn/${v}/img/spell/${spell.image.full}`;
}

function passiveUrl() {
  return `https://ddragon.leagueoflegends.com/cdn/${version.value}/img/passive/${champion.value.passive.image.full}`;
}

const keyLabels = ['P', 'Q', 'W', 'E', 'R'];
</script>

<template>
  <div class="detail-page">

    <button class="back-btn" @click="router.back()">← Retour</button>

    <div v-if="loading" class="state">Chargement…</div>
    <div v-else-if="error" class="state error">{{ error }}</div>

    <template v-else-if="champion">
      <!-- Splash -->
      <div class="splash-wrap">
        <img class="splash" :src="splashUrl()" :alt="champion.name" />
        <div class="splash-overlay" />
        <div class="hero-info">
          <h1>{{ champion.name }}</h1>
          <p class="subtitle">{{ champion.title }}</p>
          <div class="tags">
            <span
              v-for="tag in champion.tags"
              :key="tag"
              class="tag"
              :style="{ background: tagColor(tag) }"
            >{{ tag }}</span>
          </div>
        </div>
      </div>

      <div class="content">

        <!-- Lore -->
        <section class="section">
          <h2>Lore</h2>
          <p class="lore">{{ champion.lore }}</p>
        </section>

        <!-- Stats -->
        <section class="section">
          <h2>Statistiques de base</h2>
          <div class="stats-grid">
            <div class="stat" v-for="(val, key) in {
              'PV':       champion.stats.hp,
              'PV / niv':champion.stats.hpperlevel,
              'Armure':   champion.stats.armor,
              'Magie':    champion.stats.spellblock,
              'Att. / s': champion.stats.attackspeed.toFixed(2),
              'Dégâts':   champion.stats.attackdamage,
              'Portée':   champion.stats.attackrange,
              'Vitesse':  champion.stats.movespeed
            }" :key="key">
              <span class="stat-label">{{ key }}</span>
              <span class="stat-value">{{ val }}</span>
            </div>
          </div>
        </section>

        <!-- Spells -->
        <section class="section">
          <h2>Sorts</h2>
          <div class="spells">
            <!-- Passive -->
            <div class="spell-row">
              <div class="spell-icon-wrap">
                <img :src="passiveUrl()" :alt="champion.passive.name" />
                <span class="key-label">P</span>
              </div>
              <div class="spell-info">
                <strong>{{ champion.passive.name }}</strong>
                <p>{{ champion.passive.description }}</p>
              </div>
            </div>
            <!-- Active spells -->
            <div
              v-for="(spell, i) in champion.spells"
              :key="spell.id"
              class="spell-row"
            >
              <div class="spell-icon-wrap">
                <img :src="spellUrl(spell)" :alt="spell.name" />
                <span class="key-label">{{ keyLabels[i + 1] }}</span>
              </div>
              <div class="spell-info">
                <strong>{{ spell.name }}</strong>
                <p>{{ spell.description }}</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </template>

  </div>
</template>

<style scoped>
/* ── Layout ── */
.detail-page {
  min-height: 100vh;
  color: #f0e6d2;
}

/* ── Back button ── */
.back-btn {
  position: fixed;
  top: 3.5rem;
  left: 1.25rem;
  z-index: 10;
  background: rgba(10, 20, 40, 0.75);
  border: 1px solid #785a28;
  color: #c89b3c;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  backdrop-filter: blur(6px);
  transition: background 0.2s;
}
.back-btn:hover { background: rgba(200,155,60,0.15); }

/* ── Splash ── */
.splash-wrap {
  position: relative;
  height: 55vh;
  overflow: hidden;
}
.splash {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
}
.splash-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(10,20,40,0.2) 0%, rgba(10,20,40,0.95) 100%);
}
.hero-info {
  position: absolute;
  bottom: 2rem;
  left: 2rem;
}
.hero-info h1 {
  font-size: 2.8rem;
  font-weight: 700;
  color: #f0e6d2;
  margin: 0;
  text-shadow: 0 2px 12px rgba(0,0,0,0.7);
}
.hero-info .subtitle {
  font-style: italic;
  color: #a09b8c;
  font-size: 1.1rem;
  margin: 0.25rem 0 0.6rem;
}
.tags { display: flex; gap: 0.5rem; }
.tag {
  padding: 0.2rem 0.7rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
}

/* ── Content ── */
.content {
  max-width: 820px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* ── Section ── */
.section h2 {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #c89b3c;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(200,155,60,0.25);
  padding-bottom: 0.4rem;
}

/* ── Lore ── */
.lore {
  color: #a09b8c;
  line-height: 1.7;
  font-size: 0.95rem;
}

/* ── Stats ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.75rem;
}
.stat {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(200,155,60,0.15);
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.stat-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #a09b8c;
}
.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #f0e6d2;
}

/* ── Spells ── */
.spells { display: flex; flex-direction: column; gap: 1.2rem; }

.spell-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.spell-icon-wrap {
  position: relative;
  flex-shrink: 0;
}
.spell-icon-wrap img {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  border: 2px solid rgba(200,155,60,0.3);
  object-fit: cover;
  display: block;
}
.key-label {
  position: absolute;
  bottom: -6px;
  right: -6px;
  background: #c89b3c;
  color: #0a1428;
  font-size: 0.65rem;
  font-weight: 800;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.spell-info strong {
  font-size: 0.95rem;
  color: #f0e6d2;
}
.spell-info p {
  font-size: 0.82rem;
  color: #a09b8c;
  margin-top: 0.25rem;
  line-height: 1.55;
}

/* ── States ── */
.state {
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
}
.state.error { color: #e74c3c; }
</style>
