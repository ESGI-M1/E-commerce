<template>
  <div>
    <Sidebar v-if="isAdminRoute" />
    <Navbar v-else />
    <div :id="isAdminRoute ? 'admin-content' : 'main-content'">
      <router-view />
    </div>
  </div>
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

#main-content {
  padding: 1em;
}

#admin-content {
  margin-left: 200px;
  padding: 1em;
  transition: margin-left 0.3s ease;
}

@media (max-width: 768px) {
  #admin-content {
    margin-left: 0;
  }

  .sidebar {
    width: 100%;
    position: relative;
  }
}

@media (min-width: 769px) {
  #admin-content {
    margin-left: 200px;
  }

  .sidebar {
    width: 200px;
    position: fixed;
  }
}

</style>
