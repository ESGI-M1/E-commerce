<template>
  <div class="orders">
    <h1>Commandes ({{ filteredOrders.length }})</h1>

    <div class="filters">
      <div>
      <label for="orderNumber">N° commande</label>
      <input v-model="filters.orderNumber" type="text" id="orderNumber" />
    </div>
    <div>
      <label for="clientInfo">Client</label>
      <input v-model="filters.clientInfo" type="text" id="clientInfo" />
    </div>
  </div>
    <div class="order-table">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Date de livraison estimée</th>
            <th>Commande</th>
            <th>Client</th>
            <th>Statut</th>
            <th>Total</th>
            <th>Adresse</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredOrders.length > 0" v-for="order in filteredOrders" :key="order.id">
            <td>{{ formatDate(order.createdAt) }}</td>
            <td>{{ formatDate(order.deliveryDate) }}</td>
            <td>n°{{ order.id }}</td>
            <td>#{{ order.user.id }} {{ order.user.lastname }} {{ order.user.firstname }}</td>
            <td :title="order.status === 'completed' ? 'Terminé' : (order.status === 'pending' ? 'En cours' : 'annulé')">
              <i :class="order.status === 'completed' ? 'fas fa-check-circle status-completed' : ( order.status === 'pending' ?  'fas fa-hourglass-half status-pending' : 'fas fa-times status-cancelled')"></i>
            </td>
            <td>{{ order.totalAmount }} €</td>
            <td v-if="order.addressOrder">{{ order.addressOrder.street }}, {{ order.addressOrder.postalCode }} {{ order.addressOrder.city }}, {{ order.addressOrder.country }}</td>
            <td v-else></td>
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
          <tr v-else>
          <td class="empty" colspan="8">Aucune commande trouvée</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from '../../tools/axios';
import { ref, onMounted, inject, computed } from 'vue'
import { format, parseISO } from 'date-fns'
import FancyConfirm from '../../components/ConfirmComponent.vue'

const showNotification = inject('showNotification');

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
  addressOrder?: Address
}

const orders = ref<Order[]>([])
const filters = ref({
  orderNumber: '',
  clientInfo: ''
})

const filteredOrders = computed(() => {
  let filtered = [...orders.value]

  if (filters.value.orderNumber.trim() !== '') {
    filtered = filtered.filter(order =>
      order.id.toString().includes(filters.value.orderNumber.trim())
    )
  }

  if (filters.value.clientInfo.trim() !== '') {
    const clientInfoLower = filters.value.clientInfo.trim().toLowerCase()
    filtered = filtered.filter(order =>
    order.user.id.toString().toLowerCase().includes(clientInfoLower) ||
    order.user.lastname.toLowerCase().includes(clientInfoLower) ||
      order.user.firstname.toLowerCase().includes(clientInfoLower)
    )
  }

  return filtered
})

const fetchOrders = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/orders`)
  orders.value = response.data
}

const formatDate = (dateStr: string) => {
  return format(parseISO(dateStr), 'dd/MM/yyyy HH:mm')
}

const validate = async (id: number) => {
  await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/orders/admin/${id}`)
  fetchOrders()
  showNotification('Commande validée avec succès', 'success');
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

.status-cancelled {
  color: red;
}
</style>
