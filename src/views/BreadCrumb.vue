<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import BreadCrumbLink from './BreadCrumbLink.vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  category: {
    type: [Number, Object],
    required: true
  }
})

const category = ref(null)
const route = useRoute()

const fetchCategory = async (id: number) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/categories/${id}`)
    category.value = response.data
  } catch (error) {
    console.error('Error fetching category:', error)
  }
}

const processCategory = () => {
  if (typeof props.category === 'number') {
    fetchCategory(props.category)
  } else {
    category.value = props.category
  }
}

onMounted(() => {
  processCategory()
})
</script>

<template>
  <div v-if="category">
    <span><router-link to="/">Home</router-link></span>
    <BreadCrumbLink :categoryId="category.parentCategoryId" v-if="category.parentCategoryId" />
    <span> > </span>
    <router-link :to="{ name: 'Category', params: { slug: category.slug } }">
      {{ category.name }}
    </router-link>
  </div>
</template>
