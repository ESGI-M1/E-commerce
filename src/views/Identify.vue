<template>
  <div class="auth-form-container">
    <div class="form-container">
      <button class="toggle-button" @click="toggleForms">
        <span v-if="showSignup">← Connexion</span>
        <span v-else>Inscription →</span>
      </button>
      <Signup v-show="showSignup" />
      <Login v-show="!showSignup" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Signup from './Signup.vue'
import Login from './Login.vue'

const showSignup = ref(true)

const toggleForms = () => {
  showSignup.value = !showSignup.value
}
</script>

<style scoped>
.auth-form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f0f0;
  position: relative;
}

.form-container {
  width: 400px;
}

.toggle-button {
  display: block;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #007bff;
}
</style>
