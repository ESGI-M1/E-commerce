<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useProductsStore } from '@/store/products';

const productsStore = useProductsStore();

const router = useRouter();

const showProductDetails = (id) => {
  router.push({ name: 'ProductDetail', params: { id } });
};

</script>

<template>
    <div 
        v-for="product in productsStore.products"
        :key="product.id" 
        class="product-card"
        @click="showProductDetails(product.id)"
      >
        <img :src="product.image" alt="Product Image" class="product-image" />
        <div class="product-info">
          <h2>{{ product.name }}</h2>
          <p>{{ product.description }}</p>
          <p class="product-price" >${{ parseInt(product.price).toFixed(2) }}</p>
        </div>
      </div>
</template>

<style>
.product-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  width: calc(33.333% - 20px);
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
}

.product-price {
  font-weight: bold;
  color: #2c3e50;
}

.product-details {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.details-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.details-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  z-index: 1;
  max-width: 600px;
  width: 100%;
}

.details-content img {
  max-width: 100%;
  height: auto;
  margin-bottom: 15px;
}

.details-content button {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}
</style>