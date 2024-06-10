<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { useProductsStore } from '@/store/products';
import axios from 'axios';

const productsStore = useProductsStore();
const router = useRouter();

productsStore.products.forEach(product => {
  product.imageSrc = ref('../../produit_avatar.jpg');
});

const showProductDetails = (id) => {
  router.push({ name: 'ProductDetail', params: { id } });
};

const getProductImage = async (product) => {
  try {
    const response = await axios.get(`http://localhost:3000/images?productId=${product.id}`);
    const images = response.data;
    if (images.length > 0) {
      product.imageSrc.value = images[0].url;
    }
  } catch (error) {
    console.error(`Error fetching images for product ${product.id}:`, error);
  }
};

const loadProductImages = async () => {
  for (let product of productsStore.products) {
    await getProductImage(product);
  }
};

  loadProductImages();
</script>

<template>
  <div 
    v-for="product in productsStore.products"
    :key="product.id" 
    class="product-card"
    @click="showProductDetails(product.id)"
  >
  <img :src="product.Images && product.Images.length > 0 ? product.Images[0].url : '../../produit_avatar.jpg'" alt="Product Image" class="product-image" />
  <div class="product-info">
      <h2 class="product-name">{{ product.name }}</h2>
      <p class="product-description">{{ product.description }}</p>
      <p class="product-reference">{{ product.reference }}</p>
      <p class="product-price">${{ parseFloat(product.price).toFixed(2) }}</p>
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
