<script setup lang="ts">
import { ref, inject } from 'vue';
import Navbar from './components/navbar/NavbarComponent.vue'
import Footer from './components/navbar/FooterComponent.vue'
import Sidebar from './components/sidebar/SidebarComponent.vue'
import { sidebarWidth } from './components/sidebar/state'
import NotificationComponent from './components/notification/NotificationComponent.vue'

const notificationMessage = inject('notificationMessage', ref(''));
const notificationType = inject('notificationType', ref(''));
</script>

<template>
  <div>
    <Sidebar v-if="$route.meta.requiresAdmin" />
    <Navbar />
    <div
      :style="$route.meta.requiresAdmin
      ? { marginLeft: sidebarWidth, transition: 'margin-left 0.3s ease' }
      : { transition: 'margin-left 0.3s ease' }"
    >
      <router-view />
    </div>
  </div>
  <Footer v-if="!$route.meta.requiresAdmin" />
  <NotificationComponent :message="notificationMessage" :type="notificationType" />
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
