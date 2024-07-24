<template>
  <div v-if="!notFound">
    <BreadCrumb v-if="categoryStore.getCategory" :category="categoryStore.getCategory" />
    <h1>Category: {{ categoryStore.getCategory?.name }}</h1>
    <ProductListView />
  </div>
  <NotFoundView v-else />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useCategoryStore } from '@/store/category';
import { useProductsStore } from '@/store/products';
import { useRoute } from 'vue-router';
import NotFoundView from './NotFoundView.vue';
import BreadCrumb from './BreadCrumb.vue';
import ProductListView from './ProductListView.vue';

const route = useRoute();
const categoryStore = useCategoryStore();
const productsStore = useProductsStore();
const notFound = ref(false);

const fetchCategory = async () => {

  try {
    await categoryStore.fetchCategory(route.params.slug);
    productsStore.fetchProductsByCategory(categoryStore.getCategory.id);
  } catch (error) {

    if(error instanceof AxiosError && error.response.status === 404) {
      notFound.value = true;
    }

    console.error(error);
  }
};

onMounted(fetchCategory);

watch(() => route.params.slug, fetchCategory);
</script>
