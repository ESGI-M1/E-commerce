<template>
    <div class="not-found">
      <h1>404 - Page non trouvée</h1>
      <p>{{ message }}</p>
      <p>Il semble que la page que vous recherchez n'existe pas. Vous pouvez retourner à la <router-link to="/">page d'accueil</router-link> ou utiliser le menu pour naviguer vers une autre page.</p>
    </div>
</template>
  
<script setup>
import { defineProps } from 'vue';

defineProps({
message: {
    type: String,
    default: 'La page que vous recherchez est introuvable.'
}
});
</script>
  
<style scoped>
  .not-found {
    text-align: center;
    margin-top: 50px;
  }
</style>
