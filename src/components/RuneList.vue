<script setup>
import { ref, computed, onMounted } from 'vue';
import { DataDragonService } from '../services/riotApi';
import SearchBar from './SearchBar.vue';

const runes = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');

const filteredRunes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return runes.value;
  return runes.value.filter(rune => 
    rune.name.toLowerCase().includes(q)
  );
});

onMounted(async () => {
  try {
    runes.value = await DataDragonService.getRankedRunes();
    loading.value = false;
  } catch (err) {
    error.value = 'Erreur lors du chargement des runes';
    loading.value = false;
    console.error(err);
  }
});
</script>

<template>
  <div class="rune-list">
    <h2>Voies de Runes</h2>
    
    <div v-if="loading" class="loading">Chargement...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else>
      <SearchBar
        v-model="searchQuery"
        placeholder="Rechercher une voie…"
        :resultCount="filteredRunes.length"
        resultLabel="voie"
      />
      <p v-if="filteredRunes.length === 0" class="no-result">Aucune rune trouvée.</p>
      
      <div v-else class="runes-grid">
        <router-link
          v-for="rune in filteredRunes"
          :key="rune.id"
          :to="{ name: 'rune-detail', params: { id: rune.id } }"
          class="rune-card"
        >
          <img :src="rune.imageUrl" :alt="rune.name" />
          <h3>{{ rune.name }}</h3>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rune-list {
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

.no-result {
  text-align: center;
  color: #a09b8c;
  font-size: 1rem;
  padding: 2rem;
}

.runes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  justify-items: center;
}

.rune-card {
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

.rune-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(200, 155, 60, 0.3);
  border-color: #c89b3c;
}

.rune-card img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
}

.rune-card h3 {
  color: #f0e6d2;
  font-size: 1.1rem;
  margin: 0.5rem 0 0;
  font-weight: 600;
}
</style>
