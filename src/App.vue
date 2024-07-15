<template>
  <div>
    <Sidebar v-if="$route.meta.requiresAdmin" />
    <Navbar v-else />
    <div
      :style="$route.meta.requiresAdmin
      ? { marginLeft: sidebarWidth, transition: 'margin-left 0.3s ease' }
      : { transition: 'margin-left 0.3s ease' }"
    >
      <router-view />
    </div>
  </div>
  <Footer v-if="!$route.meta.requiresAdmin" />
</template>

<script lang="ts">

import { defineComponent } from 'vue';
import Navbar from './components/navbar/NavbarComponent.vue';
import Sidebar from './components/sidebar/SidebarComponent.vue';
import { sidebarWidth } from './components/sidebar/state';

export default defineComponent({
  components: { Navbar, Sidebar },
  setup() {
    return { sidebarWidth };
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
