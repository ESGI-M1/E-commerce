<script setup>
import Form from "../layout/form/Form.vue";
import axios from 'axios';
import { ref } from 'vue';

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

const submit = { label: 'S\'inscrire', type: 'button', 'click': signup };

</script>

<template>
    <div class="signup">
      <h1>Inscription</h1>
      <Form :fields="fields" :submit="submit"/>
        <form>
            <input type="text" placeholder="firstname" v-model="firstname" required />
            <input type="text" placeholder="lastname" v-model="lastname" required />
            <input type="email" placeholder="email" v-model="email" required />
            <input type="password" placeholder="Password" v-model="password" required pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,32}$" title="Le mot de passe doit contenir au moins une lettre minuscule, une lettre majuscule, un chiffre, un caractère spécial et être compris entre 8 et 32 caractères." />
            <button type="button" @click="signup">s'inscrire</button>
        </form>
    </div>
</template>

<style scoped>
    .signup{
        color: white ;
    }
</style>