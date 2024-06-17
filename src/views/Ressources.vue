<template>
  <div class="resource-grid">
    <!-- Onglets pour la navigation -->
    <div class="resource-item" @click="navigateToUsers">
      <h1>Utilisateurs</h1>
    </div>

    <div class="resource-item" @click="navigateToProducts">
      <h1>Produits</h1>
    </div>

    <div class="resource-item" @click="navigateToCategories">
      <h1>Catégories</h1>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToUsers = () => {
  router.push('/users');
};

const navigateToProducts = () => {
  router.push('/locker');
};

const navigateToCategories = () => {
  router.push('/categories');
};
</script>

<style scoped>
.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* Trois éléments par ligne */
  gap: 20px;
}

.resource-item {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.resource-item:hover {
  transform: scale(1.05);
}
</style>
