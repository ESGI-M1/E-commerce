<template>
  <div class="success">
    <h1>Paiement Réussi</h1>
    <p>Merci pour votre achat !</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'
import axios from '../tools/axios';

const route = useRoute()
const cartId = ref(route.params.cartId as string);
const orderId = ref(route.params.orderId as string);

const updateCartOrder = async () => {
    const response = await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/carts/update-order/${cartId.value}`, {
      orderId: orderId.value,
    });
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
