<script setup>
import { ref, computed, onMounted } from 'vue';
import { DataDragonService } from '../services/riotApi';
import { toggleFavChampion, isFavChampion } from '../store/favoris';

const champions = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');

const filteredChampions = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return champions.value;
  return champions.value.filter(c => c.name.toLowerCase().includes(q));
});

onMounted(async () => {
  try {
    const data = await DataDragonService.getAllChampions();
    const version = await DataDragonService.getLatestVersion();
    
    champions.value = Object.values(data.data).map(champion => ({
      ...champion,
      imageUrl: DataDragonService.getChampionImageUrl(champion.id, version)
    }));
    
    loading.value = false;
  } catch (err) {
    error.value = 'Erreur lors du chargement des champions';
    loading.value = false;
    console.error(err);
  }
});

const getChampionColor = (tags) => {
  const primaryTag = tags[0];
  const colors = {
    'Assassin': '#e74c3c',
    'Fighter': '#e67e22',
    'Mage': '#3498db',
    'Marksman': '#f39c12',
    'Support': '#2ecc71',
    'Tank': '#95a5a6'
  };
  return colors[primaryTag] || '#785a28';
};
</script>

<template>
  <div class="champion-list">
    <h2>Liste des Champions</h2>
    
    <div v-if="loading" class="loading">Chargement...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else>
      <div class="search-wrap">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un champion…"
          class="search-input"
        />
        <span class="search-count">{{ filteredChampions.length }} champion{{ filteredChampions.length > 1 ? 's' : '' }}</span>
      </div>
      <p v-if="filteredChampions.length === 0" class="no-result">Aucun champion trouvé.</p>
    <div class="champions-grid">
      <router-link
        v-for="champion in filteredChampions"
        :key="champion.id"
        :to="{ name: 'champion-detail', params: { id: champion.id } }"
        class="champion-card"
        :style="{ borderColor: getChampionColor(champion.tags) }"
      >
        <button class="fav-btn" @click.prevent="toggleFavChampion(champion)" title="Favoris">
          <span v-if="isFavChampion(champion.id)">★</span>
          <span v-else>☆</span>
        </button>
        <img :src="champion.imageUrl" :alt="champion.name" />
        <h3>{{ champion.name }}</h3>
        <p class="title">{{ champion.title }}</p>
        <div class="tags">
          <span
            v-for="tag in champion.tags"
            :key="tag"
            class="tag"
            :style="{ backgroundColor: getChampionColor([tag]) }"
          >
            {{ tag }}
          </span>
        </div>
      </router-link>
    </div>
    </div>
  </div>
</template>

<style scoped>
.champion-list {
  padding: 2rem;
}

h2 {
  text-align: center;
  color: #c89b3c;
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

.loading, .error {
  text-align: center;
  font-size: 1.5rem;
  padding: 2rem;
}

.error {
  color: #e74c3c;
}

.search-wrap {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(200, 155, 60, 0.4);
  border-radius: 8px;
  padding: 0.6rem 1rem;
  color: #f0e6d2;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input::placeholder {
  color: #a09b8c;
}

.search-input:focus {
  border-color: #c89b3c;
  box-shadow: 0 0 0 2px rgba(200, 155, 60, 0.15);
}

.search-count {
  color: #a09b8c;
  font-size: 0.85rem;
  white-space: nowrap;
}

.no-result {
  text-align: center;
  color: #a09b8c;
  padding: 2rem;
}

.champions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.champion-card {
  position: relative;
  display: block;
  text-decoration: none;
  color: inherit;
  background: linear-gradient(135deg, #1e2328 0%, #0a1428 100%);
  border: 3px solid #785a28;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.fav-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  color: #c89b3c;
  cursor: pointer;
  padding: 5px;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 0.2s, color 0.2s;
}

.fav-btn:hover {
  transform: scale(1.1);
  color: #f0e6d2;
}

.champion-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(200, 155, 60, 0.3);
  border-color: #c89b3c;
}

.champion-card img {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.champion-card h3 {
  color: #f0e6d2;
  font-size: 1.2rem;
  margin: 0.5rem 0;
}

.champion-card .title {
  color: #a09b8c;
  font-size: 0.9rem;
  font-style: italic;
  margin: 0.25rem 0;
}

.tags {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.5rem;
}

.tag {
  color: #f0e6d2;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}
</style>
