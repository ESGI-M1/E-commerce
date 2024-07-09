<template>
  <div class="admin-dashboard">
    <!-- Liste des ressources -->
    <div class="resource-grid">
      <div class="resource-item" @click="navigateTo('/users')">
        <h1>Utilisateurs</h1>
      </div>
      <div class="resource-item" @click="navigateTo('/locker')">
        <h1>Produits</h1>
      </div>
      <div class="resource-item" @click="navigateTo('/orders')">
        <h1>Commandes</h1>
      </div>
      <div class="resource-item" @click="navigateTo('/returns')">
        <h1>Retours</h1>
      </div>
      <div class="resource-item" @click="navigateTo('/categories')">
        <h1>Catégories</h1>
      </div>
      <div class="resource-item" @click="navigateTo('/promos')">
        <h1>Promos</h1>
      </div>
    </div>

    <!-- Utilisation de VueGridLayout pour le dashboard personnalisable -->
    <vue-grid-layout
      class="dashboard"
      :layout.sync="layout"
      :col-num="12"
      :row-height="30"
      :margin="[20, 20]"
      :use-css-transforms="true"
    >
      <vue-grid-layout-item
        v-for="item in widgets"
        :key="item.i"
        :data-grid="item"
        :is="item.component"
        :props="item.props"
        class="widget"
      ></vue-grid-layout-item>
    </vue-grid-layout>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import VueGridLayout, { GridLayoutItem } from 'vue-grid-layout';
import ChartWidget from '../../../src/layout/dashboard/Chart.vue';

const widgets = [
  { i: 'widget1', x: 0, y: 0, w: 4, h: 4, component: 'WidgetA' },
  { i: 'widget2', x: 4, y: 0, w: 4, h: 4, component: 'WidgetB' },
  { i: 'widget3', x: 8, y: 0, w: 4, h: 4, component: 'WidgetC' },
  { i: 'widget4', x: 0, y: 4, w: 12, h: 6, component: ChartWidget, props: { title: 'Graphique des Ventes' } },
];

const router = useRouter();

const navigateTo = (route: string) => {
  router.push(route);
};

const layout = ref(widgets.map((widget) => ({ ...widget })));

</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.resource-item {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.2s;
}

.resource-item:hover {
  transform: scale(1.05);
}

.dashboard {
  margin-top: 40px;
}

.widget {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
}
</style>
