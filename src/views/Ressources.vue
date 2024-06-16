<template>
    <div class="resource-item" @click="navigateToUsers">
      <h1>Ressources (admin)</h1>
      <div class="user-card">
        <h2>{{ username }}</h2>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  
  const username = "Utilisateur"; // Remplacez par la variable ou propriété contenant le nom de l'utilisateur
  
  const router = useRouter();
  
  const navigateToUsers = () => {
    router.push('/users'); // Redirection vers la route '/users' lors du clic sur l'élément
  };
  </script>
  
  <style scoped>
.user-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  width: calc(33.333% - 20px);
  cursor: pointer;
  transition: transform 0.2s;
  margin: 10px;
}

.user-card:hover {
  transform: scale(1.05);
}
  </style>
  