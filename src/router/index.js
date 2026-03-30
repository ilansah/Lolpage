import { createRouter, createWebHistory } from 'vue-router';
import home from '../pages/home.vue';
import champion from '../pages/champion.vue';
import item from '../pages/item.vue';
import runes from '../pages/runes.vue';
import preBuild from '../pages/preBuild.vue';
import ChampionDetail from '../components/ChampionDetail.vue';
import ItemDetail from '../components/ItemDetail.vue';

const routes = [
    {
        path: '/',
        name: 'home',
        component: home,
    },
    {
        path: '/champions',
        name: 'champions',
        component: champion,
    },
    {
        path: '/champions/:id',
        name: 'champion-detail',
        component: ChampionDetail,
    },
    {
        path: '/items',
        name: 'items',
        component: item,
    },
    {
        path: '/items/:id',
        name: 'item-detail',
        component: ItemDetail,
    },
    {
        path: '/runes',
        name: 'runes',
        component: runes,
    },
    {
        path: '/prebuild',
        name: 'prebuild',
        component: preBuild,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;