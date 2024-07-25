<script setup lang="ts">
import axios from 'axios'
import { ref, onMounted } from 'vue'

const props = defineProps({
  categoryId: {
    type: Number,
    required: true
  }
})
const category = ref()

const fetchCategory = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/categories/${props.categoryId}`);
    category.value = response.data
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

onMounted(() => {
  fetchCategory()
})
</script>

<template>
  <template v-if="category">
    <BreadCrumbLink :categoryId="category.parentCategoryId" v-if="category.parentCategoryId" />
    <span> > </span>
    <RouterLink :to="{ name: 'Category', params: { slug: category.slug } }">{{
      category.name
    }}</RouterLink>
  </template>
</template>
