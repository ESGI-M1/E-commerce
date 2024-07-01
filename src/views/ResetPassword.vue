<script setup lang="ts">
import { computed, ref } from 'vue'
import axios from 'axios'
import { z } from 'zod'
import { useRouter } from 'vue-router'

const password = ref('')
const confirmPassword = ref('')
const message = ref('')
const redirection = ref(false)
const colorMessage = ref('gray')

const router = useRouter()

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

const passwordError = computed(() => {
  const parsedPassword = passwordSchema.safeParse(password.value)

  if (parsedPassword.success) {
    return ''
  }

  return parsedPassword.error.issues[0].message
})

const resetPassword = async () => {
  if (password.value !== confirmPassword.value) {
    message.value = 'Les mots de passe ne correspondent pas'
    colorMessage.value = 'red'
    return
  } else {
    if (passwordSchema.safeParse(password.value).success) {
      let url = window.location.href.split('/')
      const token = url[url.length - 1]
        const response = await axios.post('http://localhost:3000/users/reset-password', {
          token: token,
          password: password.value
        })
        if (response.status === 201) {
          message.value = 'Votre mot de passe à bien été modifié'
          redirection.value = true
          colorMessage.value = 'green'
          setTimeout(function () {
            router.push('/login')
          }, 10000)
        }
    }
  }
}
</script>

<template>
  <div class="background">
    <div class="container">
      <div class="container-header">
        <h1>Changement de mot de passe</h1>
      </div>

      <div class="container-body">
        <div class="message" :style="{ color: colorMessage }" v-if="message">{{ message }}</div>

        <div class="message" v-if="redirection">
          Vous allez être redirigé automatiquement à la page de connexion dans 10 secondes.
        </div>

        <form id="resetPasswordForm" @submit.prevent="resetPassword" v-if="!redirection">
          <div>
            <small class="error" v-if="passwordError && password">
              {{ passwordError }}
            </small>
          </div>

          <div>
            <label for="password">Nouveau mot de passe</label>
            <input id="password" type="password" v-model="password" />
          </div>

          <div>
            <label for="confirmPassword">Confirmez votre nouveau mot de passe</label>
            <input id="confirmPassword" type="password" v-model="confirmPassword" />
          </div>

          <button type="submit">Changer de mot de passe</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.background {
  min-height: 90vh;
}

.container {
  background-color: white;
  border: 1px solid #ddd;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  border-radius: 8px;
  width: 700px;
  position: relative;
  margin: 10px auto 0;
}

.header-container > h1 {
  margin-bottom: 20px;
}

.error {
  color: red;
}

form {
  display: flex;
  flex-wrap: wrap;
}

form > div {
  width: 700px;
  text-align: left;
  margin: 10px 20px;
  display: flex;
  justify-content: space-between;
}

form > div > input {
  width: 300px;
  padding: 5px;
  border-radius: 5px;
  border: 1px solid lightgray;
}

form > button {
  padding: 10px;
  background-color: #42b983;
  color: white;
  border: 0px;
  border-radius: 10px;
  margin-left: auto;
  margin-right: 20px;
}

.message {
  text-align: left;
  margin-left: 20px;
}
</style>
