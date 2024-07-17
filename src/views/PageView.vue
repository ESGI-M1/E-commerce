<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useShopStore } from '@/store/shop'

const shopStore = useShopStore()
const route = useRoute()

const page = computed(() => {

    if(route.params.slug) {
        const method = 'get' + route.params.slug.charAt(0).toUpperCase() + route.params.slug.slice(1)
        return shopStore[method]
    }
})

</script>

<template>
    <div v-if="page" v-html="page"></div>
    <div v-else>La page n'existe pas</div>
</template>
