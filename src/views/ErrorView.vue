<template>
  <div class="payment-page">
    <h1>Paiement Échoué</h1>
    <div v-if="showErrorMessage" class="error-message">
      <p>Une erreur est survenue lors du traitement de votre paiement. Veuillez réessayer.</p>
      <p>{{ redirectMessage }}</p>
    </div>

    <div v-else class="redirect-message">
      <p>Vous allez être redirigé vers la page de paiement...</p>
      <p>{{ countdownMessage }}</p>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import axios from '../tools/axios';
  
  const router = useRouter();
  const showErrorMessage = ref(false);
  const redirectMessage = ref('');
  const countdownMessage = ref('2 secondes');
  const route = useRoute();
  const id = ref(Number(route.params.orderId));

  const redirectToPayment = () => {
    setTimeout(() => {
      countdownMessage.value = '1 seconde';

      setTimeout(() => {
        router.push('/payment'); // Redirection vers la page de paiement

        // Affichage du message d'erreur après la redirection
        setTimeout(() => {
          showErrorMessage.value = true;
          redirectMessage.value = 'Redirection avec les détails...';
        }, 500);
      }, 1500);
    }, 1000);
  };

  onMounted(async () => {
      await axios.delete(`http://localhost:3000/orders/${id.value}`);
      redirectToPayment();
  });
</script>

<style scoped>
.payment-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.error-message, .redirect-message {
  text-align: center;
  margin-bottom: 20px;
}

.error-message p, .redirect-message p {
  margin: 5px 0;
}

.redirect-message {
  animation: bounce 1s infinite alternate;
}

@keyframes bounce {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-5px);
  }
}
</style>
