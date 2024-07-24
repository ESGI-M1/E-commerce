<template>
  <div class="cart">
    <header>
      <h1>Mes commandes</h1>
    </header>
    <div class="cart-content">
      <div v-if="orders.length > 0">
        <div
          v-for="(order, orderIndex) in orders"
          :key="orderIndex"
          class="order"
          @click="showOrderDetails(order.id)"
        >
          <h2>Commande n°{{ order.id }}</h2>
          <div :class="['order-status', order.statusHistory[0].orderStatus.name]">{{ order.statusHistory[0].orderStatus.name }}</div>
          <div class="order-total">Total: {{ order.totalAmount }} €</div>
          <button v-if="order.status === 'pending'" @click.stop="showLivraisonOrder(order.id)" class="btn-details">
            Voir ma Livraison
          </button>
        </div>
      </div>
      <div v-else>
        <p>Vous n'avez encore aucune commande.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '../tools/axios';
import Cookies from 'js-cookie'

const router = useRouter()
const user = JSON.parse(Cookies.get('USER').substring(2)).id

const orders = ref([])

const fetchOrders = async () => {
    if (user) {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/orders/own`)
      orders.value = response.data
    }
}

const showLivraisonOrder = (id: string) => {
  router.push({ name: 'LivraisonOrder', params: { id } })
}

const showOrderDetails = (id: string) => {
  router.push({ name: 'OrderDetail', params: { id } })
}

onMounted(() => {
  fetchOrders()
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
  grid-template-columns: 1fr;
  gap: 20px;
}

.order {
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: background-color 0.3s;
}

.order:hover {
  background-color: #e9e9e9;
}

.order-status {
  padding: 5px 10px;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 10px;
}

.order-status.pending {
  background-color: yellow;
  color: black;
}

.order-status.completed {
  background-color: green;
  color: white;
}

.order-status.returned {
  background-color: red;
  color: white;
}

.order-total {
  font-weight: bold;
}

.order-details {
  margin-top: 20px;
  border-top: 1px solid #ccc;
  padding-top: 20px;
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
