<template>
  <div class="cart">
    <header>
      <h1>Paiement</h1>
    </header>

    <div class="cart-content">
      <div class="cart-items" v-if="carts && carts.length > 0">
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

        <div class="point-relais-form" v-if="deliveryOption === 'pointRelais'">
          <h3>Point relais</h3>
          <label>
            Code postal :
            <input type="text" v-model="pointRelaisPostalCode" required>
          </label>
        </div>

        <div class="livraison-domicile-form" v-else-if="deliveryOption === 'livraisonDomicile'">
    <h3>Livraison à domicile</h3>
    <div >
      <div v-if="carts[0].user && carts[0].user.deliveryAddress" v-for="(address, index) in carts[0].user.deliveryAddress" :key="address.id" class="delivery-address">
        <label>
          <input
  type="radio"
  :value="address"
  v-model="selectedAddress"
  name="deliveryAddress"
  :checked="index === 0 ? true : false"
  @click="updateLivraisonDomicileAddress(address)"
/>
          <div class="address-info">
            <p><strong>Adresse de livraison {{ index + 1 }} :</strong></p>
            <p>{{ address.street }}</p>
            <p>{{ address.postalCode }} {{ address.city }}</p>
            <p>{{ address.country }}</p>
          </div>
        </label>
      </div>
    </div>

    <div>
            <input type="radio" value="newAddress" v-model="selectedAddress" name="deliveryAddress"/> Nouvelle adresse </input>
            <label>
            Adresse :
            <input type="text" v-model="livraisonDomicileAddress.street" placeholder="Rue" required>
          </label>
          <label>
            Code postal :
            <input type="text" v-model="livraisonDomicileAddress.postalCode" placeholder="Code postal" required>
          </label>
          <label>
            Ville :
            <input type="text" v-model="livraisonDomicileAddress.city" placeholder="Ville" required>
          </label>
          <label>
            Pays :
            <input type="text" v-model="livraisonDomicileAddress.country" placeholder="Pays" required>
          </label>
        </div>
  </div>

      </div>
      <div class="cart-summary" v-if="carts && carts.length > 0">
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
            <div v-for="(cart, index) in carts" :key="index">
              <div v-for="(item, itemIndex) in cart.CartProducts" :key="itemIndex" class="cart-item">
                <div class="item-details" @click="showProductDetails(item.product.id)">
                  <h3>{{ item.product.name }}</h3>
                  <img :src="item.product.Images ? item.product.Images[0].url : 
                  '../../produit_avatar.jpg'" 
                  :alt="item.product.Images ? item.product.Images[0].description : 
                  item.product.name" class="product-image" 
                  />
                </div>
                <div class="item-quantity">
                  <label for="quantity">Quantité :</label>
                  <p>{{ item.quantity }}</p>
                </div>
                <div class="item-price">
                  <p>{{ item.product.price }} €</p>
                </div>
              </div>
            </div>
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
              {{ discountedTotal }} €
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="payment">
      <div class="payment-form">
        <h2>Paiement sécurisé</h2>
        <button class="pay-button" @click="handlePayment('stripe')">
          Paiement avec stripe
        </button>
        &nbsp;
        <button @click="handlePayment('paypal')" class="paypal-button">
          Paiement avec PayPal <i class="fab fa-paypal"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '../tools/axios';
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(
  'pk_test_51PSJfGRvgxYLdiJ7kEswzMAna653YFlB2u0RycEjMOO8GPwyQyLkoPv3jRtg4heNUzzuZgsVDoI1DkaLilHC6K8V00mf5YOLyz'
)
const router = useRouter()
const authToken = localStorage.getItem('authToken')
const promo = ref(null)
const deliveryOption = ref('pointRelais')
const pointRelaisPostalCode = ref('')
const carts = ref(null)

interface Address {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

const newLivraisonDomicileAddress = ref<Address>({
  street: '',
  postalCode: '',
  city: '',
  country: '',
})

const livraisonDomicileAddress = ref<Address>({
  street: '',
  postalCode: '',
  city: '',
  country: '',
})

const fetchCartItems = async () => {
  if (authToken) {
    const response = await axios.get(`http://localhost:3000/carts/${authToken}`, {
    })

    carts.value = response.data

    if (carts.value[0].promoCodeId) {
      const promoId = carts.value[0].promoCodeId
      const responsePromo = await axios.get(`http://localhost:3000/promos/${promoId}/detail`)
      promo.value = responsePromo.data
    } else {
      promo.value = null
    }
  }
  if (carts.value[0].user && carts.value[0].user.deliveryAddress[0]) {
    newLivraisonDomicileAddress.value.street = carts.value[0].user.deliveryAddress[0].street
    newLivraisonDomicileAddress.value.postalCode = carts.value[0].user.deliveryAddress[0].postalCode
    newLivraisonDomicileAddress.value.city = carts.value[0].user.deliveryAddress[0].city
    newLivraisonDomicileAddress.value.country = carts.value[0].user.deliveryAddress[0].country
      }
}

const updateLivraisonDomicileAddress = (address) => {
  newLivraisonDomicileAddress.value.street = address.street
  newLivraisonDomicileAddress.value.postalCode = address.postalCode
  newLivraisonDomicileAddress.value.city = address.city
  newLivraisonDomicileAddress.value.country = address.country

  livraisonDomicileAddress.value.street = '';
  livraisonDomicileAddress.value.postalCode = '';
  livraisonDomicileAddress.value.country = '';
  livraisonDomicileAddress.value.city = '';

}

const subtotal = computed(() => {
  return carts.value
    ? carts.value.reduce(
        (acc, cart) => acc + cart.CartProducts.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
        0
      ).toFixed(2)
    : 0
})

const total = computed(() => {
  return parseFloat(subtotal.value).toFixed(2)
})

const discountedTotal = computed(() => {
  return promo.value
    ? (total.value - (total.value * promo.value.discountPercentage) / 100).toFixed(2)
    : total.value
})

const showProductDetails = (id: string) => {
  router.push({ name: 'ProductDetail', params: { id } })
}

const handlePayment = async (payment: string) => {
  let newAddress = null;
  let addressorders = null;
  let response = null;
  
  if (deliveryOption.value === 'pointRelais') {
      const randomStreet = Math.random().toString(36).substring(7);
      response = await axios.post('http://localhost:3000/addressorders', {
        street: randomStreet,
        postalCode: pointRelaisPostalCode.value,
        city: getCityFromPostalCode(pointRelaisPostalCode.value),
        country: getCountryFromPostalCode(pointRelaisPostalCode.value),
      });

  } else if (deliveryOption.value === 'livraisonDomicile') {
    if (livraisonDomicileAddress.value.street != '') {
      newLivraisonDomicileAddress.value = livraisonDomicileAddress.value
    } 
      response = await axios.post('http://localhost:3000/addressorders', {
        street: newLivraisonDomicileAddress.value.street,
        postalCode: newLivraisonDomicileAddress.value.postalCode,
        city: newLivraisonDomicileAddress.value.city,
        country: newLivraisonDomicileAddress.value.country,
      });

  }
  newAddress = response.data;


  if (newAddress) {
    try {
      const order = await axios.post('http://localhost:3000/orders', {
        total: discountedTotal.value,
        method: newAddress.id,
        userId: authToken,
      });

      if (payment == 'stripe') {
      const stripe = await stripePromise;
      const stripeSession = await axios.post('http://localhost:3000/stripe', {
        cartId: carts.value[0].id,
        orderId: order.data.id,
        items: carts.value[0].CartProducts,
        promo: promo.value,
      });

      const { sessionId } = stripeSession.data;
      const { error } = await stripe.redirectToCheckout({ sessionId });
    } else if(payment == 'paypal') {
      const paypalSession = await axios.post('http://localhost:3000/paypal', {
        cartId: carts.value[0].id,
        orderId: order.data.id,
        items: carts.value[0].CartProducts,
        promo: promo.value,
      });
    }

      await axios.delete(`http://localhost:3000/orders/${order.value.id}`);
    } catch (error) {
      if (typeof order !== 'undefined' && order) {
      await axios.delete(`http://localhost:3000/orders/${order.value.id}`);
      }
    }
  }
};

const getCityFromPostalCode = (postalCode) => {
  const postalCodeData = {
    '12345': 'Paris',
    '67890': 'Berlin',
  };

  return postalCodeData[postalCode] || 'Ville inconnue';
};

const getCountryFromPostalCode = (postalCode) => {
  const postalCodeCountryData = {
    '12345': 'France',
    '67890': 'Germany',
  };

  return postalCodeCountryData[postalCode] || 'Pays inconnu';
};

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
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;
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
  margin-top: 10px;
}

.livraison-domicile-form > div {
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
  background-color: #4caf50;
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

.paypal-button {
  padding: 10px 20px;
  background-color: #0070ba;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}

.paypal-button:hover {
  background-color: #005ea6;
}

.fa-paypal {
  margin-left: 5px;
}
</style>
