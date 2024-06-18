<script setup lang="ts">
  import { ref } from 'vue'
  import axios from 'axios'
  import { useRoute, useRouter } from 'vue-router'

  const route = useRoute();
  const router = useRouter();

  const message = ref();

  const resetMdp = async () => {
    try {
      const response = await axios.get('http://localhost:3000/mailer/reset-mdp');
      console.log(response.data);
    } catch (error) {
      console.error('Error :', error);
    }
  }

  async function tentativeConnexion(){
    try {
      const response = await axios.get('http://localhost:3000/mailer/tentative-connexion');
      console.log(response.data);
    } catch (error) {
      console.error('Error :', error);
    }
  }

  async function demandeRenouvellementMdp(){
    try {
      const response = await axios.get('http://localhost:3000/mailer/demande-renouvellement-mdp');
      console.log(response.data);
    } catch (error) {
      console.error('Error :', error);
    }
  }

  async function nvProduit(){
    try {
      const response = await axios.get('http://localhost:3000/mailer/nv-produit');
      console.log(response.data);
    } catch (error) {
      console.error('Error :', error);
    }
  }

  async function restockProduit(){
    try {
      const response = await axios.get('http://localhost:3000/mailer/restock-produit');
      console.log(response.data);
    } catch (error) {
      console.error('Error :', error);
    }
  }

  async function changementPrix(){
    try {
      const response = await axios.get('http://localhost:3000/mailer/changement-prix');
      console.log(response.data);
    } catch (error) {
      console.error('Error :', error);
    }
  }

  async function inscriptionNewsLetter(){
    try {
      const response = await axios.get('http://localhost:3000/mailer/inscription-newsletter');
      console.log(response.data);
    } catch (error) {
      console.error('Error :', error);
    }
  }

  async function finStock(){
    try {
      const response = await axios.get('http://localhost:3000/mailer/fin-stock');
      console.log(response.data);
    } catch (error) {
      console.error('Error :', error);
    }
  }

</script>

<template>
  <button @click="resetMdp()">reset mdp</button>
  <p>{{ message }}</p>
</template>

<style scoped>

</style>