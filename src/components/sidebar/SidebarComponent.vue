<script lang="ts">
import SidebarLink from './SidebarLink.vue'
import { collapsed, toggleSidebar, sidebarWidth } from './state'

export default {
  props: {},
  components: { SidebarLink },
  setup() {
    return { collapsed, toggleSidebar, sidebarWidth }
  }
}
</script>

<template>
  <div class="sidebar" :class="{ collapsed: collapsed }" :style="{ width: sidebarWidth }">
    <h1>
      <span v-if="collapsed">
        <div>V</div>
        <div>S</div>
      </span>
      <span v-else>Menu</span>
    </h1>
  <SidebarLink to="/admin/users" icon="fas fa-users">Utilisateurs</SidebarLink>
  <SidebarLink to="/admin/products" icon="fas fa-box-open">Produits</SidebarLink>
  <SidebarLink to="/admin/orders" icon="fas fa-shopping-bag">Commandes</SidebarLink>
  <SidebarLink to="/admin/returns" icon="fas fa-undo">Retours</SidebarLink>
  <SidebarLink to="/admin/categories" icon="fas fa-th-list">Catégories</SidebarLink>
  <SidebarLink to="/admin/promos" icon="fas fa-tags">Promos</SidebarLink>
  </div>
  <span class="collapse-icon" :class="{ 'rotate-180': collapsed }" @click="toggleSidebar">
      <i class="fas fa-angle-double-left" />
    </span>
</template>

<style>
:root {
  --sidebar-bg-color: #2f855a;
  --sidebar-item-hover: #38a169;
  --sidebar-item-active: #276749;
}
</style>

<style scoped>
.sidebar {
  color: white;
  background-color: var(--sidebar-bg-color);
  float: left;
  position: fixed;
  z-index: 1;
  top: 58px;
  left: 0;
  bottom: 0;
  padding: 0.5em;
  transition: 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 0;
  padding: 0;
}

.sidebar h1 {
  height: 2.5em;
}

.collapse-icon {
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 0.75em;
  color: black;
  transition: 0.2s linear;
  z-index: 9999;
}

.rotate-180 {
  transform: rotate(180deg);
  transition: 0.2s linear;
}
</style>