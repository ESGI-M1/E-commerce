<template>
  <div class="orders">
    <h1>Liste des Commandes ({{ orders.length }})</h1>

    <div class="order-table">
      <table>
        <thead>
          <tr>
            <th>Commande</th>
            <th>Date</th>
            <th>Client</th>
            <th>Statut</th>
            <th>Total</th>
            <th>Adresse</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>n°{{ order.id }}</td>
            <td>{{ formatDate(order.deliveryDate) }}</td>
            <td>#{{ order.user.id }} {{ order.user.lastname }} {{ order.user.firstname }}</td>
            <td :title="order.status === 'completed' ? 'Terminé' : 'En cours'">
              <i :class="order.status === 'completed' ? 'fas fa-check-circle status-completed' : 'fas fa-hourglass-half status-pending'"></i>
            </td>
            <td>{{ order.totalAmount }} €</td>
            <td v-if="order.adressOrder">{{ order.adressOrder.street }}, {{ order.adressOrder.postalCode }} {{ order.adressOrder.city }}, {{ order.adressOrder.country }}</td>
            <td>
              <fancy-confirm v-if="order.status === 'pending'"
                :buttonText="'Valider'"
                :class="'btn btn-success'"
                :confirmationMessage="'Etes-vous sûr de vouloir valider la commande ?'"
                @confirmed="validate(order.id)"
              >
              </fancy-confirm>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { format, parseISO } from 'date-fns'
import FancyConfirm from '../../components/ConfirmComponent.vue'

interface User {
  id: number
  lastname: string
  firstname: string
}

interface Address {
  street: string
  postalCode: string
  city: string
  country: string
}

interface Order {
  id: number
  deliveryDate: string
  user: User
  status: string
  totalAmount: number
  adressOrder?: Address
}

const orders = ref<Order[]>([])

const fetchOrders = async () => {
  const response = await axios.get('http://localhost:3000/orders')
  orders.value = response.data
}

const formatDate = (dateStr: string) => {
  return format(parseISO(dateStr), 'dd/MM/yyyy HH:mm')
}

const validate = async (id: number) => {
  await axios.patch(`http://localhost:3000/orders/${id}`)
  fetchOrders()
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.orders {
  padding: 20px;
}

.order-table {
  margin-top: 20px;
}

.status-completed {
  color: green;
}

.status-pending {
  color: orange;
}
</style>
