<script setup lang="ts">
import { ref, computed } from 'vue'
import { z } from 'zod'
import axios from 'axios'
import { useRouter } from 'vue-router'

const email = ref('')
const emailSchema = z.string().email("L'email est invalide")
const submited = ref(false)

const emailError = computed(() => {
  const parsedEmail = emailSchema.safeParse(email.value)

  if (parsedEmail.success) {
    return ''
  }

  return parsedEmail.error.issues[0].message
})


const forgotPassword = () => {

  if (!emailSchema.safeParse(email.value).success) return


  axios.post('http://localhost:3000/forgot-password', {
      email: email.value,
    })
    .then(() => {
      submited.value = true
    })
    .catch((error) => {
      console.log(error)
      alert("Échec de la réinitialisation du mot de passe")
    })
    
}
</script>

<template>
  <div class="forgot-password auth-form">
    <h1>Mot de passe oublié</h1>
    <form v-if="!submited" @submit.prevent="forgotPassword">
        <p>Mot de passe perdu ? Veuillez saisir votre votre adresse e-mail. Vous recevrez un lien par e-mail pour créer un nouveau mot de passe.</p>
      <div>
        <label for="email">Email</label>
        <input type="email" placeholder="Email" v-model="email" required autocomplete="email" />
        <small class="error" v-if="emailError && email">
          {{ emailError }}
        </small>
      </div>
      <button type="submit">Réinitialiser le mot de passe</button>
    </form>
    <div v-else>
      <p>Un email vous a été envoyé si l'adresse email est valide.</p>
      <RouterLink to="/identifier">Retour à la connexion</RouterLink>
    </div>
  </div>
</template>

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
