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
      <div class="resource-item">
        <h1><Router-link to="/shop">Shop</Router-link></h1>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import adminDashboard from './adminDashboard.vue';

</script>

<style scoped>

</style>
