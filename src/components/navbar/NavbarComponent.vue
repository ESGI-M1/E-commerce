<template>
  <nav class="navbar">
    <div class="navbar-section logo">
      <a href="/" class="nav-link">Accueil</a>
      <!-- Logo -->
    </div>

    <div class="navbar-section links">
      <!-- Navigation Links -->
      <div class="nav-item">
        <a href="#" class="nav-link">Homme</a>
        <div class="dropdown">
          <a href="#" class="dropdown-item">Vêtements</a>
          <a href="#" class="dropdown-item">Chaussures</a>
          <a href="#" class="dropdown-item">Accessoires</a>
        </div>
      </div>
      <div class="nav-item">
        <a href="#" class="nav-link">Femme</a>
        <div class="dropdown">
          <a href="#" class="dropdown-item">Vêtements</a>
          <a href="#" class="dropdown-item">Chaussures</a>
          <a href="#" class="dropdown-item">Accessoires</a>
        </div>
      </div>
      <div class="nav-item">
        <a href="#" class="nav-link">Enfant</a>
        <div class="dropdown">
          <a href="#" class="dropdown-item">Vêtements</a>
          <a href="#" class="dropdown-item">Chaussures</a>
          <a href="#" class="dropdown-item">Accessoires</a>
        </div>
      </div>
      <div class="nav-item">
        <a href="#" class="nav-link">Nouveauté</a>
      </div>
      <div class="nav-item">
        <a href="#" class="nav-link">Promotion</a>
        <div class="dropdown">
          <a href="#" class="dropdown-item">Offres Spéciales</a>
          <a href="#" class="dropdown-item">Soldes</a>
        </div>
      </div>
    </div>

    <div class="navbar-section actions">
      <!-- Shopping Cart Icon -->
      <a class="icon" href="/cart">
  <i class="fas fa-shopping-cart"></i>
  <span class="badge">{{ cartsNumber }}</span>
</a>

      &nbsp;
      <!-- Search Bar -->
      <input
        type="text"
        v-model="search"
        @input="searchProducts"
        placeholder="Rechercher"
        class="search-bar"
      />

      <!-- Login Button or User Icon -->
      <div v-if="isAuthenticated" class="user-menu">
        <i class="fas fa-user"></i>
        <div class="dropdown">
          <RouterLink to="/profile" class="dropdown-item">Mon profil</RouterLink>
          <RouterLink to="/favorites" class="dropdown-item">Mes favoris</RouterLink>
          <RouterLink to="/ressources" v-if="isAdmin" class="dropdown-item">Gestion des ressources</RouterLink>
          <RouterLink to="order" class="dropdown-item">Historique des commandes</RouterLink>
          <a :href="'/alerts'" class="dropdown-item">Mes alertes</a>
          <RouterLink to="/admin/ressources" v-if="isAdmin" class="dropdown-item">Gestion des ressources</RouterLink>
          <RouterLink to="/order" class="dropdown-item">Historique des commandes</RouterLink>
          <a :href="'/alertes'" class="dropdown-item">Mes alertes</a>
          <a href="#" @click="logout" class="dropdown-item">Déconnexion</a>
        </div>
      </div>
      <RouterLink v-else to="/login" class="login-button">S'identifier</RouterLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '@/store/products'
import Cookies from 'js-cookie'

import axios from 'axios'

const router = useRouter()
const search = ref('')
const productsStore = useProductsStore()
const cartsNumber = ref(null)

const searchProducts = async () => {
  // route search
  if (router.currentRoute.value.name !== 'Search') {
    router.push('/search')
  }

  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/search?q=${search.value}`)
    productsStore.setProducts(response.data)
    productsStore.setFilter({ name: search.value })
  } catch (error) {
    console.error('Error fetching products:', error)
  }
}

const fetchCartItems = async () => {
  const authToken = Cookies.get('USER') ? JSON.parse(Cookies.get('USER').substring(2)).id : localStorage.getItem('temporaryId')
  cartsNumber.value = null;

  if (authToken) {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/carts/${authToken}`);

    if (response.data && response.data.length > 0) {
      response.data[0].CartProducts.forEach(CartProduct => {
        cartsNumber.value += CartProduct.quantity;
      });
    } else {
      cartsNumber.value = null;
    }
    } catch (error) {
      cartsNumber.value = null;
    }
  }
};

const isAuthenticated = computed(() => {
  return Cookies.get('USER') !== undefined
})  

const isAdmin = computed(() => {
  const user = JSON.parse(Cookies.get('USER').slice(2))
  return user.role === 'admin'
})

const logout = () => {
  Cookies.remove('USER')
  router.push('/')
}

onMounted(() => {
  fetchCartItems()
})
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: white;
  color: black;
  width: 100%;
  box-sizing: border-box;
  border-bottom: 1px solid #ddd;
}

.navbar-section {
  display: flex;
  align-items: center;
}

.logo-img {
  height: 40px;
}

.links {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  position: relative;
}

.nav-item {
  position: relative;
}

.nav-link {
  margin: 0 15px;
  color: black;
  text-decoration: none;
  position: relative;
}

.nav-link:hover {
  color: #42b983;
}

.dropdown {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 1;
  min-width: 160px;
  border-radius: 4px;
  overflow: hidden;
  z-index: 10000;
}

.dropdown-item {
  padding: 10px 20px;
  color: black;
  text-decoration: none;
  display: block;
}

.dropdown-item:hover {
  background-color: #f1f1f1;
}

.nav-item:hover .dropdown,
.user-menu:hover .dropdown {
  display: block;
}

.actions {
  display: flex;
  align-items: center;
}

.cart-icon {
  font-size: 24px;
  margin-right: 10px;
}

.search-bar {
  padding: 5px 10px;
  margin-right: 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
  outline: none;
}

.login-button {
  padding: 10px 20px;
  background-color: #42b983;
  border: none;
  border-radius: 20px;
  color: white;
  cursor: pointer;
}

.login-button:hover {
  background-color: #36a67d;
}

.user-menu {
  position: relative;
}

.user-menu i {
  font-size: 24px;
  cursor: pointer;
}

.icon {
  position: relative;
  display: inline-block;
}

.badge {
  position: absolute;
  top: -13px;
  right: -10px;
  padding: 5px 10px;
  border-radius: 50%;
  color: black;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>
