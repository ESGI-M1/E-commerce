<template>
  <div class="success">
    <h1>Paiement Réussi</h1>
    <p>Merci pour votre achat !</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const cartId = ref(route.params.cartId as Number);
const orderId = ref(route.params.orderId as Number);

const updateCartOrder = async () => {
  try {
    const response = await axios.patch(`http://localhost:3000/carts/update-order/${cartId.value}`, {
      orderId: orderId.value,
    });
    console.log('Response:', response.data); // Afficher la réponse pour le débogage
  } catch (error) {
    console.error('Error updating cart order:', error);
    // Gérer l'erreur ici, par exemple afficher un message d'erreur à l'utilisateur
  }
};

onMounted(() => {
  updateCartOrder();
});
</script>

<style scoped>
.success {
  text-align: center;
  margin-top: 50px;
}
</style>
