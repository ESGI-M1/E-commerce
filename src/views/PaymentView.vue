<template>
  <div class="cart">
    <header>
      <h1>Paiement</h1>
    </header>

    <div class="cart-content">
      <div class="cart-items" v-if="cartItems.length">
        <h2>Options de livraison</h2>
      </div>
      <div class="cart-summary" v-if="cartItems.length">
        <h2>Récapitulatif</h2>
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
        <div v-for="(item, index) in cartItems" :key="index" class="cart-item">
          <div class="item-details" @click="showProductDetails(item.product.id)">
            <h3>{{ item.product.name }}</h3>
            <img
              :src="item.image[0]?.url ?? '../../produit_avatar.jpg'"
              :alt="item.image[0]?.description"
              class="product-image"
            />
          </div>
          <div class="item-quantity">
            <label for="quantity">Quantité :</label>
            <p :value="item.quantity" :key="item.quantity">{{ item.quantity }}</p>
          </div>
          <div class="item-price">
            <p :value="item.product.price" :key="item.product.price">{{ item.product.price }} €</p>
          </div>
        </div>
      </div>
    </div>
    <div class="payment">
      <div class="payment-form">
        <h2>Paiement sécurisé</h2>
        <div id="card-element" class="card-element"></div>
        <button v-if="promo" @click="handlePayment" :disabled="!stripe">
          Payer {{ (total - (total * promo.discountPercentage) / 100).toFixed(2) }} €
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(
  'pk_test_51PSJfGRvgxYLdiJ7kEswzMAna653YFlB2u0RycEjMOO8GPwyQyLkoPv3jRtg4heNUzzuZgsVDoI1DkaLilHC6K8V00mf5YOLyz'
) // Remplacez par votre clé publique
const router = useRouter()
const cartItems = ref([])
const authToken = localStorage.getItem('authToken') || localStorage.getItem('temporaryId')
const promo = ref(null)

const fetchCartItems = async () => {
  try {
    if (authToken) {
      const response = await axios.get(`http://localhost:3000/carts/${authToken}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      const items = response.data

      // Combiner les articles dupliqués et supprimer les doublons
      const combinedItems = []
      const itemMap = new Map()
      for (const item of items) {
        if (itemMap.has(item.productId)) {
          itemMap.get(item.productId).quantity += item.quantity
        } else {
          itemMap.set(item.productId, item)
          combinedItems.push(item)
        }
      }

      for (const productId of itemMap.keys()) {
        const duplicateItems = items.filter((i) => i.productId === productId)
        if (duplicateItems.length > 1) {
          for (let i = 1; i < duplicateItems.length; i++) {
            await axios.delete(`http://localhost:3000/carts/${duplicateItems[i].id}`, {
              params: { userId: authToken }
            })
          }
        }
      }

      for (const item of combinedItems) {
        const productId = item.productId
        const imageResponse = await axios.get(`http://localhost:3000/products/${productId}/images`)
        item.image = imageResponse.data
      }

      cartItems.value = combinedItems

      if (cartItems.value[0].promoCodeId) {
        const promoId = cartItems.value[0].promoCodeId
        const responsePromo = await axios.get(`http://localhost:3000/promos/${promoId}/detail`)
        promo.value = responsePromo.data
      } else {
        promo.value = null
      }
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des articles du panier :', error)
  }
}

const subtotal = computed(() => {
  return cartItems.value
    .reduce((acc, item) => acc + item.product.price * item.quantity, 0)
    .toFixed(2)
})

const total = computed(() => {
  return parseFloat(subtotal.value).toFixed(2)
})

const showProductDetails = (id: string) => {
  router.push({ name: 'ProductDetail', params: { id } })
}

const handlePayment = async () => {
  try {
    const stripe = await stripePromise
    const response = await axios.post('http://localhost:3000/stripe', {
      items: cartItems.value,
      promo: promo.value
    })
    const sessionId = response.data.id

    const { error } = await stripe.redirectToCheckout({ sessionId })

    if (error) {
      console.error('Erreur de redirection Stripe:', error)
    }
  } catch (error) {
    console.error('Erreur de paiement Stripe:', error)
  }
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
