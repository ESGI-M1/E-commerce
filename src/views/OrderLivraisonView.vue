<template>
  <div id="app">
    <MapComponent v-if="mock" :startLocation="mock.startLocation" :endLocation="mock.endLocation" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MapComponent from '../../src/layout/livraison/MapComponent.vue';
import { mockOrderData } from '../../src/map/mock'; // Importation des données mockées
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const orderId = ref(route.params.id as string);

const authToken = localStorage.getItem('authToken');
const order = ref(null);
const mock = ref(null);

const fetchOrder = async () => {
  if (authToken) {
    try {
      const response = await axios.get(`http://localhost:3000/orders/${orderId.value}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      order.value = response.data;
      if (order.value.status == 'completed') {
        router.push(`/order`);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  }
  loadMockData(); // Charger les données mockées
};

const loadMockData = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simuler un délai de chargement
  mock.value = mockOrderData;
  console.log(mock.value); // Vérifiez dans la console si mock.value est correctement défini
};

onMounted(() => {
  fetchOrder(); // Appel pour récupérer l'ordre
});
</script>
