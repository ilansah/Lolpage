<script setup>
</script>

<template>
  <div class="nav-bar">
    <nav>
      <router-link to="/">HomePage</router-link>
      <router-link to="/champions">ChampionsPage</router-link>
      <router-link to="/items">ItemsPage</router-link>
      <router-link to="/runes">RunesPage</router-link>
      <router-link to="/prebuild">Pre-BuildPage</router-link>
    </nav>
    <router-view />
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

