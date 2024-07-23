<script setup lang="ts">
import { ref, inject } from 'vue';
import Navbar from './components/navbar/NavbarComponent.vue';
import Footer from './components/navbar/FooterComponent.vue';
import Sidebar from './components/sidebar/SidebarComponent.vue';
import { sidebarWidth, isMobile } from './components/sidebar/state';
import NotificationComponent from './components/notification/NotificationComponent.vue';
import LoadingComponent from './components/loading/LoadingComponent.vue';
import { load } from './components/loading/loading';

const { loading } = load();
const notificationMessage = inject('notificationMessage', ref(''));
const notificationType = inject('notificationType', ref(''));
</script>

<template>
  <div>
    <Sidebar v-if="$route.meta.requiresAdmin || isMobile" />
    <Navbar />
    <div
      :style="{
        marginLeft: $route.meta.requiresAdmin && !isMobile ? sidebarWidth : '0',
        transition: 'margin-left 0.3s ease'
      }"
    >
      <router-view />
    </div>
  </div>
  <Footer v-if="!$route.meta.requiresAdmin" />
  <LoadingComponent :loading="loading" />
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
