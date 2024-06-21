<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import axios from 'axios'
import { useProductsStore } from '@/store/products'

const productsStore = useProductsStore()
const router = useRouter()

const fetchProducts = async () => {
  try {
    const response = await axios.get('http://localhost:3000/products')
    productsStore.products = response.data
  } catch (error) {
    console.error('Error fetching products:', error)
  }
}

const showProductDetails = (id: string) => {
  router.push({ name: 'ProductDetail', params: { id } })
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="product-list">
    <div
      v-for="product in productsStore.products"
      :key="product.id"
      class="product-card"
      @click="showProductDetails(product.id)"
    >
      <img
        :src="product.Images ? product.Images[0].url : '../../produit_avatar.jpg'"
        :alt="product.Images ? product.Images[0].description : 'Product image'"
        class="product-image"
      />
      <div class="product-info">
        <h2 class="product-name">{{ product.name }}</h2>
        <p class="product-description">{{ product.description }}</p>
        <p class="product-reference">{{ product.reference }}</p>
        <p class="product-price">${{ parseFloat(product.price).toFixed(2) }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.product-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  width: calc(33.333% - 20px); /* Adjust width to account for margins */
  margin: 10px;
  box-sizing: border-box; /* Ensures width calculation includes padding and border */
  cursor: pointer;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: scale(1.05);
}

.product-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.product-info {
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.product-name {
  font-size: 1.5em;
  margin-bottom: 10px;
}

.product-description {
  margin-bottom: 10px;
}

.product-reference {
  color: grey;
  margin-bottom: 10px;
}

.product-price {
  font-weight: bold;
  color: #2c3e50;
}
</style>
