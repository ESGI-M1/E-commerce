<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { z } from 'zod'
import axios from 'axios'
import { useRoute } from 'vue-router'

const $route = useRoute()
const submited = ref(false)
const showNotification = inject('showNotification');

const passwordSchema = z
  .string()
  .regex(/[a-z]/, {
    message: 'Une lettre minuscule est requise'
  })
  .regex(/[A-Z]/, {
    message: 'Une lettre majuscule est requise'
  })
  .regex(/\d/, {
    message: 'Un chiffre est requis'
  })
  .regex(/[^a-zA-Z0-9]/, {
    message: 'Un caractère spécial est requis'
  })
  .min(12, {
    message: '12 caractères minimum'
  })

const password = ref('')
const confirmPassword = ref('')

const passwordError = computed(() => {
  const parsedPassword = passwordSchema.safeParse(password.value)

  if (parsedPassword.success) {
    return ''
  }

  return parsedPassword.error.issues[0].message
})

const confirmPasswordError = computed(() => {
  if (password.value === confirmPassword.value) {
    return ''
  }

  return 'Les mots de passe ne sont pas identiques'
})

const changePassword = () => {
  if (!passwordSchema.safeParse(password.value).success || password.value !== confirmPassword.value)
    return

  axios
    .post(`${import.meta.env.VITE_API_BASE_URL}/reset-password`, {
      password: password.value,
      token: $route.params.token
    })
    .then(() => {
      submited.value = true
    })
    .catch((error) => {
      console.log(error)
      showNotification('Échec de la réinitialisation du mot de passe', 'error')
    })
}
</script>

<template>
  <div class="reset-password auth-form">
    <h1>Changez votre mot de passe</h1>
    <form v-if="!submited" @submit.prevent="changePassword">
      <div>
        <label for="password">Nouveau mot de passe</label>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          v-model="password"
          required
          autocomplete="new-password"
        />
        <small class="error" v-if="password && passwordError">
          {{ passwordError }}
        </small>
      </div>
      <div>
        <label for="confirmPassword">Confirmer le mot de passe</label>
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          v-model="confirmPassword"
          required
          autocomplete="new-password"
        />
        <small class="error" v-if="confirmPassword && confirmPasswordError">
          {{ confirmPasswordError }}
        </small>
      </div>
      <button type="submit">Changer le mot de passe</button>
    </form>
    <div v-else>
      <p>Votre mot de passe a été changé avec succès.</p>
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
