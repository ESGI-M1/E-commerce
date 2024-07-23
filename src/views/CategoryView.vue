<template>
  <div>
    <BreadCrumb v-if="categoryStore.getCategory" :category="categoryStore.getCategory" />
    <h1>Category: {{ categoryStore.getCategory?.name }}</h1>
    <ProductListView />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useCategoryStore } from '@/store/category';
import { useProductsStore } from '@/store/products';
import { useRoute } from 'vue-router';
import BreadCrumb from './BreadCrumb.vue';
import ProductListView from './ProductListView.vue';

const route = useRoute();
const categoryStore = useCategoryStore();
const productsStore = useProductsStore();

const fetchCategory = async () => {
  await categoryStore.fetchCategory(route.params.slug);
  productsStore.fetchProductsByCategory(categoryStore.getCategory.id);
};

onMounted(fetchCategory);
</script>
