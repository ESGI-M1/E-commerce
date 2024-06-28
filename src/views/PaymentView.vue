<template>
  <div class="cart">
    <header>
      <h1>Paiement</h1>
    </header>

    <div class="cart-content">
      <div class="cart-items" v-if="cartItems.length">
        <h2>Options de livraison</h2>
        <div class="delivery-options">
          <button
            class="delivery-option"
            :class="{ 'active': deliveryOption === 'pointRelais' }"
            @click="selectDeliveryOption('pointRelais')"
          >
            <i class="fas fa-map-marker-alt"></i> Point relais
          </button>
          <button
            class="delivery-option"
            :class="{ 'active': deliveryOption === 'livraisonDomicile' }"
            @click="selectDeliveryOption('livraisonDomicile')"
          >
            <i class="fas fa-truck"></i> Livraison à domicile
          </button>
        </div>

        <div v-if="deliveryOption === 'pointRelais'" class="point-relais-form">
          <h3>Point relais</h3>
          <label>
            Code postal :
            <input type="text" v-model="pointRelaisPostalCode">
          </label>
        </div>

        <div v-else-if="deliveryOption === 'livraisonDomicile'" class="livraison-domicile-form">
          <h3>Livraison à domicile</h3>
          <label>
            Adresse :
            <input type="text" v-model="livraisonDomicileAddress">
          </label>
        </div>
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
        <button class="pay-button" @click="handlePayment">
          {{ promo ? 'Payer ' + ((total - (total * promo.discountPercentage) / 100).toFixed(2)) + ' €' : 'Payer ' + total + ' €' }}
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
)
const router = useRouter()
const cartItems = ref([])
const authToken = localStorage.getItem('authToken') || localStorage.getItem('temporaryId')
const promo = ref(null)
const deliveryOption = ref('pointRelais')
const pointRelaisPostalCode = ref('')
const livraisonDomicileAddress = ref('')

const fetchCartItems = async () => {
  try {
    if (authToken) {
      const response = await axios.get(`http://localhost:3000/carts/${authToken}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      const items = response.data

      // Combine items and handle duplicates
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

      // Delete duplicate items from the server
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

      // Fetch images for each product
      for (const item of combinedItems) {
        const productId = item.productId
        const imageResponse = await axios.get(`http://localhost:3000/products/${productId}/images`)
        item.image = imageResponse.data
      }

      cartItems.value = combinedItems

      // Fetch promo if available
      if (cartItems.value[0].promoCodeId) {
        const promoId = cartItems.value[0].promoCodeId
        const responsePromo = await axios.get(`http://localhost:3000/promos/${promoId}/detail`)
        promo.value = responsePromo.data
      } else {
        promo.value = null
      }
    }
  } catch (error) {
    console.error('Error fetching cart items:', error)
  }
}

const subtotal = computed(() => {
  return cartItems.value.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toFixed(2)
})

const total = computed(() => {
  return parseFloat(subtotal.value).toFixed(2)
})

const showProductDetails = (id: string) => {
  router.push({ name: 'ProductDetail', params: { id } })
}

const handlePayment = async () => {
  try {
    const stripe = await stripePromise;
    const response = await axios.post('http://localhost:3000/stripe', {
      items: cartItems.value,
      promo: promo.value
    })
    const sessionId = response.data.id

    const { error } = await stripe.redirectToCheckout({ sessionId })

    if (error) {
      console.error('Stripe redirection error:', error)
    }
  } catch (error) {
    console.error('Stripe payment error:', error)
  }
}

const selectDeliveryOption = (option: string) => {
  deliveryOption.value = option
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

.delivery-options {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.delivery-option {
  display: inline-block;
  padding: 15px 20px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.delivery-option:hover {
  background-color: #e0e0e0;
}

.delivery-option.active {
  background-color: #ccc;
}

.point-relais-form,
.livraison-domicile-form {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff; /* Background color set to white */
  margin-top: 10px;
}

.point-relais-form h3,
.livraison-domicile-form h3 {
  margin-top: 0;
}

.point-relais-form label,
.livraison-domicile-form label {
  display: block;
  margin-top: 10px;
}

input[type='text'] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 5px;
}

.pay-button {
  display: inline-block;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  transition: background-color 0.3s ease;
}

.pay-button:hover {
  background-color: #45a049;
}

.pay-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.fa {
  margin-right: 5px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ccc;
}

.item-details {
  display: flex;
  align-items: center;
}

.product-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  margin-left: 10px;
}

.item-quantity {
  display: flex;
  align-items: center;
}

.item-price {
  text-align: right;
}

.totals {
  margin-bottom: 20px;
}

.totals > div {
  margin-bottom: 10px;
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

.price-container {
  display: flex;
  align-items: center;
}

.discount {
  color: green;
  margin-left: 5px;
}

.total-price {
  display: flex;
  justify-content: space-between;
}

.new-price {
  text-align: right;
}

</style>
