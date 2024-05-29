<template>
  <div class="signup">
    <h1>Inscription</h1>
    <form @submit.prevent="signup">
      <input type="text" placeholder="Prénom" v-model="firstname" required />
      <input type="text" placeholder="Nom" v-model="lastname" required />
      <input type="email" placeholder="Email" v-model="email" required />
      <input type="password" placeholder="Mot de passe" v-model="password" required />
      <button type="submit">S'inscrire</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const firstname = ref('');
const lastname = ref('');
const email = ref('');
const password = ref('');

const signup = () => {
  // Logique d'inscription
};
</script>

<style scoped>
/* Styles */
</style>
