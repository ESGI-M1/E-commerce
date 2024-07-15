<script setup lang="ts">

import BreadCrumb from './BreadCrumb.vue';

import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Cookies from 'js-cookie';

const route = useRoute();
const router = useRouter();
const isFavorite = ref(false);
const productId = ref(route.params.id as string);
let user = JSON.parse(Cookies.get('USER').substring(2)).id;

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  reference: string;
  comments: string[];
  Categories: number[];
};

const product = ref<Product>({
  id: '',
  name: '',
  description: '',
  price: 0,
  reference: '',
  comments: [],
  Categories: [],
});

const fetchProductById = async (id: string) => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/${id}`);
  product.value = response.data;

  if (user) {
    const favoriteResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/favorites`);
    const favoriteProductIds = favoriteResponse.data.map((fav: any) => fav.productId);
    isFavorite.value = favoriteProductIds.includes(product.value.id);
  }
};

const addToFavorites = async (productId: string) => {
  if (!user) {
    router.push('/login');
    return;
  }
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/favorites`, { productId });

    if (response.status === 201) {
      isFavorite.value = true;
      alert('Produit ajouté aux favoris avec succès');
    }
};

const removeFromFavorites = async (productId: string) => {
  if (!user) {
    throw new Error('User is not authenticated');
  }

  await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/favorites/${productId}`);
  isFavorite.value = false;
  alert('Produit supprimé des favoris avec succès');
};

const addToCart = async (quantity: number) => {
  if (!user) {
    if (localStorage.getItem('temporaryId')) {
      user = localStorage.getItem('temporaryId');
    } else {
      user = Math.floor(Math.random() * 2147483647).toString();
      localStorage.setItem('temporaryId', user);
    }
  }

  try {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/carts`, {
      userId: user,
      productId: product.value.id,
      quantity: quantity,
    });
    alert('Produit ajouté au panier avec succès');
    router.push('/cart');
  } catch (error) {
    alert("Échec de l'ajout du produit au panier");
  }
};

onMounted(() => {
  fetchProductById(productId.value);
});

</script>

<template>
  <BreadCrumb v-if="product.Categories && product.Categories[0]" :category="product.Categories[0]" />

  <div v-if="product" class="product-page">
    <img
      class="product-image"
      :src="product.Images && product.Images.length > 0 ? product.Images[0].url : '../../produit_avatar.jpg'"
      :alt="product.Images && product.Images.length > 0 ? product.Images[0].description : product.name"
    />

    <div class="product-infos">
      <h2>{{ product.name }}</h2>
      <p>{{ product.description }}</p>
      <p>Prix : {{ product.price }}€</p>

      <button @click="() => addToCart(1)" class="cart-actions">Ajouter au panier</button>

      <button v-if="isFavorite" @click.stop="removeFromFavorites(product.id)" class="favorite-actions">
        <i class="fas fa-heart"></i> Ajouté aux favoris
      </button>

      <button v-else @click.stop="addToFavorites(product.id)" class="favorite-actions">
        <i class="far fa-heart"></i> Ajouter aux favoris
      </button>
    </div>
  </div>
</template>

<style scoped>

.product-page {
  display: flex;
  flex-wrap: wrap;
}

.product-page > * {
  flex: 1 1 50%;
}

.product-image {
  max-width: 600px;
  width: 100%;
  height: auto;
}

.product-infos {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 0 72px;
}

.product-infos p {
  text-align: justify;
}

.cart-actions,
.favorite-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.cart-actions {
  background-color: #2F855A;
}

.favorite-actions {
  background-color: #000000;
}

.fa-heart {
  margin-right: 6px;
}

.cart-actions:hover,
.favorite-actions:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .product-page > * {
    flex: 1 1 100%;
  }
}

</style>
