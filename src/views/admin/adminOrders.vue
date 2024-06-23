<template>
    <div class="orders">
      <h1>Liste des Commandes</h1>
  
      <!-- Tableau des commandes -->
      <div class="order-table">
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Statut</th>
              <th>Total</th>
              <th>Date de Livraison</th>
              <th>Adresse</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>#{{ order.user.id }} {{ order.user.lastname }} {{ order.user.firstname }}</td>
              <td>{{ order.status }}</td>
              <td>{{ order.totalAmount }} €</td>
              <td>{{ formatDate(order.deliveryDate) }}</td>
              <td>{{ order.deliveryMethod }}</td>
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

  const orders = ref([])
  
  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:3000/orders')
      orders.value = response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes :', error)
    }
  }

  const formatDate = (dateStr) => {
  return format(parseISO(dateStr), 'dd/MM/yyyy HH:mm')
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
  </style>
  