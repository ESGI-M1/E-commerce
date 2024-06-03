<template>
  <div class="login auth-form">
    <h1>Connexion</h1>
    <form @submit.prevent="login">
      <input type="email" placeholder="Email" v-model="email" required />
      <input type="password" placeholder="Mot de passe" v-model="password" required />
      <button type="submit">Connexion</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const router = useRouter();

const login = () => {
  if (!email.value || !password.value) {
    return;
  }
  axios.post('http://localhost:3000/login', {
    email: email.value,
    password: password.value
  })
  .then(response => {
    // Enregistrer le token d'authentification
    localStorage.setItem('authToken', response.data.token);
    // Rediriger l'utilisateur vers la page d'accueil
    router.push('/');
  })
  .catch(error => {
    console.log(error);
    alert('Échec de la connexion');
  });
}
</script>

<style scoped>
.auth-form {
  background-color: white;
  border: 1px solid #ddd;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  margin: 0 auto;
  position: relative;
}
.auth-form h1 {
  text-align: center;
  margin-bottom: 20px;
}
.auth-form input {
  display: block;
  width: calc(100% - 20px);
  margin: 10px auto;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.auth-form button {
  width: calc(100% - 20px);
  margin: 20px auto;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
