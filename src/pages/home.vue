<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const navigate = (path) => {
  router.push(path);
};
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">LoL Page</h1>
        <p class="hero-subtitle">Votre Compagnon Ultime de League of Legends</p>
        <p class="hero-description">
          Explorez tous les champions, items et runes. Créez vos builds personnalisés et restez connecté au leaderboard.
        </p>
        <button class="hero-btn" @click="navigate('/champions')">
          Commencer maintenant
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  flex: 1;
  overflow-y: auto;
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #0a1428 0%, #1e2328 100%);
  padding: 6rem 2rem;
  text-align: center;
  border-bottom: 3px solid #c89b3c;
}

.hero-content {
  max-width: 900px;
  margin: 0 auto;
}

.hero-title {
  font-size: 4rem;
  color: #c89b3c;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
  letter-spacing: 3px;
  font-weight: 900;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: #f0e6d2;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.6);
}

.hero-description {
  font-size: 1.1rem;
  color: #a09b8c;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-btn {
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #c89b3c 0%, #a8821f 100%);
  color: #0a1428;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(200, 155, 60, 0.4);
}

.hero-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(200, 155, 60, 0.6);
  background: linear-gradient(135deg, #f0e6d2 0%, #c89b3c 100%);
  color: #1a2a3a;
}

.hero-btn:active {
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero {
    padding: 3rem 1rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }
}
</style>