<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { DataDragonService } from '../services/riotApi';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const item = ref(null);
const version = ref('');
const loading = ref(true);
const error = ref(null);
const sourceItems = ref([]);
const builtIntoItems = ref([]);

onMounted(async () => {
  try {
    version.value = await DataDragonService.getLatestVersion();
    const itemData = await DataDragonService.getRankedShopItems();
    const foundItem = itemData.find(i => i.id === route.params.id);
    
    if (foundItem) {
      // Récupère les données complètes avec description et stats
      const allItemsData = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${version.value}/data/fr_FR/item.json`
      );
      const fullItemData = allItemsData.data.data[route.params.id];
      
      item.value = {
        id: route.params.id,
        ...foundItem,
        ...fullItemData
      };
      
      // Récupère les infos des items source
      if (fullItemData.from && fullItemData.from.length > 0) {
        sourceItems.value = fullItemData.from.map(itemId => {
          const sourceItemData = allItemsData.data.data[itemId];
          return {
            id: itemId,
            name: sourceItemData?.name || itemId,
            imageUrl: DataDragonService.getItemImageUrl(itemId, version.value)
          };
        });
      }
      
      // Récupère les infos des items suivants
      if (fullItemData.into && fullItemData.into.length > 0) {
        builtIntoItems.value = fullItemData.into.map(itemId => {
          const intoItemData = allItemsData.data.data[itemId];
          return {
            id: itemId,
            name: intoItemData?.name || itemId,
            imageUrl: DataDragonService.getItemImageUrl(itemId, version.value)
          };
        });
      }
    } else {
      error.value = 'Item non trouvé.';
    }
  } catch (err) {
    error.value = 'Erreur lors du chargement de l\'item.';
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const stripHtml = (html) => {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

const formatStatLabel = (stat) => {
  const statMap = {
    'FlatHPPoolMod': 'PV',
    'FlatMPPoolMod': 'Mana',
    'FlatHPRegenMod': 'Rég. PV',
    'FlatMPRegenMod': 'Rég. Mana',
    'FlatArmorMod': 'Armure',
    'FlatSpellBlockMod': 'Résistance magique',
    'FlatMagicDamageMod': 'Puissance magique',
    'FlatAttackDamageMod': 'Dégâts d\'attaque',
    'FlatMovementSpeedMod': 'Vit. déplacement',
    'FlatAttackSpeedMod': 'Vit. d\'attaque',
    'FlatCritChanceMod': 'Coup critique',
    'FlatGoldPer10Mod': 'Or par 10s'
  };
  return statMap[stat] || stat;
};
</script>

<template>
  <div class="detail-page">
    <button class="back-btn" @click="router.back()">← Retour</button>

    <div v-if="loading" class="state">Chargement…</div>
    <div v-else-if="error" class="state error">{{ error }}</div>

    <template v-else-if="item">
      <!-- Header avec image -->
      <div class="header-wrap">
        <div class="image-wrap">
          <img :src="item.imageUrl" :alt="item.name" class="item-image" />
        </div>
        <div class="header-info">
          <h1>{{ item.name }}</h1>
          <div v-if="item.gold" class="price-info">
            <span class="label">Coût:</span>
            <span class="value">{{ typeof item.gold === 'object' ? item.gold.total : item.gold }} 💰</span>
          </div>
          <div v-if="item.maps && item.maps['11']" class="availability">
            <span class="badge">Disponible en Ranked</span>
          </div>
        </div>
      </div>

      <!-- Contenu détaillé -->
      <div class="content">
        <!-- Description -->
        <section v-if="item.description" class="section">
          <h2>Description</h2>
          <p class="description">{{ stripHtml(item.description) }}</p>
        </section>

        <!-- Statistiques -->
        <section v-if="item.stats && Object.keys(item.stats).length > 0" class="section">
          <h2>Statistiques</h2>
          <div class="stats-grid">
            <div v-for="(value, stat) in item.stats" :key="stat" class="stat-item">
              <span class="stat-label">{{ formatStatLabel(stat) }}</span>
              <span class="stat-value">{{ value > 0 ? '+' : '' }}{{ value }}</span>
            </div>
          </div>
        </section>

        <!-- Comment le construire -->
        <section v-if="sourceItems.length > 0" class="section">
          <h2>Comment le construire</h2>
          <div class="build-path">
            <div v-for="(sourceItem, idx) in sourceItems" :key="sourceItem.id" class="build-item">
              <span class="step-number">{{ idx + 1 }}.</span>
              <img :src="sourceItem.imageUrl" :alt="sourceItem.name" class="build-item-img" />
              <span class="build-item-name">{{ sourceItem.name }}</span>
            </div>
          </div>
        </section>

        <!-- Se construit en -->
        <section v-if="builtIntoItems.length > 0" class="section">
          <h2>Se construit en</h2>
          <div class="build-into">
            <div v-for="intoItem in builtIntoItems" :key="intoItem.id" class="into-item">
              <img :src="intoItem.imageUrl" :alt="intoItem.name" class="build-item-img" />
              <span class="build-item-name">{{ intoItem.name }}</span>
            </div>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.detail-page {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.back-btn {
  background: none;
  border: 2px solid #c89b3c;
  color: #c89b3c;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  font-weight: bold;
}

.back-btn:hover {
  background-color: #c89b3c;
  color: #0a0e27;
}

.state {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #e0e0e0;
}

.error {
  color: #e74c3c;
}

.header-wrap {
  display: flex;
  gap: 2rem;
  margin-bottom: 3rem;
  align-items: flex-start;
  background: linear-gradient(135deg, #1e2328 0%, #0a1428 100%);
  padding: 2rem;
  border-radius: 8px;
  border: 3px solid #785a28;
}

.image-wrap {
  flex-shrink: 0;
}

.item-image {
  width: 180px;
  height: 180px;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(201, 155, 60, 0.3));
}

.header-info {
  flex: 1;
}

.header-info h1 {
  margin: 0 0 1.5rem 0;
  font-size: 2.5rem;
  color: #f0e6d2;
}

.price-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  margin-bottom: 1rem;
  border-left: 3px solid #f39c12;
}

.price-info .label {
  color: #a09b8c;
  font-size: 0.95rem;
}

.price-info .value {
  color: #f39c12;
  font-weight: bold;
  font-size: 1.3rem;
}

.availability {
  display: flex;
  gap: 0.5rem;
}

.badge {
  display: inline-block;
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  background: linear-gradient(135deg, #1e2328 0%, #0a1428 100%);
  padding: 2rem;
  border-radius: 8px;
  border: 1px solid #785a28;
}

.section h2 {
  color: #c89b3c;
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  text-transform: uppercase;
}

.description {
  color: #e0e0e0;
  line-height: 1.6;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
  border-left: 3px solid #3498db;
}

.stat-label {
  color: #a09b8c;
  font-size: 0.95rem;
}

.stat-value {
  color: #3498db;
  font-weight: bold;
  font-size: 1.2rem;
}

.build-path, .build-into {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.build-item, .into-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #e0e0e0;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
  border-left: 3px solid #2ecc71;
}

.step-number {
  font-weight: bold;
  color: #c89b3c;
  min-width: 30px;
}

.build-item-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 4px;
}

.build-item-name {
  font-weight: 500;
  color: #f0e6d2;
}

@media (max-width: 768px) {
  .detail-page {
    padding: 1rem;
  }

  .header-wrap {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .item-image {
    width: 150px;
    height: 150px;
  }

  .section {
    padding: 1rem;
  }
}
</style>
