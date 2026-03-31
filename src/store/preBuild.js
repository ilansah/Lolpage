import { reactive, watch } from 'vue';

const savedStore = localStorage.getItem('preBuild');
const initData = savedStore 
  ? JSON.parse(savedStore) 
  : { builds: [] };

export const store = reactive(initData);

watch(store, (newVal) => {
  localStorage.setItem('preBuild', JSON.stringify(newVal));
});

/**
 * Ajoute un nouveau preBuild
 * @param {Object} build - { name, championId, items: [], runePageId }
 * @returns {string} ID du nouveau build
 */
export const addPreBuild = (build) => {
  const newBuild = {
    id: Date.now().toString(),
    name: build.name || 'Build Sans Nom',
    championId: build.championId,
    items: build.items || [],
    runePageId: build.runePageId || null,
    createdAt: new Date().toISOString()
  };
  store.builds.push(newBuild);
  return newBuild.id;
};

/**
 * Met à jour un preBuild existant
 * @param {string} id - ID du build
 * @param {Object} updates - données à mettre à jour
 */
export const updatePreBuild = (id, updates) => {
  const build = store.builds.find(b => b.id === id);
  if (build) {
    Object.assign(build, updates);
  }
};

/**
 * Supprime un preBuild
 * @param {string} id - ID du build à supprimer
 */
export const deletePreBuild = (id) => {
  store.builds = store.builds.filter(b => b.id !== id);
};

/**
 * Récupère un preBuild par ID
 * @param {string} id - ID du build
 * @returns {Object|null} Le build ou null
 */
export const getPreBuild = (id) => {
  return store.builds.find(b => b.id === id) || null;
};

/**
 * Récupère tous les preBuild
 * @returns {Array} Liste de tous les builds
 */
export const getAllPreBuilds = () => {
  return store.builds;
};
