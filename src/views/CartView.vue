<template>
  <div class="cart">
    <header>
      <h1>Mon Panier</h1>
      <p v-if="!authToken">
        <router-link to="/login">Rejoins-nous</router-link> ou
        <router-link to="/signup">S'identifier</router-link>
      </p>
    </header>

    <div class="cart-content">
      <div class="cart-items" v-if="carts && carts.length > 0">
        <div v-for="(cart, index) in carts" :key="index">
          <div v-for="(item, itemIndex) in cart.CartProducts" :key="itemIndex" class="cart-item">
            <div class="item-details" @click="showProductDetails(item.product.id)">
              <h3>{{ item.product.name }}</h3>
              <img
                :src="item.product.Images[0]?.url || require('../../assets/produit_avatar.jpg')"
                :alt="item.product.Images[0]?.description || 'Produit'"
                class="product-image"
              />
            </div>
            <div class="item-quantity">
              <select v-model="item.quantity" @change="updateCartQuantity(item.id, item.quantity)">
                <option value="remove">Supprimer</option>
                <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
                <option v-if="item.quantity > 10" :value="item.quantity" :key="item.quantity">
                  {{ item.quantity }}
                </option>
              </select>
            </div>
            <div class="item-price">
              <p>{{ item.product.price }} €</p>
              <p>Total: {{ (item.product.price * item.quantity).toFixed(2) }} €</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <p>Il n'y a aucun article dans ton panier.</p>
      </div>
      <div class="cart-summary" v-if="carts && carts.length > 0">
        <h2>Récapitulatif</h2>
        <div class="promo-code">
          <label for="promo">As-tu un code promo ?</label>
          <div class="promo-input">
            <input
              type="text"
              id="promo"
              placeholder="Entrez votre code promo"
              v-model="promoCode"
            />
            <button @click="applyPromoCode" class="apply-button">Appliquer</button>
          </div>
          <div v-if="promo">
            Code promo appliqué : {{ promo.code }}
            <button @click="removePromo" class="remove-button">Supprimer</button>
          </div>
          <p v-if="promoError" class="error-message">{{ promoError }}</p>
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
            <div class="total-price">
              <p>Total</p>
              <div class="price-container">
                <p
                  :style="{
                    'text-decoration': promo ? 'line-through' : 'none',
                    color: promo ? 'red' : 'initial'
                  }"
                  class="old-price"
                >
                  {{ promo ? subtotal : total }} €
                </p>
                <span class="discount" v-if="promo">(- {{ promo.discountPercentage }}%)</span>
              </div>
            </div>
            <p v-if="promo" class="new-price">
              {{ (total - (total * promo.discountPercentage) / 100).toFixed(2) }} €
            </p>
          </div>
        </div>
        <button @click="checkout" class="checkout-button">Paiement</button>
        <button @click="checkoutWithPaypal" class="paypal-button">
          Paiement avec PayPal <i class="fab fa-paypal"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const carts = ref(null)
const authToken = localStorage.getItem('authToken') || localStorage.getItem('temporaryId')
const promo = ref(null)
const promoCode = ref('')
const promoError = ref('')

const removePromo = async () => {
    const cartIds = carts.value[0].id;
    const response = await axios.post(
      'http://localhost:3000/carts/remove-promo',
      { userId: authToken, cartIds },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    )

    if (response.data.success) {
      promo.value = null
      fetchCartItems()
      promoError.value = ''
    } else {
      console.error('Erreur lors de la suppression du code promo :', response.data.error)
    }
}

const applyPromoCode = async () => {
  const response = await axios.post(
    `http://localhost:3000/promos/${promoCode.value}/apply`,
    null,
    { params: { userId: authToken }, headers: { Authorization: `Bearer ${authToken}` } }
  )

  if (response.data.success) {
    promo.value = response.data
    fetchCartItems()
    promoError.value = ''
  } else {
    promoError.value = response.data.error || 'Ce code promo a expiré.'
  }
}

const fetchCartItems = async () => {
  if (authToken) {
    try {
      const response = await axios.get(`http://localhost:3000/carts/${authToken}`);

      if (response.data && response.data.length > 0) {
        carts.value = response.data;

        if (carts.value[0].promoCodeId) {
          const promoId = carts.value[0].promoCodeId;
          const responsePromo = await axios.get(`http://localhost:3000/promos/${promoId}/detail`);
          promo.value = responsePromo.data;
        } else {
          promo.value = null;
        }
      } else {
        carts.value = null;
        promo.value = null;
      }
    } catch (error) {
      carts.value = null;
      promo.value = null; 
    }
  }
};


const updateCartQuantity = async (id, quantity) => {
  if (quantity === 'remove') {
    await axios.delete(`http://localhost:3000/cartproducts/${id}`);
  } else {
    await axios.patch(`http://localhost:3000/cartproducts/${id}`, { quantity });

  }
  fetchCartItems();
};

const subtotal = computed(() => {
  if (carts.value && carts.value[0]) {
    return carts.value[0].CartProducts
      .reduce((acc, item) => acc + item.product.price * item.quantity, 0)
      .toFixed(2)
  }
  return '0.00';
})

const total = computed(() => {
  return parseFloat(subtotal.value).toFixed(2)
})

const checkout = () => {
  if (!localStorage.getItem('authToken')) {
    router.push('/login')
  } else {
    router.push('/payment')
  }
}

const checkoutWithPaypal = () => {
  alert('Paiement effectué via PayPal.')
}

const showProductDetails = (id: string) => {
  router.push({ name: 'ProductDetail', params: { id } })
}

onMounted(() => {
  fetchCartItems()
})
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
  cursor: pointer;
  flex: 1;
}

.item-details h3 {
  margin: 0;
}

.item-quantity select {
  width: 100px;
  margin-right: 20px;
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

input[type='text'] {
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

.total {
  display: block !important;
}

.total p:first-child {
  text-align: left;
}

.total-price {
  display: flex;
  justify-content: space-between;
}

.price-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.old-price {
  margin-right: 10px;
}

.discount {
  color: green;
}

.new-price {
  text-align: right;
  margin-top: 5px;
}

.error-message {
  color: red;
  text-align: left;
}
</style>
