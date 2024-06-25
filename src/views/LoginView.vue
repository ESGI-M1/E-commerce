<script setup lang="ts">
import { ref, computed } from 'vue'
import { z } from 'zod'
import axios from 'axios'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const router = useRouter()

const emailSchema = z.string().email("L'email est invalide")
const passwordSchema = z.string().min(12, '12 caractères minimum')

const emailError = computed(() => {
  const parsedEmail = emailSchema.safeParse(email.value)

  if (parsedEmail.success) {
    return ''
  }

  return parsedEmail.error.issues[0].message
})

const passwordError = computed(() => {
  const parsedPassword = passwordSchema.safeParse(password.value)

  if (parsedPassword.success) {
    return ''
  }

  return parsedPassword.error.issues[0].message
})

const login = () => {
  if (
    !emailSchema.safeParse(email.value).success ||
    !passwordSchema.safeParse(password.value).success
  ) {
    return
  }

  axios
    .post('http://localhost:3000/login', {
      email: email.value,
      password: password.value
    })
    .then(async (response) => {
      const temporaryId = localStorage.getItem('temporaryId')
      try {
        if (temporaryId) {
          const cartResponse = await axios.get(`http://localhost:3000/carts/${temporaryId}`)
          const carts = cartResponse.data
          for (const cart of carts) {
            await axios.patch(`http://localhost:3000/carts/update/${cart.id}`, {
              userId: response.data.id
            })
          }
          await axios.delete(`http://localhost:3000/users/${temporaryId}`)
          localStorage.removeItem('temporaryId')
        }
        localStorage.setItem('authToken', response.data.id)
        router.push('/')
      } catch (error) {
        console.error('Error updating carts:', error)
        alert('Failed to update carts. Please try again later.')
      }
    })
    .catch((error) => {
      console.log(error)
      alert('Échec de la connexion')
    })
}
</script>

<template>
  <div class="login auth-form">
    <h1>Connexion</h1>
    <form @submit.prevent="login">
      <div>
        <label for="email">Email</label>
        <input type="email" placeholder="Email" v-model="email" required />
        <small class="error" v-if="emailError && email">
          {{ emailError }}
        </small>
      </div>
      <div>
        <label for="password">Mot de passe</label>
        <input
          type="password"
          placeholder="Mot de passe"
          v-model="password"
          autocomplete="current-password"
          required
        />
        <small class="error" v-if="passwordError && password">
          {{ passwordError }}
        </small>
      </div>
      <button type="submit">Connexion</button>
    </form>
    <RouterLink to="/forgot-password">Mot de passe oublié ?</RouterLink>
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
