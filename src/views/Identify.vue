<template>
    <div class="auth-form-container">
      <div class="auth-card">
        <div class="form-container" :class="{ 'show-signup': showSignup }">
          <Signup v-show="showSignup" />
          <Login v-show="!showSignup" class="login" />
        </div>
        <button class="toggle-button" @click="toggleForms">
          <span v-if="showSignup">← Connexion</span>
          <span v-else>Inscription →</span>
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import Signup from './Signup.vue';
  import Login from './Login.vue';
  
  const showSignup = ref(true);
  
  const toggleForms = () => {
    showSignup.value = !showSignup.value;
  };
  </script>
  
  <style scoped>
  .auth-form-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f0f0f0;
  }
  .auth-card {
    background-color: transparent;
    border: none;
    padding: 20px;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
  }
  .form-container {
    display: flex;
    transition: transform 0.3s ease;
  }
  .form-container.show-signup {
    transform: translateX(0);
  }
  .form-container:not(.show-signup) {
    transform: translateX(-100%);
  }
  .toggle-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    color: #007bff;
  }
  </style>
  