import { reactive, watch } from 'vue';

const savedStore = localStorage.getItem('favoris');
const initData = savedStore ? JSON.parse(savedStore) : { champions: [], items: [] };

export const store = reactive(initData);

watch(store, (newVal) => {
  localStorage.setItem('favoris', JSON.stringify(newVal));
});

export const toggleFavChampion = (champion) => {
  if (!store.champions.find(c => c.id === champion.id)) {
    store.champions.push({ id: champion.id, name: champion.name, imageUrl: champion.imageUrl });
  } else {
    store.champions = store.champions.filter(c => c.id !== champion.id);
  }
};

export const toggleFavItem = (item) => {
  if (!store.items.find(i => i.id === item.id)) {
    store.items.push({ id: item.id, name: item.name, imageUrl: item.imageUrl, gold: item.gold });
  } else {
    store.items = store.items.filter(i => i.id !== item.id);
  }
};

export const isFavChampion = (id) => {
  return store.champions.some(c => c.id === id);
};

export const isFavItem = (id) => {
  return store.items.some(i => i.id === id);
};
