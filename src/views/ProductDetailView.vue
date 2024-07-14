<script setup lang="ts">
import BreadCrumb from './BreadCrumb.vue'

import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '../tools/axios';
import Cookies from 'js-cookie'

const route = useRoute()
const router = useRouter()
const isFavorite = ref(false)
const productId = ref(route.params.id as string)
let user = Cookies.get('USER') ? JSON.parse(Cookies.get('USER').substring(2)).id : null

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  reference: string;
  comments: string[];
  Categories: number[];
}

const product = ref<Product>({
  id: '',
  name: '',
  description: '',
  price: 0,
  reference: '',
  comments: [],
  Categories: []
})

const fetchProductById = async (id: string) => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/${id}`)
  product.value = response.data

  if (user) {
    const favoriteResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/favorites`)
    const favoriteProductIds = favoriteResponse.data.map((fav: any) => fav.productId)
    isFavorite.value = favoriteProductIds.includes(product.value.id)
  }
}

const addToFavorites = async (productId: string) => {
  if (!user) {
    router.push('/login')
    return
  }
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/favorites`, {
      productId
    })

    if (response.status === 201) {
      isFavorite.value = true
      alert('Produit ajouté aux favoris avec succès')
    }
}

const removeFromFavorites = async (productId: string) => {
  if (!user) {
    throw new Error('User is not authenticated')
  }

  await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/favorites/${productId}`)
  isFavorite.value = false
  alert('Produit supprimé des favoris avec succès')
}

const addToCart = async (quantity: number) => {
  if (!user) {
    if (localStorage.getItem('temporaryId')) {
      user = localStorage.getItem('temporaryId')
    } else {
      user = Math.floor(Math.random() * 2147483647).toString()
      localStorage.setItem('temporaryId', user)
    }
  }

  try {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/carts`, {
      userId: user,
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
  <div v-if="product" class="product-page">
    <div class="product-image-container">
      <img :src="product.Images && product.Images.length > 0 ? product.Images[0].url : '../../produit_avatar.jpg'" 
      :alt="product.Images && product.Images.length > 0 ? product.Images[0].description : product.name" 
      class="product-image" 
      />
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
