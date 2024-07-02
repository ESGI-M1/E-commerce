<template>
  <div class="favorites-container">
    <h1>Mes Favoris</h1>
    <div v-if="favoriteProducts.length === 0" class="empty-favorites">
      <p>Vous n'avez pas de produits favoris pour le moment.</p>
    </div>
    <div v-else>
      <div v-for="product in favoriteProducts" :key="product.id" class="product">
        <div class="product-content" @click="showProductDetails(product.id)">
          <div class="product-image-container">
            <img :src="product.imageSrc" :alt="product.imageDesc" class="product-image" />
          </div>
          <div class="product-details">
            <h2>{{ product.name }}</h2>
            <p class="product-description">{{ product.description }}</p>
            <p class="product-price">
              <strong>Prix :</strong> ${{ parseFloat(product.price).toFixed(2) }}
            </p>
          </div>
        </div>
        <button class="remove-button" @click="removeFromFavorites(product.id)">Supprimer</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from '../tools/axios';
import { useRouter } from 'vue-router'

interface Product {
  id: number
  name: string
  description: string
  price: number
  imageSrc: string
}

interface Favorite {
  product: Product
}

const router = useRouter()
const favoriteProducts = ref<Product[]>([])

const fetchFavorites = async () => {
  const userId = localStorage.getItem('authToken')
  if (!userId) {
    throw new Error('User is not authenticated')
  }

  const response = await axios.get(`http://localhost:3000/favorites/${userId}`)
  const favorites: Favorite[] = response.data

  const products: Product[] = await Promise.all(
    favorites.map(async (favorite) => {
      const product = favorite.product
      if (product.id) {
          const imageResponse = await axios.get(
            `http://localhost:3000/products/${product.id}/images`
          )
          if (imageResponse.data && imageResponse.data.length > 0) {
            product.imageSrc = imageResponse.data[0].url
            product.imageDesc = imageResponse.data[0].description
          } else {
            product.imageSrc = '../../produit_avatar.jpg'
          }
      } else {
        product.imageSrc = '../../produit_avatar.jpg'
      }
      return product
    })
  )

  favoriteProducts.value = products
}

const showProductDetails = (id: number) => {
  router.push({ name: 'ProductDetail', params: { id } })
}

const removeFromFavorites = async (productId: number) => {
  const userId = localStorage.getItem('authToken')
  if (!userId) {
    throw new Error('User is not authenticated')
  }

  await axios.delete(`http://localhost:3000/favorites/${userId}/${productId}`)

  favoriteProducts.value = favoriteProducts.value.filter((product) => product.id !== productId)
}

const authToken = localStorage.getItem('authToken')

onMounted(async () => {
  if (!authToken) {
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
