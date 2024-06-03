<script setup lang="ts">
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { defineProps } from 'vue';

const props = defineProps({
  categoryId: {
    type: Number,
    required: true
  }
});
const category = ref();

const fetchCategory = async () => {
  try {
    const response = await axios.get('http://localhost:3000/categories/' + props.categoryId);
    category.value = response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

onMounted(() => {
    console.log('categoryId:', props.categoryId);
    fetchCategory();
});

</script>

<template>
    <template v-if="category">
        <span> > </span>
        <span>{{ category.name }}</span>
        <BreadCrumbLink :categoryId="category.parentCategoryId" v-if="category.parentCategoryId" />
    </template>
</template>
