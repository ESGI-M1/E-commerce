<template>
  <div class="sidebar">
    <SidebarLink to="/admin/" icon="fas fa-home">Accueil</SidebarLink>
    <hr>
    <SidebarLink to="/admin/users" icon="fas fa-users">Utilisateurs</SidebarLink>
    <hr>
    <SidebarLink to="/admin/products" icon="fas fa-shopping-cart">Produits</SidebarLink>
    <SidebarLink to="/admin/categories" icon="fas fa-tags">Catégories</SidebarLink>
    <hr>
    <SidebarLink to="/admin/orders" icon="fas fa-truck">Commandes</SidebarLink>
    <SidebarLink to="/admin/returns" icon="fas fa-undo">Retours</SidebarLink>
    <SidebarLink to="/admin/promos" icon="fas fa-percent">Codes promo</SidebarLink>
  </div>
</template>

<script lang="ts">

import SidebarLink from './SidebarLink.vue';
export default { components: { SidebarLink } }

</script>

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
  top: 0;
  left: 0;
  bottom: 0;
  width: 200px;
  padding: 1em 0.5em;

  transition: 0.3s ease;

  display: flex;
  flex-direction: column;
}

.sidebar h1 {
  height: 2.5em;
}

.sidebar hr {
  border: 0;
  border-top: 1px solid #ccc;
  margin: 1em 0.5em;
}

</style>
