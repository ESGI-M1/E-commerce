<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { z } from 'zod'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const email = ref('')
const password = ref('')
const router = useRouter()

const emailSchema = z.string().email("L'email est invalide")
const passwordSchema = z.string().min(12, '12 caractères minimum')

const errorPopupContent = ref('');
const errorPopupShow = ref(false);

const closeErrorPopup = () => { errorPopupShow.value = false; }

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

const login = async () => {
  if (
    !emailSchema.safeParse(email.value).success ||
    !passwordSchema.safeParse(password.value).success
  ) {
    return
  }

  const result = await userStore.login(email.value, password.value)

  if (result.success) {
    router.push('/')
  } else {
    if (result.status === 429) {
      errorPopupContent.value = "Vous avez essayé de vous connecter de trop nombreuses fois, veuillez réessayer 15 min après votre dernière tentative";
      errorPopupShow.value = true;
    } else {
      errorPopupContent.value = "Adresse ou mot de passe incorrect";
      errorPopupShow.value = true;
    }
  }
}

</script>

<template>
  <div class="login auth-form">
    <h1>Connexion</h1>
    <form @submit.prevent="login" v-if="!userStore.isAuthenticated">
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
    <div v-else>
      <h2>Vous êtes déjà connecté</h2>
    </div>
    <RouterLink to="/forgot-password">Mot de passe oublié ?</RouterLink>

    <div class="error-popup-background" v-if="errorPopupShow">
      <div class="error-popup">
        <div class="error-popup-header">
          <div>Erreur de connexion</div>
          <div @click="closeErrorPopup"><i class="fas fa-close" style="font-size: 20px; color: gray; cursor: pointer"></i></div>
        </div>
        <div class="error-popup-body">
          {{ errorPopupContent }}
        </div>
      </div>
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

.error-popup-background {
  position: fixed;
  background-color: rgba(155,155,155,0.6);
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
}

.error-popup {
  background-color: white;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  max-width: 400px;
  margin-top: 180px;
}

.error-popup-header {
  padding: 10px;
  border-bottom: 1px lightgray dashed;
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  height: 40px;
}

.fa-xmark:hover {
  color: black !important;
  cursor: pointer;
}

.error-popup-body {
  padding: 10px;
}

</style>
