<script setup lang="ts">
import Navbar from './components/navbar/NavbarComponent.vue'
import Footer from './components/navbar/FooterComponent.vue'
</script>

<template>
  <Navbar />
  <div>
    <Sidebar v-if="isAdminRoute" />
    <Navbar v-else />
    <div :id="isAdminRoute ? 'admin-content' : 'main-content'">
      <router-view />
    </div>
  </div>
  <Footer v-if="!$route.meta.requiresAdmin" />
</template>

<script lang="ts">

import { defineComponent, computed } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/navbar/NavbarComponent.vue';
import Sidebar from './components/sidebar/SidebarComponent.vue';

export default defineComponent({
  components: {
    Navbar,
    Sidebar,
  },

  setup() {
    const route = useRoute();
    const isAdminRoute = computed(() => route.path.startsWith('/admin'));
    return { isAdminRoute };
  }
});

</script>

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
