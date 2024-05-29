<template>
    <div class="login">
      <h1>Connexion</h1>
      <form>
        <!-- Vos champs de connexion -->
      </form>
    </div>
  </template>
  
  <script setup>
  // Logique du composant de connexion
  </script>
  
  <style scoped>
  .login {
    background-color: white;
    border: 1px solid #ddd;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    border-radius: 8px;
    width: 300px; /* Réduire la largeur */
    margin: 0 auto; /* Centrer horizontalement */
    transition: transform 0.3s ease;
    transform-origin: right;
    transform: translateX(100%);
  }
  .login.show {
    transform: translateX(0);
  }
  .login h1 {
    text-align: center;
    margin-bottom: 20px;
  }
  </style>
  