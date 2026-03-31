<script setup>
import { store, toggleFavChampion, toggleFavItem } from '../store/favoris';
</script>

<template>
  <div class="favorites-page">
    <h2>Mes Favoris</h2>
    
    <div class="section">
      <h3>Champions</h3>
      <p v-if="store.champions.length === 0" class="empty">Aucun champion en favori.</p>
      <div v-else class="grid">
        <router-link
          v-for="champion in store.champions"
          :key="champion.id"
          :to="{ name: 'champion-detail', params: { id: champion.id } }"
          class="card"
        >
          <button class="remove-btn" @click.prevent="toggleFavChampion(champion)">&times;</button>
          <img :src="champion.imageUrl" :alt="champion.name" />
          <h4>{{ champion.name }}</h4>
        </router-link>
      </div>
    </div>

    <div class="section">
      <h3>Items</h3>
      <p v-if="store.items.length === 0" class="empty">Aucun item en favori.</p>
      <div v-else class="grid">
        <router-link
          v-for="item in store.items"
          :key="item.id"
          :to="{ name: 'item-detail', params: { id: item.id } }"
          class="card"
        >
          <button class="remove-btn" @click.prevent="toggleFavItem(item)">&times;</button>
          <img :src="item.imageUrl" :alt="item.name" />
          <h4>{{ item.name }}</h4>
          <p class="price" v-if="item.gold">{{ item.gold }} PO</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.favorites-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  text-align: center;
  color: #c89b3c;
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

.section {
  margin-bottom: 3rem;
}

h3 {
  color: #f0e6d2;
  font-size: 1.8rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid #785a28;
  padding-bottom: 0.5rem;
}

.empty {
  color: #a09b8c;
  font-style: italic;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

.card {
  position: relative;
  display: block;
  text-decoration: none;
  background: linear-gradient(135deg, #1e2328 0%, #0a1428 100%);
  border: 2px solid #785a28;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  color: #f0e6d2;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(200, 155, 60, 0.3);
  border-color: #c89b3c;
}

.card img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.card h4 {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.price {
  color: #f39c12;
  font-size: 0.9rem;
  font-weight: bold;
}

.remove-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(231, 76, 60, 0.8);
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  width: 24px;
  height: 24px;
  font-size: 1.2rem;
  font-weight: bold;
  z-index: 10;
  transition: transform 0.2s, background 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.remove-btn:hover {
  transform: scale(1.1);
  background: rgba(231, 76, 60, 1);
}
</style>
