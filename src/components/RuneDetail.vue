<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { DataDragonService } from '../services/riotApi';

const route = useRoute();
const router = useRouter();

const rune = ref(null);
const loading = ref(true);
const error = ref(null);

const stripHtml = (html) => {
  if (!html) return '';
  // Remplace les balises HTML/XML par du texte vide
  let text = html.replace(/<[^>]*>/g, '');
  // Remplace les entités HTML courantes
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return text;
};

onMounted(async () => {
  try {
    const allRunes = await DataDragonService.getRankedRunes();
    const foundRune = allRunes.find(r => r.id === parseInt(route.params.id));
    
    if (foundRune) {
      rune.value = foundRune;
    } else {
      error.value = 'Rune non trouvée.';
    }
  } catch (err) {
    error.value = 'Erreur lors du chargement de la rune.';
    console.error(err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="detail-page">
    <button class="back-btn" @click="router.back()">← Retour</button>

    <div v-if="loading" class="state">Chargement…</div>
    <div v-else-if="error" class="state error">{{ error }}</div>

    <template v-else-if="rune">
      <!-- Header avec image -->
      <div class="header-wrap">
        <div class="image-wrap">
          <img :src="rune.imageUrl" :alt="rune.name" class="rune-image" />
        </div>
        <div class="header-info">
          <h1>{{ rune.name }}</h1>
          <p class="key">Clé: {{ rune.key }}</p>
        </div>
      </div>

      <!-- Contenu détaillé -->
      <div class="content">
        <!-- Sous-runes -->
        <section v-if="rune.slots && rune.slots.length > 0" class="section">
          <h2>Runes Disponibles</h2>
          <div class="slots-container">
            <div v-for="(slot, slotIdx) in rune.slots" :key="slotIdx" class="slot">
              <h3>{{ slot.name || `Slot ${slotIdx + 1}` }}</h3>
              <div class="runes-in-slot">
                <div v-for="slotRune in slot.runes" :key="slotRune.id" class="slot-rune">
                  <img :src="DataDragonService.getRuneImageUrl(slotRune.icon)" :alt="slotRune.name" />
                  <div class="rune-info">
                    <h4>{{ slotRune.name }}</h4>
                    <p v-if="slotRune.shortDesc" class="desc">{{ stripHtml(slotRune.shortDesc) }}</p>
                  </div>
                </div>
              </div>
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
  max-width: 1200px;
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

.rune-image {
  width: 180px;
  height: 180px;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(201, 155, 60, 0.3));
}

.header-info {
  flex: 1;
}

.header-info h1 {
  margin: 0 0 1rem 0;
  font-size: 2.5rem;
  color: #f0e6d2;
}

.key {
  color: #a09b8c;
  font-size: 0.95rem;
  margin: 0;
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

.slots-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.slot {
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 3px solid #3498db;
}

.slot h3 {
  color: #c89b3c;
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.runes-in-slot {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.slot-rune {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  border: 1px solid rgba(200, 155, 60, 0.2);
}

.slot-rune img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  flex-shrink: 0;
}

.rune-info {
  flex: 1;
}

.rune-info h4 {
  color: #f0e6d2;
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.desc {
  color: #a09b8c;
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.4;
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

  .rune-image {
    width: 150px;
    height: 150px;
  }

  .runes-in-slot {
    grid-template-columns: 1fr;
  }
}
</style>
