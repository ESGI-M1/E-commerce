<script setup lang="ts">
import ProductList from './ProductList.vue';

import axios from 'axios';
import { ref, onMounted } from 'vue';
import { z } from 'zod';
import { useRoute } from 'vue-router';
import { useProductsStore } from '@/store/products';

const productsStore = useProductsStore();
const route = useRoute();

const category = ref([]);
const categorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
});

// Function to fetch category
const fetchCategory = async () => {
  try {
    const response = await axios.get('http://localhost:3000/categories/' + route.params.slug);
    category.value = response.data;
    productsStore.setProducts(response.data.Products);
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

onMounted(() => {
  fetchCategory();
});

</script>

<template>
  <div>
    <h1>Category : {{  $route.params.slug }}</h1>
  </div>

  <ProductList />

</template>