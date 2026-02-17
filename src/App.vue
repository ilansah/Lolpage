<script setup>
import ChampionList from './views/ChampionList.vue';
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>Lolpage</h1>
      <p class="subtitle">Votre compagnion League Of Legends</p>
    </header>

    <main class="content">
      <ChampionList />
    </main>

    <footer class="footer">
      <p>Lolpage n'est pas approuvé par Riot Games et ne reflète pas les opinions ou les points de vue de Riot Games ou de toute personne officiellement impliquée dans la production ou la gestion de League of Legends.</p>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #0a1428 0%, #1e2328 100%);
  color: #f0e6d2;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #785a28 0%, #c89b3c 100%);
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.header h1 {
  font-size: 3rem;
  color: #0a1428;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.header .subtitle {
  font-size: 1.2rem;
  color: #1e2328;
  font-style: italic;
}

.content {
  flex: 1;
}

.footer {
  background: #0a1428;
  padding: 1.5rem;
  text-align: center;
  border-top: 2px solid #785a28;
  font-size: 0.85rem;
  color: #a09b8c;
}
</style>

