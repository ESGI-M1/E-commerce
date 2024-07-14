<script setup lang="ts">
import Navbar from './components/navbar/NavbarComponent.vue'
import Footer from './components/navbar/FooterComponent.vue'
</script>

<template>
  <Navbar />
  <div>
    <router-view />
  </div>
  <Footer v-if="!$route.meta.requiresAdmin" />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
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
</style>
