<template>
  <div class="favorites-container">
    <h1>Mes Favoris</h1>
    <div v-if="favoriteProducts.length === 0" class="empty-favorites">
      <p>Vous n'avez pas de produits favoris pour le moment.</p>
    </div>
    <div v-else>
      <div v-for="favorite in favoriteProducts" :key="favorite.product.id" class="product">
        <div class="product-content" @click="showProductDetails(favorite.product.id)">
          <div class="product-image-container">
            <img :src="favorite.product.Images && favorite.product.Images.length > 0 ? favorite.product.Images[0].url : 
            '../../produit_avatar.jpg'" 
            :alt="favorite.product.Images && favorite.product.Images.length > 0 ? favorite.product.Images[0].description : 
            favorite.product.name" class="product-image" 
            />
          </div>
          <div class="product-details">
            <h2>{{ favorite.product.name }}</h2>
            <p class="product-description">{{ favorite.product.description }}</p>
            <p class="product-price">
              <strong>Prix :</strong> ${{ parseFloat(favorite.product.price).toFixed(2) }}
            </p>
          </div>
        </div>
        <button class="remove-button" @click="removeFromFavorites(favorite.product.id)">Supprimer</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from '../tools/axios';
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'

interface Image {
  url: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  Images: Image[];
}

interface Favorite {
  product: Product;
}

const router = useRouter()
const favoriteProducts = ref<Favorite[]>([])
const user = Cookies.get('USER') ? JSON.parse(Cookies.get('USER').substring(2)).id : null

const fetchFavorites = async () => {
  if (!user) {
    throw new Error('User is not authenticated')
  }

  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/favorites`)
  favoriteProducts.value = response.data
}

const showProductDetails = (id: number) => {
  router.push({ name: 'ProductDetail', params: { id } })
}

const removeFromFavorites = async (productId: number) => {
  if (!user) {
    throw new Error('User is not authenticated')
  }

  await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/favorites/${productId}`)

  //favoriteProducts.value = favoriteProducts.value.filter((favorite) => favorite.product.id !== productId)
  fetchFavorites()
}

onMounted(async () => {
  if (!user) {
    router.push('/login')
  } else {
    await fetchFavorites()
  }
})
</script>



<style scoped>
.favorites-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.empty-favorites {
  text-align: center;
  padding: 20px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.product {
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.3s ease;
}

.product:hover {
  background-color: #f9f9f9;
}

.product-content {
  display: flex;
  align-items: center;
  flex-grow: 1;
  cursor: pointer;
}

.product-image-container {
  width: 100px;
  height: 100px;
  overflow: hidden;
  margin-right: 20px;
}

.product-image {
  width: 100%;
  height: auto;
}

.product-details {
  flex-grow: 1;
}

.product-details h2 {
  margin-top: 0;
  margin-bottom: 5px;
}

.product-description {
  margin-bottom: 10px;
}

.product-price {
  margin-bottom: 10px;
}

.remove-button {
  margin-left: 10px;
  padding: 8px 15px;
  border: none;
  background-color: #dc3545;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.remove-button:hover {
  background-color: #c82333;
}

button {
  padding: 8px 15px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}
</style>
