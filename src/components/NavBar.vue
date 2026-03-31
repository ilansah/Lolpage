<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const menuOpen = ref(false);

const navItems = [
  { path: '/', label: 'Accueil' },
  { path: '/champions', label: 'Champions' },
  { path: '/items', label: 'Objets' },
  { path: '/runes', label: 'Runes' },
  { path: '/prebuild', label: 'Pre-Build' },
  { path: '/leaderboard', label: 'Classement' },
  { path: '/favorites', label: 'Favoris' },
];

const isActive = (path) => {
  return route.path === path;
};

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
};
</script>

<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo -->
      <router-link to="/" class="navbar-logo">
        <span class="logo-text">LoL Page</span>
      </router-link>

      <!-- Hamburger Menu -->
      <button class="hamburger" @click="toggleMenu" :class="{ active: menuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Navigation Links -->
      <div class="navbar-menu" :class="{ active: menuOpen }">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ active: isActive(item.path) }"
          @click="closeMenu"
        >
          {{ item.label }}
        </router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: linear-gradient(90deg, #0a1428 0%, #1a2a3a 100%);
  border-bottom: 2px solid #c89b3c;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

/* Logo */
.navbar-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  color: #c89b3c;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  transition: all 0.3s ease;
}

.navbar-logo:hover {
  color: #f0e6d2;
  transform: scale(1.05);
}

.logo-text {
  letter-spacing: 2px;
}

/* Navigation Menu */
.navbar-menu {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  color: #a09b8c;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #c89b3c;
  transition: width 0.3s ease;
}

.nav-link:hover {
  color: #f0e6d2;
}

.nav-link:hover::after {
  width: 100%;
}

.nav-link.active {
  color: #c89b3c;
  background-color: rgba(200, 155, 60, 0.1);
}

.nav-link.active::after {
  width: 100%;
}

/* Hamburger Menu */
.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
  background: none;
  border: none;
  gap: 5px;
}

.hamburger span {
  width: 25px;
  height: 3px;
  background-color: #c89b3c;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger.active span:nth-child(1) {
  transform: rotate(45deg) translate(10px, 10px);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .navbar-menu {
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    background: linear-gradient(180deg, #0a1428 0%, #1a2a3a 100%);
    flex-direction: column;
    width: 100%;
    max-height: 0;
    overflow: hidden;
    gap: 0;
    transition: max-height 0.3s ease;
    border-bottom: 2px solid #c89b3c;
  }

  .navbar-menu.active {
    max-height: 500px;
  }

  .nav-link {
    width: 100%;
    padding: 1rem;
    border-radius: 0;
    border-bottom: 1px solid rgba(200, 155, 60, 0.1);
    text-align: center;
  }

  .nav-link::after {
    display: none;
  }

  .nav-link.active {
    background-color: rgba(200, 155, 60, 0.2);
  }

  .navbar-container {
    padding: 0 1rem;
  }

  .navbar-logo {
    font-size: 1.2rem;
  }
}
</style>
