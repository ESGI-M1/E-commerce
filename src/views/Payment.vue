<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const cartItems = ref([]);
const authToken = localStorage.getItem('authToken');

onMounted(async () => {
  if (!authToken) {
    router.push('/login');
  } else {
    await fetchCartItems();
  }
});

const fetchCartItems = async () => {
  try {
    const response = await axios.get('http://localhost:3000/carts', {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    cartItems.value = response.data;
  } catch (error) {
    console.error('Error fetching cart items:', error);
  }
};

const proceedToPayment = async () => {
  try {
    await axios.post('http://localhost:3000/payment', { cartItems: cartItems.value }, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    alert('Payment successful!');
    router.push('/');
  } catch (error) {
    console.error('Error during payment:', error);
    alert('Payment failed.');
  }
};
</script>

<template>
  <div class="payment-page" v-if="cartItems.length">
    <div v-for="item in cartItems" :key="item.id" class="cart-item">
      <img :src="item.image[0].url ?? '../../produit_avatar.jpg'" :alt="item.image[0].description" class="product-image" />
      <div class="item-details">
        <h2>{{ item.name }}</h2>
        <p>{{ item.description }}</p>
        <p>${{ item.price }}</p>
      </div>
    </div>
    <button @click="proceedToPayment">Confirm Payment</button>
  </div>
  <div v-else>
    <p>No items in the cart to process payment.</p>
  </div>
</template>

<style scoped>
.payment-page {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.cart-item {
  display: flex;
  align-items: center;
}
.product-image {
  width: 50px;
  height: 50px;
}
.item-details {
  margin-left: 10px;
}
</style>
