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
  <div class="breadcrumb">
    <span><router-link to="/">Home</router-link></span>
    <span class="separator">></span>
    <BreadCrumbLink :categoryId="category.parentCategoryId" v-if="category.parentCategoryId" />
    <span class="separator">></span>
    <router-link :to="{ name: 'Category', params: { slug: category.slug } }">{{
      category.name
    }}</router-link>
  </div>
</template>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-family: Arial, sans-serif;
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 5px;
}

.breadcrumb span {
  margin: 0 5px;
  color: #555;
}

.breadcrumb a {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.breadcrumb .separator {
  margin: 0 5px;
  color: #999;
}
</style>