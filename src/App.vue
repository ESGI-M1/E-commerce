<script lang="ts">
//import Sidebar from './components/sidebar/Sidebar.vue'
//import { sidebarWidth } from './components/sidebar/state'
import Navbar from './components/navbar/NavbarComponent.vue'

export default {
  //components: { Sidebar, Navbar},
  components: { Navbar }
  /*setup() {
    return { sidebarWidth }
  }*/
}
</script>
<template>
  <Navbar />
  <!--<Sidebar />-->
  <!--<div :style="{ 'margin-left': sidebarWidth }">-->
  <div class="background">
    <router-view />
  </div>
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

.background {
  height: 90vh;
}

</style>
