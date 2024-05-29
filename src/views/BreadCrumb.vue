<script setup lang="ts">
import BreadCrumbLink from './BreadCrumbLink.vue';

import { defineProps } from 'vue';

const props = defineProps({
  category: {
    type: Object,
    required: true
  }
});


</script>

<template>
    <div>
        <span><router-link to="/">Home</router-link></span>
        <span> > </span>
        <span>{{ category.name }}</span>
        <BreadCrumbLink :categoryId="category.parentCategoryId" v-if="category.parentCategoryId" />
    </div>
</template>