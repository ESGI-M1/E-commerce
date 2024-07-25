<template>
  <nav class="navbar">
    <div class="navbar-section logo">
      <RouterLink :to="{ name: 'Accueil' }" class="nav-link"><img src="../../../logo.jpg" class="logo-img"></RouterLink>
    </div>

    <div class="navbar-section links">
      <!-- Navigation Links -->
      <div class="nav-item" v-for="category in shopStore.mainCategories" :key="category.id">
        <RouterLink :to="{ name: 'Category', params: { slug: category.slug }}" class="nav-link">{{ category.name }}</RouterLink>
        <div v-if="category.subCategories.length > 0" class="dropdown">
          <RouterLink v-for="subCategory in category.subCategories" :key="subCategory.id" :to="{ name: 'Category', params: { slug: subCategory.slug }}" class="dropdown-item">{{ subCategory.name }}</RouterLink>
        </div>
      </div>
    </div>

    <div class="navbar-section actions">
      <!-- Shopping Cart Icon -->
      <RouterLink :to="{ name: 'Panier' }" class="icon">
        <i class="fas fa-shopping-cart"></i>
        <span class="badge">{{ cartStore.getCartItemCount }}</span>
      </RouterLink>

      &nbsp;
      <!-- Search Bar -->
      <input
        type="text"
        v-model="productsStore.filter.q"
        @input="applyFilters"
        placeholder="Rechercher"
        class="search-bar"
      />

      <!-- Login Button or User Icon -->
      <div v-if="userStore.isAuthenticated" class="user-menu">
        <i class="fas fa-user"></i>
        <div class="dropdown">
          <RouterLink :to="{ name: 'Profile' }" class="dropdown-item">Mon profil</RouterLink>
          <RouterLink :to="{ name: 'Favoris' }" class="dropdown-item">Mes favoris</RouterLink>
          <RouterLink v-if="userStore.isAdmin" :to="{ name: 'Ressources' }" class="dropdown-item">Gestion des ressources</RouterLink>
          <RouterLink :to="{ name: 'Historique des commandes' }" class="dropdown-item">Historique des commandes</RouterLink>
          <RouterLink :to="{ name: 'Alerts' }" class="dropdown-item">Mes alertes</RouterLink>
          <a @click="showCookiePage" class="dropdown-item">Gestion des cookies</a>
          <a href="#" @click="logout" class="dropdown-item">Déconnexion</a>
        </div>
      </div>
      <RouterLink v-else :to="{ name: 'Identifier' }" class="login-button">Connexion</RouterLink>
    </div>
    <CookieComponent @closePage="closeCookiePage" v-if="showCookies"/>
  </nav>

  <!-- Dropdown Menu for Mobile -->
  <div class="mobile-menu">
    <div class="nav-item" v-for="category in shopStore.mainCategories" :key="category.id">
      <RouterLink :to="{ name: 'Category', params: { slug: category.slug }}" class="nav-link">{{ category.name }}</RouterLink>
      <div v-if="category.subCategories.length > 0" class="dropdown">
        <RouterLink v-for="subCategory in category.subCategories" :key="subCategory.id" :to="{ name: 'Category', params: { slug: subCategory.slug }}" class="dropdown-item">{{ subCategory.name }}</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '@/store/products'
import { useShopStore } from '@/store/shop'
import { useCartStore } from '@/store/cart'
import { useUserStore } from '@/store/user'
import Cookies from 'js-cookie'

import axios from 'axios'
import CookieComponent from '@/components/CookieComponent.vue'

const router = useRouter()
const productsStore = useProductsStore()
const shopStore = useShopStore()
const cartStore = useCartStore()
const userStore = useUserStore()
const showCookies = ref(false);

const applyFilters = () => {

productsStore.fetchProducts();
router.push({
  query: {
    q: productsStore.filter.q,
  }
});
};

const logout = () => {
  userStore.logout()
}

async function checkUserAsAcceptedCookie()  {
  const user = Cookies.get('USER') ? JSON.parse(Cookies.get('USER').substring(2)).id : null
  if (user) {
    const asCookie = await asAnyCookie(user);
    if (!asCookie) {
      showCookies.value = true
    }
  }F
}

async function asAnyCookie(userId: number) {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/cookie/user/${userId}`);
    if (response.data) {
      return true;
    }
  } catch (e) {
    return false;
  }
}

function showCookiePage() {
  showCookies.value = true;
}

function closeCookiePage() {
  showCookies.value = false;
}

onMounted(() => {
  cartStore.fetchCartItemsAuth()
  shopStore.fetchShop()
  userStore.fetchUser()
  checkUserAsAcceptedCookie()
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
  width: 40px;
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
  right: -20px;
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

/* Styles pour le menu burger */
.burger-menu {
  display: none;
  font-size: 24px;
  cursor: pointer;
}

.mobile-menu {
  display: none;
  gap: 10px;
  padding: 10px;
  background-color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .navbar {
    zoom: 0.8;
  }
  .links {
    display: none;
  }

  .burger-menu {
    display: block;
  }

  .mobile-menu {
    display: flex;
  }
}

</style>
