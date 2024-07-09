<script setup lang="ts">
import { useRouter } from 'vue-router'
import axios from 'axios'
import { onMounted, ref } from 'vue'

const message = ref('')
const colorMessage = ref('gray')
const redirection = ref(false)

const router = useRouter()

const checkToken = async () => {
  try {
    let url = window.location.href.split('/')
    const token = url[url.length - 1]
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/confirm-address/${token}`)
    if (response.status === 201) {
      message.value = 'Votre adresse à bien été comfirmée'
      colorMessage.value = 'green'
      redirection.value = true
      setTimeout(function () {
        router.push('/login')
      }, 10000)
    } else {
      message.value = 'Le lien de validation est arrivé à expiration'
      colorMessage.value = 'red'
    }
  } catch (error) {
    message.value = 'Le lien de validation est arrivé à expiration'
    colorMessage.value = 'red'
  }
}

onMounted(() => {
  checkToken()
})
</script>

<template>
  <div class="background">
    <div class="container">
      <div class="header-container">
        <h1>Confirmation de votre adresse mail</h1>
      </div>
      <div class="body-container">
        <div :style="{ color: colorMessage }">
          {{ message }}
        </div>
        <div v-if="redirection">
          Vous allez être redirigé automatiquement à la page de connexion dans 10 secondes.
        </div>
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
  width: fit-content;
  position: relative;
  margin: 10px auto 0;
}

.header-container > h1 {
  margin-bottom: 20px;
}
</style>
