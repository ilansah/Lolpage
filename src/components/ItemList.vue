<script setup>
import { ref, computed, onMounted } from 'vue';
import { DataDragonService } from '../services/riotApi';
import SearchBar from './SearchBar.vue';

const items = ref([]);
const loading = ref(true);
const error = ref(null);
const searchQuery = ref('');

const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return items.value;
  return items.value.filter(item => 
    item.name.toLowerCase().includes(q)
  );
});

onMounted(async () => {
  try {
    items.value = await DataDragonService.getRankedShopItems();
    loading.value = false;
  } catch (err) {
    error.value = 'Erreur lors du chargement des items';
    loading.value = false;
    console.error(err);
  }
});
</script>

<template>
  <div class="item-list">
    <h2>Liste des Items</h2>
    
    <div v-if="loading" class="loading">Chargement...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else>
      <SearchBar
        v-model="searchQuery"
        placeholder="Rechercher un item…"
        :resultCount="filteredItems.length"
        resultLabel="item"
      />
      <p v-if="filteredItems.length === 0" class="no-result">Aucun item trouvé.</p>
      
      <div v-else class="items-grid">
        <router-link
          v-for="item in filteredItems"
          :key="item.id"
          :to="{ name: 'item-detail', params: { id: item.id } }"
          class="item-card"
        >
          <img :src="item.imageUrl" :alt="item.name" />
          <h3>{{ item.name }}</h3>
          <p class="price">{{ item.gold }} 💰</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-list {
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

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.item-card {
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

.item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(200, 155, 60, 0.3);
  border-color: #c89b3c;
}

.item-card img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: contain;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
}

.item-card h3 {
  color: #f0e6d2;
  font-size: 1.1rem;
  margin: 0.5rem 0 0.25rem 0;
  font-weight: 600;
}

.price {
  color: #f39c12;
  font-size: 0.9rem;
  font-weight: bold;
  margin: 0;
}
</style>
