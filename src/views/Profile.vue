<template>
  <div class="profile-container" v-if="user">
    <h1>Mon Profil</h1>
    <div class="profile-details">
      <p><strong>Nom:</strong> {{ user.lastname }}</p>
      <p><strong>Prénom:</strong> {{ user.firstname }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const user = ref(null)

const fetchUserProfile = async () => {
  const authToken = localStorage.getItem('authToken')
  if (!authToken) {
    // Handle the case where there is no authToken
    return
  }

  try {
    const response = await axios.get(`http://localhost:3000/users/${authToken}`)
    user.value = response.data
  } catch (error) {
    // Handle the error
    console.error('Error fetching user profile:', error)
  }
}

onMounted(async () => {
  await fetchUserProfile()
})
</script>

<style scoped>
.profile-container {
  margin: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f9f9f9;
}

.profile-details {
  line-height: 1.6;
}

.profile-details p {
  margin: 10px 0;
}
</style>
