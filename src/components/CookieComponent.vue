<script setup lang="ts">
  import ButtonComponent from '@/components/button/ButtonComponent.vue'
  import { onMounted, ref } from 'vue'
  import CookieParameter from '@/components/CookieParameter.vue'
  import Cookies from 'js-cookie'
  import axios from 'axios'

  const emit = defineEmits(["closePage"]);

  const user = Cookies.get('USER') ? JSON.parse(Cookies.get('USER').substring(2)).id : null
  const showParameters = ref(false);
  const parameters = ref();

  const rejectCookie = async () => {
    await enableEssentialCookie();
    emit("closePage");
  }

  const customCookie = () => {
    showParameters.value = true;
  }

  const acceptCookie = async () => {
    await enableEssentialCookie();
    emit("closePage");
  }

  const acceptAllCookies = async () => {
    await enableAllCookies();
    emit("closePage");
  }

  async function fetchAllCookieType() {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/cookie/`).catch(function(){});
    if (response && response.data) {
      parameters.value = response.data;
    }
  }

  async function enableEssentialCookie() {
    for (let i=0; i < parameters.value.length; i++) {
      if (parameters.value[i].type === "essentiels") {
        await enableCookie(parameters.value[i].id);
      }
    }
  }

  async function enableAllCookies() {
    for (let i=0; i < parameters.value.length; i++) {
      await enableCookie(parameters.value[i].id);
    }
  }

  async function enableCookie(cookieId: number) {
    await axios.get(`${import.meta.env.VITE_API_BASE_URL}/cookie/${cookieId}/user/${user}`).catch(
      async function() {
        // if usercookies doesnt exist, create it
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/cookie/${cookieId}/user/${user}`);
      }
    );
  }
  async function disableCookie(cookieId: number) {
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/cookie/${cookieId}/user/${user}`);
  }

  onMounted(async () => {
    await fetchAllCookieType();
  });

</script>

<template>
  <div class="cookie-background">
    <div class="cookie-container">
      <div class="cookie-container-header">
        <h3>Ce Site web utilise des cookies.</h3>
      </div>
      <div class="cookie-container-body">
        <p>Notre site est amené à vous demander l'acceptation des cookies pour des besoins de traitement et d'affichage.</p>
        <p>Un cookie est un petit fichier de données envoyé par un site web et stocké sur votre navigateur.</p>
        <ul v-if="showParameters">
          <li v-for="parameter in parameters" :key="parameter.id">
            <CookieParameter :parameter="parameter" :user="user" @enable-cookie="enableCookie" @disable-cookie="disableCookie"></CookieParameter>
          </li>
        </ul>
      </div>
      <div class="cookie-container-footer">
        <ButtonComponent color="danger" @click="rejectCookie">Refuser</ButtonComponent>
        <ButtonComponent color="gray" @click="customCookie" v-if="!showParameters">Préférences</ButtonComponent>
        <ButtonComponent color="primary" @click="acceptAllCookies" v-if="!showParameters">Tout accepter</ButtonComponent>
        <ButtonComponent color="primary" @click="acceptCookie" v-if="showParameters">Accepter</ButtonComponent>
      </div>
    </div>
  </div>

</template>

<style scoped>
  .cookie-background {
    position: fixed;
    width: 100vw;
    height: 100%;
    background-color: rgba(200, 200, 200, 0.8);
    top: 0;
    left: 0;
    z-index: 10;
  }
  .cookie-container {
    width: fit-content;
    max-width: 75vw;
    padding: 10px;
    background-color: white;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    margin-right: auto;
    margin-left: auto;
    margin-top: 100px;
  }
  .cookie-container-header {
    border-bottom: 1px lightgray dashed;
    padding: 10px;
  }
  .cookie-container-body {
    padding: 10px;
    max-height: 55vh;
    overflow: auto;
  }

  .cookie-container-body ul {
    list-style: none;
    padding-left: 5%;
    padding-top: 10px;
  }

  .cookie-container-footer button {
    margin: 5px;
  }
</style>