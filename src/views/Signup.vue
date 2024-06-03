<template>
  <div class="signup auth-form">
    <h1>Inscription</h1>
    <form @submit.prevent="signup">
      <input type="text" placeholder="Nom" v-model="lastname" required />
      <input type="text" placeholder="Prénom" v-model="firstname" required />
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
    if (!firstname.value || !lastname.value || !email.value || !password.value) {
        return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,32}$/;
    if (!passwordRegex.test(password.value)) {
        alert("Le mot de passe doit contenir au moins une lettre minuscule, une lettre majuscule, un chiffre, un caractère spécial et être compris entre 8 et 32 caractères.");
        return;
    }
    axios.post('http://localhost:3000/users', {
        firstname: firstname.value,
        lastname: lastname.value,
        email: email.value,
        password: password.value
    })
    .then(response => {
        console.log(response);
    })
    .catch(error => {
        console.log(error);
    });
}

const fields = [
    { label: 'Firstname', type: 'text', id: 'firstname', name: 'firstname' , required: 'required'},
    { label: 'Lastname', type: 'text', id: 'lastname', name: 'lastname' , required: 'required'},
    { label: 'Email', type: 'email', id: 'email', name: 'email' , required: 'required'},
    { label: 'Password', type: 'password', id: 'password', name: 'password', required: 'required' }
];
const submit = { label: 'Signup', type: 'button', 'click': signup };
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
