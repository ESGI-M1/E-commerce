<script setup>

import axios from 'axios';
import { ref } from 'vue';
import Form from "../layout/form/Form.vue";

const email = ref('');
const password = ref('');

const login = () => {

    if (!email.value || !password.value) {
        return;
    }

    axios.post('http://localhost:3000/login', {
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

</script>

<template>
    <div class="login">
      <h1>Login</h1>
        <form>
            <input type="email" placeholder="email" v-model="email" required autocomplete="email" />
            <input type="password" placeholder="Password" v-model="password" required autocomplete="current-password" />
            <button type="button" @click="login">Login</button>
        </form>
    </div>
</template>
  

<style scoped>
    .login{
        color: white ;
    }
</style>