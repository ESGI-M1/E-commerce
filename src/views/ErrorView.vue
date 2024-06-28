<template>
  <div class="error">
    <h1>Paiement Échoué</h1>
    <p>Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer.</p>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ErrorView'
}
</script>

<style scoped>
.error {
  text-align: center;
  margin-top: 50px;
}
</style>
