<script setup>
import { ref, onMounted, computed } from 'vue';
import { DataDragonService } from '../services/riotApi';
import { addPreBuild, updatePreBuild, deletePreBuild, getAllPreBuilds, getPreBuild } from '../store/preBuild';

// Data
const champions = ref([]);
const items = ref([]);
const runePages = ref([]);
const allBuilds = ref([]);
const version = ref(null);
const loading = ref(true);

// Form state
const buildName = ref('');
const selectedChampion = ref('');
const selectedItems = ref(['', '', '', '', '', '']);
const selectedRune = ref('');
const editingBuildId = ref(null);

// UI state
const showForm = ref(false);
const message = ref('');

// Computed
const buildImage = computed(() => {
  if (!selectedChampion.value || !version.value) return null;
  return DataDragonService.getChampionImageUrl(selectedChampion.value, version.value);
});

const itemImages = computed(() => {
  return selectedItems.value.map(itemId => 
    itemId && version.value 
      ? DataDragonService.getItemImageUrl(itemId, version.value)
      : null
  );
});

const runeImage = computed(() => {
  const rune = runePages.value.find(r => r.id === parseInt(selectedRune.value));
  return rune ? DataDragonService.getRuneImageUrl(rune.icon) : null;
});

// Charge les données initiales
onMounted(async () => {
  try {
    version.value = await DataDragonService.getLatestVersion();
    
    // Charge les champions
    const champData = await DataDragonService.getAllChampions(version.value);
    champions.value = Object.values(champData.data).map(c => ({
      id: c.id,
      name: c.name
    })).sort((a, b) => a.name.localeCompare(b.name));
    
    // Charge les items
    items.value = await DataDragonService.getRankedShopItems(version.value);
    
    // Charge les runes
    const runesData = await DataDragonService.getAllRunes(version.value);
    runePages.value = runesData.map(rune => ({
      id: rune.id,
      name: rune.name,
      icon: rune.icon
    }));
    
    // Charge les preBuild
    allBuilds.value = getAllPreBuilds();
    
    loading.value = false;
  } catch (err) {
    console.error('Erreur lors du chargement:', err);
    message.value = 'Erreur lors du chargement des données';
    loading.value = false;
  }
});

// Réinitialise le formulaire
const resetForm = () => {
  buildName.value = '';
  selectedChampion.value = '';
  selectedItems.value = ['', '', '', '', '', ''];
  selectedRune.value = '';
  editingBuildId.value = null;
  showForm.value = false;
  message.value = '';
};

// Sauvegarde un preBuild
const savePreBuild = () => {
  if (!selectedChampion.value) {
    message.value = 'Sélectionnez un champion';
    return;
  }
  if (selectedItems.value.filter(i => i).length === 0) {
    message.value = 'Sélectionnez au moins un item';
    return;
  }
  
  const buildData = {
    name: buildName.value || 'Mon Build',
    championId: selectedChampion.value,
    items: selectedItems.value.filter(i => i),
    runePageId: selectedRune.value || null
  };
  
  if (editingBuildId.value) {
    updatePreBuild(editingBuildId.value, buildData);
    message.value = 'Build modifié !';
  } else {
    addPreBuild(buildData);
    message.value = 'Build créé !';
  }
  
  allBuilds.value = getAllPreBuilds();
  setTimeout(resetForm, 1500);
};

// Édite un preBuild existant
const editPreBuild = (buildId) => {
  const build = getPreBuild(buildId);
  if (build) {
    editingBuildId.value = buildId;
    buildName.value = build.name;
    selectedChampion.value = build.championId;
    selectedItems.value = [...build.items, ...Array(6 - build.items.length).fill('')];
    selectedRune.value = build.runePageId || '';
    showForm.value = true;
  }
};

// Supprime un preBuild
const removePreBuild = (buildId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce build ?')) {
    deletePreBuild(buildId);
    allBuilds.value = getAllPreBuilds();
    message.value = 'Build supprimé';
  }
};

// Obtient le nom du champion
const getChampionName = (championId) => {
  return champions.value.find(c => c.id === championId)?.name || 'Champion inconnu';
};

// Obtient le nom de l'item
const getItemName = (itemId) => {
  return items.value.find(i => i.id === itemId)?.name || '';
};

// Obtient le nom de la rune
const getRuneName = (runeId) => {
  return runePages.value.find(r => r.id === parseInt(runeId))?.name || '';
};
</script>

<template>
  <div class="prebuild-container">
    <h1>Mon Atelier de Build</h1>
    
    <div v-if="loading" class="loading">Chargement des données...</div>
    
    <div v-else class="content">
      <!-- Message -->
      <div v-if="message" :class="['message', message.includes('modifié') || message.includes('créé') || message.includes('supprimé') ? 'success' : 'error']">        
        {{ message }}
      </div>

      <!-- Bouton créer nouveau build -->
      <button 
        v-if="!showForm" 
        @click="showForm = true"
        class="btn-create"
      >
        Créer un nouveau Build
      </button>

      <!-- Formulaire -->
      <div v-if="showForm" class="form-section">
        <h2>{{ editingBuildId ? 'Modifier' : 'Créer' }} un Build</h2>
        
        <div class="form-group">
          <label>Nom du Build</label>
          <input 
            v-model="buildName" 
            type="text" 
            placeholder="Ex: Mon Yasuo ADC"
            class="input"
          />
        </div>

        <!-- Champion -->
        <div class="form-group">
          <label>Champion</label>
          <select v-model="selectedChampion" class="select">
            <option value="">-- Sélectionnez un champion --</option>
            <option v-for="champ in champions" :key="champ.id" :value="champ.id">
              {{ champ.name }}
            </option>
          </select>
          <div v-if="selectedChampion" class="preview-item">
            <img :src="buildImage" :alt="getChampionName(selectedChampion)" />
            <span>{{ getChampionName(selectedChampion) }}</span>
          </div>
        </div>

        <!-- Items -->
        <div class="form-group">
          <label>Items (jusque 6)</label>
          <div class="items-inputs">
            <div v-for="(item, index) in selectedItems" :key="index" class="item-input">
              <select v-model="selectedItems[index]" class="select">
                <option value="">Slot {{ index + 1 }}</option>
                <option v-for="itm in items" :key="itm.id" :value="itm.id">
                  {{ itm.name }}
                </option>
              </select>
              <div v-if="selectedItems[index]" class="preview-item small">
                <img :src="itemImages[index]" :alt="getItemName(selectedItems[index])" />
              </div>
            </div>
          </div>
          <div class="items-preview">
            <img 
              v-for="(imgUrl, i) in itemImages" 
              v-if="imgUrl"
              :key="i"
              :src="imgUrl" 
              :alt="'Item ' + (i + 1)"
              class="item-img"
            />
          </div>
        </div>

        <!-- Runes -->
        <div class="form-group">
          <label>Page de Runes</label>
          <select v-model="selectedRune" class="select">
            <option value="">-- Sélectionnez une page de runes --</option>
            <option v-for="rune in runePages" :key="rune.id" :value="rune.id">
              {{ rune.name }}
            </option>
          </select>
          <div v-if="selectedRune" class="preview-item">
            <img :src="runeImage" :alt="getRuneName(selectedRune)" />
            <span>{{ getRuneName(selectedRune) }}</span>
          </div>
        </div>

        <!-- Boutons -->
        <div class="form-actions">
          <button @click="savePreBuild" class="btn btn-primary">
            {{ editingBuildId ? 'Modifier' : 'Créer' }} le Build
          </button>
          <button @click="resetForm" class="btn btn-secondary">
            Annuler
          </button>
        </div>
      </div>

      <!-- Liste des builds -->
      <div class="builds-section">
        <h2>Mes Builds ({{ allBuilds.length }})</h2>
        
        <div v-if="allBuilds.length === 0" class="no-builds">
          Aucun build créé. Commencez par en créer un !
        </div>

        <div v-else class="builds-grid">
          <div v-for="build in allBuilds" :key="build.id" class="build-card">
            <!-- Champion -->
            <div class="build-header">
              <img 
                :src="DataDragonService.getChampionImageUrl(build.championId, version)"
                :alt="getChampionName(build.championId)"
                class="champion-img"
              />
              <div class="build-info">
                <h3>{{ build.name }}</h3>
                <p class="champion-name">{{ getChampionName(build.championId) }}</p>
              </div>
            </div>

            <!-- Items -->
            <div class="build-items">
              <img 
                v-for="itemId in build.items" 
                :key="itemId"
                :src="DataDragonService.getItemImageUrl(itemId, version)"
                :alt="getItemName(itemId)"
                :title="getItemName(itemId)"
                class="builded-item"
              />
            </div>

            <!-- Runes -->
            <div v-if="build.runePageId" class="build-rune">
              <img 
                :src="DataDragonService.getRuneImageUrl(runePages.find(r => r.id === build.runePageId)?.icon)"
                :alt="getRuneName(build.runePageId)"
                :title="getRuneName(build.runePageId)"
                class="rune-img"
              />
            </div>

            <!-- Actions -->
            <div class="build-actions">
              <button @click="editPreBuild(build.id)" class="btn-edit" title="Modifier">
                Éditer
              </button>
              <button @click="removePreBuild(build.id)" class="btn-delete" title="Supprimer">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prebuild-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: #c89b3c;
}

h1 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #c89b3c;
}

h2 {
  font-size: 1.5rem;
  margin: 1.5rem 0 1rem;
  color: #c89b3c;
}

.loading {
  text-align: center;
  font-size: 1.2rem;
  padding: 2rem;
  color: #a09b8c;
}

.message {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
  font-weight: bold;
  animation: slideIn 0.3s ease-out;
}

.message.success {
  background-color: #2ecc71;
  color: white;
}

.message.error {
  background-color: #e74c3c;
  color: white;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Boutons */
.btn-create {
  display: block;
  margin: 0 auto 2rem;
  padding: 0.8rem 1.5rem;
  background-color: #0a5f3b;
  color: #c89b3c;
  border: 2px solid #c89b3c;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-create:hover {
  background-color: #0a7a4a;
  transform: scale(1.05);
}

.btn {
  padding: 0.7rem 1.2rem;
  border: 2px solid #c89b3c;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #0a5f3b;
  color: #c89b3c;
}

.btn-primary:hover {
  background-color: #0a7a4a;
  transform: scale(1.02);
}

.btn-secondary {
  background-color: transparent;
  color: #c89b3c;
}

.btn-secondary:hover {
  background-color: rgba(200, 155, 60, 0.1);
}

.btn-edit, .btn-delete {
  padding: 0.5rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
  font-size: 0.85rem;
}

.btn-edit {
  background-color: #3498db;
  color: white;
  margin-right: 0.5rem;
}

.btn-edit:hover {
  background-color: #2980b9;
  transform: scale(1.05);
}

.btn-delete {
  background-color: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background-color: #c0392b;
  transform: scale(1.05);
}

/* Formulaire */
.form-section {
  background-color: rgba(12, 30, 20, 0.8);
  border: 2px solid #c89b3c;
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #c89b3c;
}

.input, .select {
  width: 100%;
  padding: 0.7rem;
  background-color: #1a2820;
  color: #c89b3c;
  border: 2px solid #785a28;
  border-radius: 6px;
  font-size: 1rem;
}

.input:focus, .select:focus {
  outline: none;
  border-color: #c89b3c;
  box-shadow: 0 0 10px rgba(200, 155, 60, 0.3);
}

.input::placeholder {
  color: #785a28;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: rgba(200, 155, 60, 0.1);
  border-radius: 6px;
}

.preview-item img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.preview-item.small {
  width: 60px;
}

.preview-item span {
  color: #c89b3c;
  flex-grow: 1;
}

.items-inputs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.item-input {
  display: flex;
  gap: 0.5rem;
}

.item-input select {
  flex-grow: 1;
}

.items-preview {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.item-img {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  border: 1px solid #c89b3c;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.item-img:hover {
  transform: scale(1.1);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.form-actions .btn {
  flex: 1;
}

/* Builds */
.builds-section {
  background-color: rgba(12, 30, 20, 0.5);
  padding: 2rem;
  border-radius: 10px;
  border: 1px solid #785a28;
}

.no-builds {
  text-align: center;
  padding: 2rem;
  color: #a09b8c;
  font-size: 1.1rem;
}

.builds-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.build-card {
  background-color: rgba(30, 50, 40, 0.8);
  border: 2px solid #785a28;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s ease;
  overflow: hidden;
}

.build-card:hover {
  border-color: #c89b3c;
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(200, 155, 60, 0.2);
}

.build-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #785a28;
}

.champion-img {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  border: 2px solid #c89b3c;
}

.build-info h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #c89b3c;
}

.build-info .champion-name {
  margin: 0.3rem 0 0;
  color: #a09b8c;
  font-size: 0.9rem;
}

.build-items {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.builded-item {
  width: 45px;
  height: 45px;
  border-radius: 4px;
  border: 1px solid #c89b3c;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.builded-item:hover {
  transform: scale(1.1);
}

.build-rune {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.rune-img {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  border: 1px solid #c89b3c;
}

.build-actions {
  display: flex;
  gap: 0.5rem;
}

.build-actions .btn-edit,
.build-actions .btn-delete {
  flex: 1;
  text-align: center;
}

@media (max-width: 768px) {
  .prebuild-container {
    padding: 1rem;
  }

  h1 {
    font-size: 1.8rem;
  }

  .items-inputs {
    grid-template-columns: 1fr;
  }

  .builds-grid {
    grid-template-columns: 1fr;
  }
}
</style>