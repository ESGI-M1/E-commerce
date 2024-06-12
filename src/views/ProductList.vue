<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { useProductsStore } from '@/store/products';
import axios from 'axios';
import { useCartStore } from '@/store/cart';

// Initialiser les stores
const productsStore = useProductsStore();
const router = useRouter();
const { cartItems, cartTotal, cartSubtotal } = useCartStore();

// Fonction pour récupérer les items du panier
const fetchCartItems = async () => {
  try {
    const temporaryId = localStorage.getItem('temporaryId');
    if (temporaryId) {
      const response = await axios.get(`http://localhost:3000/carts/${temporaryId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      cartItems.value = response.data;
      for (const item of cartItems.value) {
        const productId = item.productId;
        const imageResponse = await axios.get(`http://localhost:3000/products/${productId}/images`);
        const image = imageResponse.data;
        item.image = image;
      }
      console.log('Cart items:', cartItems.value);
    }
  } catch (error) {
    console.error('Error fetching cart items:', error);
  }
};

// Fonction pour récupérer les images des produits
const fetchProductImages = async () => {
  for (const product of productsStore.products) {
    try {
      console.log(`Fetching image for product ${product.id}`);
      const response = await axios.get(`http://localhost:3000/products/${product.id}/images`);
      if (response.data && response.data.length > 0) {
        product.imageSrc = response.data[0].url; // Associer l'URL de l'image au produit
      } else {
        product.imageSrc = '../../produit_avatar.jpg'; // Image par défaut si aucune image n'est trouvée
      }
    } catch (error) {
      console.error(`Error fetching images for product ${product.id}:`, error);
      product.imageSrc = '../../produit_avatar.jpg'; // Image par défaut en cas d'erreur
    }
  }
};

// Fonction pour afficher les détails du produit
const showProductDetails = (id: string) => {
  router.push({ name: 'ProductDetail', params: { id } });
};

// Lifecycle hook pour charger les données lors du montage du composant
onMounted(() => {
  fetchCartItems();
  fetchProductImages();
});
</script>


<template>
  <div 
    v-for="products in cartItems.value"
    :key="products.product.id" 
    class="product-card"
    @click="showProductDetails(products.product.id)"
  >
    <img :src="products.image[0].url || '../../produit_avatar.jpg'" alt="Product Image" class="product-image" />
    <div class="product-info">
      <h2 class="product-name">{{ products.product.name }}</h2>
      <p class="product-description">{{ products.product.description }}</p>
      <p class="product-reference">{{ products.product.reference }}</p>
      <p class="product-price">${{ parseFloat(products.product.price).toFixed(2) }}</p>
    </div>
  </div>
</template>


<style scoped>
.product-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  width: calc(33.333% - 20px);
  cursor: pointer;
  transition: transform 0.2s;
  margin: 10px;
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
