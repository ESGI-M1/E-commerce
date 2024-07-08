<template>
  <div id="app">
    <MapComponent v-if="mock" :startLocation="mock.startLocation" :endLocation="mock.endLocation" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MapComponent from '../../src/layout/livraison/MapComponent.vue';
import { mockOrderData } from '../../src/map/mock';
import axios from '../tools/axios';
import Cookies from 'js-cookie';

const route = useRoute();
const router = useRouter();
const orderId = ref(route.params.id as string);

const user = JSON.parse(Cookies.get('USER').substring(2)).id
const order = ref(null);
const mock = ref(null);

const fetchOrder = async () => {
  if (user) {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/orders/${orderId.value}`);
      order.value = response.data;
      if (order.value.status == 'completed') {
        router.push(`/order`);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  }
  loadMockData();
};

const loadMockData = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  mock.value = mockOrderData;
};

onMounted(() => {
  fetchOrder();
});
</script>
