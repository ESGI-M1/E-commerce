<script setup lang="ts">
import ProductList from './ProductListView.vue'

import { useProductsStore } from '@/store/products'

const productsStore = useProductsStore()
</script>

<template>
  <div>
    <h1>
      Rechercher un produit :
      <span v-if="productsStore.filter.name">{{ productsStore.filter.name }}</span>
    </h1>
  </div>
  <ProductList />
</template>
