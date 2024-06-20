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
      </a>
      &nbsp;
      <!-- Search Bar -->
      <input
        type="text"
        placeholder="Rechercher"
        class="search-bar"
      >

      <!-- Login Button or User Icon -->
      <div v-if="isAuthenticated" class="user-menu">
        <i class="fas fa-user"></i>
        <div class="dropdown">
          <a href="/profile" class="dropdown-item">Mon Profil</a>
          <a :href="'/favorite'" class="dropdown-item">Mes favoris</a>
          <a v-if="isAdmin" :href="'/ressources'" class="dropdown-item">Gestion des ressources</a>
          <a :href="'/order'" class="dropdown-item">Historique des commandes</a>
          <a href="#" @click="logout" class="dropdown-item">Déconnexion</a>
        </div>
      </div>
      <button v-else @click="redirectToLogin" class="login-button">S'identifier</button>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const isAuthenticated = ref(false);
const isAdmin = ref(false);
const router = useRouter();

const checkAuthStatus = () => {
  isAuthenticated.value = !!localStorage.getItem('authToken');
};

const redirectToLogin = () => {
  router.push('/identifier');
};

const logout = () => {
  // Logique de déconnexion
  localStorage.removeItem('authToken');
  isAuthenticated.value = false;
  router.push('/');
};

const checkIsAdmin = async () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    isAdmin.value = false;
    return;
  }

  try {
    const response = await axios.get(`http://localhost:3000/users/${authToken}`);
    const user = response.data;
    isAdmin.value = user && user.role === 'admin';
  } catch (error) {
    isAdmin.value = false;
  }
};

// Vérifier l'état de connexion et le rôle de l'utilisateur au montage du composant
onMounted(async () => {
  checkAuthStatus();
  await checkIsAdmin();
});
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
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  z-index: 1;
  min-width: 160px;
  border-radius: 4px;
  overflow: hidden;
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

.nav-item:hover .dropdown, .user-menu:hover .dropdown {
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
</style>
