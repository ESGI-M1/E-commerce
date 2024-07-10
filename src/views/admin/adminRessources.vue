<template>
  <div class="admin-dashboard">
    <!-- Liste des ressources -->
    <adminDashboard />
    
    <div class="resource-grid">
      <div class="resource-item">
        <h1><Router-link to="/users">Utilisateurs</Router-link></h1>
      </div>
      <div class="resource-item">
        <h1><Router-link to="/locker">Produits</Router-link></h1>
      </div>
      <div class="resource-item">
        <h1><Router-link to="/orders">Commandes</Router-link></h1>
      </div>
      <div class="resource-item">
        <h1><Router-link to="/returns">Retours</Router-link></h1>
      </div>
      <div class="resource-item">
        <h1><Router-link to="/categories">Catégories</Router-link></h1>
      </div>
      <div class="resource-item">
        <h1><Router-link to="/promos">Promotions</Router-link></h1>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import adminDashboard from './adminDashboard.vue';

</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.resource-item {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}

.resource-item h1 a{
  text-decoration: none;
  color: black;
}

.resource-item:hover {
  transform: scale(1.05);
}

.dashboard {
  margin-top: 40px;
}

.widget {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
}
</style>
