<script setup lang="ts">
import { onMounted, ref } from 'vue'
  import { number } from 'zod'
  import axios from 'axios'

  const checked = ref(false);
  const { parameter, user} = defineProps({
    parameter: {
      id: number,
      type: String,
      description: String
    },
    user: number
  });
  const emit = defineEmits(["disableCookie", "enableCookie"]);


  function toggleCookie() {
    if (parameter && parameter.type !== "essentiels") {
      const checkbox = document.getElementById(`cookieParameter${parameter.id}`);
      if (checkbox && checkbox.checked) {
        emit('enableCookie', parameter.id);
      } else {
        emit('disableCookie', parameter.id);
      }
    }
  }

async function fetchCookieAcceptation() {
    if (!user) {
      throw new Error('User is not authenticated')
    }
    if (parameter && parameter.type !== "essentiels") {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/cookie/${parameter.id}/user/${user}`).catch(function() {checked.value = false;});
      if (response && response.data) {
        checked.value = true;
      }
    }
  }

  onMounted(async () => {
    fetchCookieAcceptation();
  });

</script>

<template>
  <div v-if="parameter" class="cookie-parameter-container">
    <div class="cookie-parameter-header">
      <input :id="'cookieParameter'+parameter.id" type="checkbox" @click="toggleCookie" :checked="checked" v-if="parameter.type !== 'essentiels'">
      <input type="checkbox" v-if="parameter.type === 'essentiels'" checked disabled>
      <h3><b>Cookie {{ parameter.type }}</b></h3>
    </div>
    <div class="cookie-parameter-body">
      <p>{{ parameter.description }}</p>
    </div>
  </div>
</template>

<style scoped>
  .cookie-parameter-header {
    display: flex;
    flex-wrap: nowrap;
    margin-bottom: 15px;
  }

  .cookie-parameter-header > input {
    margin-right: 15px;
    margin-top: auto;
    margin-bottom: auto;
    height: 18px;
    width: 18px;
  }

  .cookie-parameter-header > h3 {
    height: 22px;
  }
  .cookie-parameter-body {
    margin-bottom: 15px;
  }
</style>