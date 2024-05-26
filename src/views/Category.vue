<script setup lang="ts">
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { z } from 'zod';
import { useRoute } from 'vue-router';

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

  {{ category }}
  
  <div>
    <ul>
        <li v-for="product in category.Products" :key="product.id">
            {{ product.name }}
        </li>
    </ul>
  </div>

</template>