<template>
  <div class="returns">
    <h1>Retours ({{ filteredReturnProducts.length }})</h1>

    <div class="filters">
      <div>
        <label for="orderNumber">Identifiant</label>
        <input v-model="filters.id" type="text" id="orderNumber" />
      </div>
      <div>
        <label for="clientInfo">Client</label>
        <input v-model="filters.user" type="text" id="clientInfo" />
      </div>
    </div>

    <div class="return-table">
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Date</th>
            <th>Commande</th>
            <th>Client</th>
            <th>Produit</th>
            <th>Statut</th>
            <th>Raison</th>
            <th>Méthode de retour</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="returnProduct in filteredReturnProducts" :key="returnProduct.id">
            <td>{{ returnProduct.id }}</td>
            <td>{{ formatReturnDate(returnProduct.createdAt) }}</td>
            <td>n°{{ returnProduct.orderId }}</td>
            <td v-if="returnProduct.user">
              #{{ returnProduct.user.id }} {{ returnProduct.user.lastname }}
              {{ returnProduct.user.firstname }}
            </td>
            <td v-else>
              Utilisateur non trouvé
            </td>
            <td class="product-info" v-if="returnProduct.variantOption">
              <span class="product-name">
                #{{ returnProduct.variantOption.productVariant.product.id }} {{ returnProduct.variantOption.productVariant.product.name }}
              </span>
              <span class="product-variant">
                | {{ returnProduct.variantOption.productVariant.name }}
              </span>
              <span class="product-option">
                | {{ returnProduct.variantOption.color }} | {{ returnProduct.variantOption.size }}
              </span>
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
import { ref, onMounted, inject, computed } from 'vue'
import FancyConfirm from '../../components/ConfirmComponent.vue'

const showNotification = inject('showNotification');

interface User {
  id: number
  lastname: string
  firstname: string
}

interface Product {
  id: number
  name: string
}

interface ProductVariant {
  id: number
  name: string
  product: Product
}

interface VariantOption {
  id: number
  color: string
  size: string
  productVariant: ProductVariant
}

interface ReturnProduct {
  id: number
  orderId: number | null
  createdAt: string
  user: User | null
  variantOption: VariantOption
  quantity: number
  status: string
  reason: string
  deliveryMethod: string
}

const returnProducts = ref<ReturnProduct[]>([])
const filters = ref({
  id: '',
  user: ''
})

const filteredReturnProducts = computed(() => {
  let filtered = [...returnProducts.value]

  if (filters.value.id.trim() !== '') {
    filtered = filtered.filter(product =>
      product.id?.toString().includes(filters.value.id.trim())
    )
  }

  if (filters.value.user.trim() !== '') {
    const userFilterLower = filters.value.user.trim().toLowerCase()
    filtered = filtered.filter(product =>
      (product.user?.lastname.toLowerCase().includes(userFilterLower)) ||
      (product.user?.firstname.toLowerCase().includes(userFilterLower)) ||
      (product.user && product.user.id.toString().toLowerCase().includes(userFilterLower))
    )
  }

  return filtered
})

const fetchReturnProducts = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/return`)
    returnProducts.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des retours de produits:', error.message)
  }
}

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
  try {
    await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/return/${id}`)
    fetchReturnProducts()
    showNotification('Retour validé avec succès', 'success');
  } catch (error) {
    console.error('Erreur lors de la validation du retour:', error.message)
  }
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
