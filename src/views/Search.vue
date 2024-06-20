<script setup lang="ts">
import ProductList from './ProductList.vue';

import { ref } from 'vue';
import { useProductsStore } from '@/store/products';

const productsStore = useProductsStore();

</script>

<template>
    <div>
        <h1>Rechercher un produit : <span v-if="productsStore.filter.name">{{ productsStore.filter.name }}</span></h1>
    </div>

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