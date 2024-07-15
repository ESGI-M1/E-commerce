<script setup lang="ts">
import Navbar from './components/navbar/NavbarComponent.vue'
import Footer from './components/navbar/FooterComponent.vue'
import Sidebar from './components/sidebar/SidebarComponent.vue'

</script>

<template>
  <div>
    <Sidebar v-if="$route.meta.requiresAdmin" />
    <Navbar v-else />
    <div :id="$route.meta.requiresAdmin ? 'admin-content' : 'main-content'">
      <router-view />
    </div>
  </div>
  <Footer v-if="!$route.meta.requiresAdmin" />
</template>

<style>

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.background {
  height: 90vh;
}

</style>
