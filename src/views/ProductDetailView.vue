<script setup lang="ts">
import BreadCrumb from './BreadCrumb.vue'

import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const isFavorite = ref(false)
const productId = ref(route.params.id as string)

interface Product {
  id: string;
  name: string;
  imageSrc: string;
  description: string;
  price: number;
  reference: string;
  comments: string[];
  Categories: number[];
}

const product = ref<Product>({
  id: '',
  name: '',
  imageSrc: '',
  description: '',
  price: 0,
  reference: '',
  comments: [],
  Categories: []
})

const fetchProductById = async (id: string) => {
  try {
    const response = await axios.get(`http://localhost:3000/products/${id}`)
    product.value = response.data

    // Fetch the image for the product
    if (product.value.id) {
      const imageResponse = await axios.get(
        `http://localhost:3000/products/${product.value.id}/images`
      )
      if (imageResponse.data && imageResponse.data.length > 0) {
        product.value.imageSrc = imageResponse.data[0].url
      } else {
        product.value.imageSrc = '../../produit_avatar.jpg'
      }
    }

    const userId = localStorage.getItem('authToken')
    if (userId) {
      const favoriteResponse = await axios.get(`http://localhost:3000/favorites/${userId}`)
      const favoriteProductIds = favoriteResponse.data.map((fav: any) => fav.productId)
      isFavorite.value = favoriteProductIds.includes(product.value.id)
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    alert('There was an error fetching the product details. Please try again later.')
  }
}

const addToFavorites = async (productId: string) => {
  const token = localStorage.getItem('temporaryId')
  if (token || !localStorage.getItem('authToken')) {
    router.push('/login')
    return
  }
  try {
    const userId = localStorage.getItem('authToken')
    const response = await axios.post('http://localhost:3000/favorites/add', {
      userId,
      productId
    })

    if (response.status === 201) {
      isFavorite.value = true
      alert('Produit ajouté aux favoris avec succès')
    }
  } catch (error) {
    console.error('Error adding product to favorites:', error)
    alert("Échec de l'ajout du produit aux favoris")
  }
}

const removeFromFavorites = async (productId: string) => {
  try {
    const userId = localStorage.getItem('authToken')
    if (!userId) {
      throw new Error('User is not authenticated')
    }

    await axios.delete(`http://localhost:3000/favorites/${userId}/${productId}`)
    isFavorite.value = false
    alert('Produit supprimé des favoris avec succès')
  } catch (error) {
    console.error('Error removing favorite product:', error)
    alert('Échec de la suppression du produit des favoris')
  }
}

const addToCart = async (quantity: number) => {
  let userId
  const isAuthenticated = localStorage.getItem('authToken')
    ? localStorage.getItem('authToken')
    : null
  if (isAuthenticated) {
    userId = isAuthenticated
  } else {
    if (localStorage.getItem('temporaryId')) {
      userId = localStorage.getItem('temporaryId')
    } else {
      userId = Math.floor(Math.random() * 2147483647).toString()
      localStorage.setItem('temporaryId', userId)
    }
  }

  try {
    await axios.post('http://localhost:3000/carts', {
      userId: userId,
      productId: product.value.id,
      quantity: quantity
    })
    alert('Produit ajouté au panier avec succès')
    router.push('/cart')
  } catch (error) {
    alert("Échec de l'ajout du produit au panier")
  }
}

onMounted(() => {
  fetchProductById(productId.value)
})
</script>

<template>
  <BreadCrumb
    v-if="product.Categories && product.Categories[0]"
    :category="product.Categories[0]"
  />
  <div class="product-page">
    <div class="product-image-container">
      <img :src="product.imageSrc" :alt="product.name" class="product-image" />
    </div>
    <div class="product-info">
      <h2>{{ product.name }}</h2>
      <p>{{ product.description }}</p>
      <p><strong>Prix :</strong> ${{ product.price }}</p>
      <div v-if="product.reference === 'chaussure'" class="sizes-container">
        <p><strong>Tailles disponibles :</strong></p>
        <div
          class="size"
          v-for="size in ['38', '39', '40', '41', '42', '43']"
          :key="size"
          @click="selectSize(size)"
        >
          {{ size }}
        </div>
      </div>
      <div class="button-container">
        <button @click="() => addToCart(1)" class="add-to-cart">Ajouter au Panier</button>
        <div class="favorite-container">
          <button
            v-if="isFavorite"
            @click.stop="removeFromFavorites(product.id)"
            class="remove-from-favorites"
          >
            <i class="fas fa-heart"></i> Ajouté aux Favoris
          </button>
          <button v-else @click.stop="addToFavorites(product.id)" class="add-to-favorites">
            <i class="far fa-heart"></i> Ajouter aux Favoris
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-page {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.product-image-container {
  margin-right: 20px;
}

.product-image {
  max-width: 600px;
  width: 100%;
  height: auto;
}

.product-info {
  text-align: center;
}

.product-info h2 {
  margin-top: 0;
}

.product-info p {
  margin-bottom: 10px;
}

.sizes-container {
  margin-top: 20px;
}

.size {
  display: inline-block;
  background-color: #eee;
  padding: 5px 10px;
  margin-right: 10px;
  border-radius: 5px;
  cursor: pointer;
}

.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.add-to-cart,
.add-to-favorites,
.remove-from-favorites {
  padding: 10px 30px;
  margin: 0 10px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-to-cart {
  background-color: #000;
  color: white;
}

.add-to-favorites {
  background-color: #ff99cc;
  color: white;
  display: flex;
  align-items: center;
}

.remove-from-favorites {
  background-color: #ff9999;
  color: white;
  display: flex;
  align-items: center;
}

.fa-heart {
  margin-right: 5px;
}

.add-to-cart:hover,
.add-to-favorites:hover,
.remove-from-favorites:hover {
  opacity: 0.8;
}
</style>
