<script setup lang="ts">
import BreadCrumbLink from './BreadCrumbLink.vue'

defineProps({
  category: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div>
    <span><router-link to="/">Home</router-link></span>
    <BreadCrumbLink :categoryId="category.parentCategoryId" v-if="category.parentCategoryId" />
    <span> > </span>
    <RouterLink :to="{ name: 'Category', params: { slug: category.slug } }">{{
      category.name
    }}</RouterLink>
  </div>
</template>
