<template>
    <div id="app">
      <MapComponent />
    </div>
  </template>

  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { useRoute, useRouter } from 'vue-router';
  import MapComponent from '../../src/layout/livraison/MapComponent.vue';
  
  const route = useRoute();
  const router = useRouter();
  const orderId = ref(route.params.id as string);
  
  const authToken = localStorage.getItem('authToken');
  const order = ref(null);
  
  const fetchOrder = async () => {
    if (authToken) {
      const response = await axios.get(`http://localhost:3000/orders/${orderId.value}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      order.value = response.data;
      if (order.value.status == 'completed') {
      router.push(`/order`) ;
    }
    }
  };
  
  onMounted(() => {
    fetchOrder();
  });
  </script>
  