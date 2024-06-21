<script setup lang="ts">
import ProductList from './ProductList.vue'
import BreadCrumb from './BreadCrumb.vue'

import axios from 'axios'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/store/products'
import { useCategoriesStore } from '@/store/categories'

const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()
const route = useRoute()

const category = ref()
// Function to fetch category
const fetchCategory = async () => {
  try {
    const response = await axios.get('http://localhost:3000/categories/' + route.params.slug)
    categoriesStore.addCategory(response.data)
    category.value = response.data
    productsStore.setProducts(response.data.Products)
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

onMounted(() => {
  fetchCategory()
})
</script>

<template>
  <div>
    <h1>Category : {{ $route.params.slug }}</h1>
  </div>

  <BreadCrumb v-if="category" :category="category" />

  <div class="product-grid">
    <ProductList />
  </div>
</template>

<style>
.product-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
</style>
