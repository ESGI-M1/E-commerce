<template>
  <div class="returns">
    <h1>Retours</h1>

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
              <span class="product-name">{{ returnProduct.product.name }}</span>
              <span class="product-quantity">x{{ returnProduct.quantity }}</span>
            </td>
            <td>{{ returnProduct.status }}</td>
            <td>{{ returnProduct.reason }}</td>
            <td>{{ returnProduct.deliveryMethod }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref, onMounted } from 'vue'

const returnProducts = ref([])

const fetchReturnProducts = async () => {
  try {
    const response = await axios.get('http://localhost:3000/return')
    returnProducts.value = response.data
    console.log('Retours de produits :', returnProducts.value)
  } catch (error) {
    console.error('Erreur lors de la récupération des retours de produits :', error)
  }
}

// Fonction pour formater la date de retour
const formatReturnDate = (returnDate) => {
  const options = {
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
</style>
