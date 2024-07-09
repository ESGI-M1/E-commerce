<template>
  <div class="returns">
    <h1>Retours ({{ returnProducts.length }})</h1>

    <div class="return-table">
      <table>
        <thead>
          <tr>
            <th>Commande</th>
            <th>Date</th>
            <th>Client</th>
            <th>Produit</th>
            <th>Statut</th>
            <th>Raison</th>
            <th>Methode de retour</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="returnProduct in returnProducts" :key="returnProduct.id">
            <td>n°{{ returnProduct.orderId }}</td>
            <td>{{ formatReturnDate(returnProduct.createdAt) }}</td>
            <td>
              #{{ returnProduct.user.id }} {{ returnProduct.user.lastname }}
              {{ returnProduct.user.firstname }}
            </td>
            <td class="product-info">
              <span class="product-name">#{{ returnProduct.product.id }} {{ returnProduct.product.name }}</span>
              <span class="product-quantity">x{{ returnProduct.quantity }}</span>
            </td>
            <td :title="returnProduct.status === 'returned' ? 'Terminé' : 'En attente'">
              <i :class="returnProduct.status === 'returned' ? 'fas fa-check-circle status-returned' : 'fas fa-hourglass-half status-processing'"></i>
            </td>
            <td>{{ returnProduct.reason }}</td>
            <td>{{ returnProduct.deliveryMethod }}</td>
            <td>
              <fancy-confirm v-if="returnProduct.status === 'processing'"
                :buttonText="'Valider'"
                :class="'btn btn-success'"
                :confirmationMessage="'Etes-vous sûr de vouloir valider le retour du produit ?'"
                @confirmed="validate(returnProduct.id)"
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
import axios from '../../tools/axios';
import { ref, onMounted } from 'vue'
import FancyConfirm from '../../components/ConfirmComponent.vue'

// Interfaces
interface User {
  id: number
  lastname: string
  firstname: string
}

interface Product {
  id: number
  name: string
}

interface ReturnProduct {
  id: number
  orderId: number
  createdAt: string
  user: User
  product: Product
  quantity: number
  status: string
  reason: string
  deliveryMethod: string
}

const returnProducts = ref<ReturnProduct[]>([])

const fetchReturnProducts = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/return`)
  returnProducts.value = response.data
}

// Fonction pour formater la date de retour
const formatReturnDate = (returnDate: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }
  const formattedDate = new Date(returnDate).toLocaleDateString('fr-FR', options)
  return formattedDate
}

const validate = async (id: number) => {
  await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/return/${id}`)
  fetchReturnProducts()
}

onMounted(() => {
  fetchReturnProducts()
})
</script>

<style scoped>
.returns {
  padding: 20px;
}

.return-table {
  margin-top: 20px;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-name {
  margin-right: 10px;
}

.product-quantity {
  background-color: #f0f0f0;
  border-radius: 5px;
  padding: 2px 6px;
}

.status-returned {
  color: green;
}

.status-processing {
  color: orange;
}
</style>
