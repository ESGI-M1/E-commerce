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
            <td>
            <div class="flex" v-if="order.statusHistory.length > 0">
              <span :title="getStatusTitle(order.statusHistory[0].orderStatus.name) + ' le ' + new Date(order.statusHistory[0].changeDate).toLocaleString()">
                <i :class="getStatusIcon(order.statusHistory[0].orderStatus.name)"></i>
              </span>
              &nbsp;
              <p v-if="order.statusHistory.length > 1">(</p>
              <div v-for="(history, index) in order.statusHistory.slice(1)" :key="history.id">
                  <span :title="getStatusTitle(history.orderStatus.name) + ' le ' + new Date(history.changeDate).toLocaleString()">
                    <i :class="getStatusIcon(history.orderStatus.name)"></i>
                  </span>
              </div>
              <p v-if="order.statusHistory.length > 1">)</p>
            </div>
          </td>
            <td>{{ order.totalAmount }} €</td>
            <td v-if="order.addressOrder">{{ order.addressOrder.street }}, {{ order.addressOrder.postalCode }} {{ order.addressOrder.city }}, {{ order.addressOrder.country }}</td>
            <td v-else></td>
            <td>
              <fancy-confirm v-if="order.statusHistory[0].orderStatus.name === 'pending'"
                :buttonText="'Valider'"
                :class="'btn btn-success'"
                :confirmationMessage="'Etes-vous sûr de vouloir valider la commande ?'"
                @confirmed="validate(order.id)"
              >
              </fancy-confirm>
              <a v-else :href="downloadInvoiceUrl(order.id)" target="_blank">
                Télécharger la facture <i class="fas fa-file-invoice"></i>
              </a>
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
const downloadInvoiceUrl = (orderId: number) => {
  return import.meta.env.VITE_API_BASE_URL + '/orders/invoice/' + orderId
}

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

const getStatusTitle = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Terminé'
    case 'pending':
      return 'En cours'
    case 'cancelled':
      return 'Annulé'
    default:
      return ''
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return 'fas fa-check-circle status-completed'
    case 'pending':
      return 'fas fa-hourglass-half status-pending'
    case 'cancelled':
      return 'fas fa-times status-cancelled'
    default:
      return ''
  }
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

.filters {
  display: flex;
  margin-bottom: 20px;
}

.filters div {
  display: flex;
  flex-direction: column;
}

.filters input {
  margin-right: 10px;
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
