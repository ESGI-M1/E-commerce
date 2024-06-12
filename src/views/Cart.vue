<template>
  <div class="cart">
    <header>
      <h1>Mon Panier</h1>
      <p><router-link to="/login">Rejoins-nous</router-link> ou <router-link to="/signup">S'identifier</router-link></p>
    </header>

    <div class="cart-content">
      <div class="cart-items" v-if="cartItems.value">
        <div v-for="(item, index) in cartItems.value" :key="index" class="cart-item">
          <div class="item-details">
            <img :src="item.image[0].url ?? '../../produit_avatar.jpg'" :alt="item.image[0].description" class="product-image" />
            <h3>{{ item.product.name }}</h3>
          </div>
          <div class="item-price">
            <p>{{ item.product.price }} €</p>
            <p>Quantité: {{ item.quantity }}</p>
            <p>Total: {{ (item.product.price * item.quantity).toFixed(2) }} €</p>
          </div>
        </div>
      </div>
      <div v-else>
        <p>Il n'y a aucun article dans ton panier.</p>
      </div>

      <div class="cart-summary" v-if="cartItems.value">
        <h2>Récapitulatif</h2>
        <div class="promo-code">
          <label for="promo">As-tu un code promo ?</label>
          <div class="promo-input">
            <input type="text" id="promo" placeholder="Entrez votre code promo">
            <button @click="applyPromoCode" class="apply-button">Appliquer</button>
          </div>
        </div>
        <div class="totals">
          <div class="subtotal">
            <p>Sous-total</p>
            <p>{{ subtotal }} €</p>
          </div>
          <div class="shipping">
            <p>Frais estimés de prise en charge et d'expédition</p>
            <p>Gratuit</p>
          </div>
          <div class="total">
            <p>Total</p>
            <p>{{ total }} €</p>
          </div>
        </div>
        <button @click="checkout" class="checkout-button">Paiement</button>
        <button @click="checkoutWithPaypal" class="paypal-button">Paiement avec PayPal <i class="fab fa-paypal"></i></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/store/cart';
import { onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const { cartItems, cartTotal, cartSubtotal } = useCartStore();

const fetchCartItems = async () => {
  try {
    const temporaryId = localStorage.getItem('temporaryId');
    if (temporaryId) {
      const response = await axios.get(`http://localhost:3000/carts/${temporaryId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Cart items:', response.data); // Vérifier la structure des données
      cartItems.value = response.data;
           for (const item of cartItems.value) {
        const productId = item.productId;
        const imageResponse = await axios.get(`http://localhost:3000/products/${productId}/images`);
        const image = imageResponse.data;

        item.image = image; // Supposons que l'image soit stockée dans la clé "image"
      }
    }
  } catch (error) {
    console.error('Error fetching cart items:', error);
  }
};

const subtotal = computed(() => {
  return cartItems.value.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toFixed(2);
});

const total = computed(() => {
  return (parseFloat(subtotal.value) + 0).toFixed(2);
});

const checkout = () => {
  alert('Paiement effectué.');
};

const checkoutWithPaypal = () => {
  alert('Paiement effectué via PayPal.');
};

const applyPromoCode = () => {
  alert('Code promo appliqué.');
};

onMounted(() => {
  fetchCartItems();
});
</script>

<style scoped>
.cart {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  margin-bottom: 20px;
}

.cart-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.cart-items {
  border-bottom: 1px solid #ccc;
  padding-bottom: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 8px;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-right: 20px;
}

.item-details {
  flex: 1;
}

.item-details h3 {
  margin: 0;
}

.item-price {
  text-align: right;
}

.cart-summary {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.cart-summary h2 {
  margin-top: 0;
}

.promo-code {
  margin-bottom: 20px;
}

.promo-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

input[type="text"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 5px;
}

.apply-button {
  padding: 10px 20px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
}

.apply-button:hover {
  background-color: #f0f0f0;
}

.totals {
  margin-bottom: 20px;
}

.totals > div {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.total p {
  font-weight: bold;
}

.checkout-button {
  padding: 10px 20px;
  background-color: #000;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  width: 100%;
  margin-bottom: 10px;
}

.checkout-button:hover {
  background-color: #333;
}

.paypal-button {
  padding: 10px 20px;
  background-color: #0070ba;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  width: 100%;
}

.paypal-button:hover {
  background-color: #005ea6;
}

.fa-paypal {
  margin-left: 5px;
}
</style>
