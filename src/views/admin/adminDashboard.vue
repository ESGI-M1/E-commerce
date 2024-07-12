<template>
  <Sidebar />

  <h1>Tableau de bord</h1>

  <GridLayout v-model:layout="userDashboard" :row-height="40">
    <template #item="{ item }">
      <ChartWidget v-if="item.type === 'Chart' && !item.call" :data="item.data" :labels="item.labels" :title="item.title" />
      <ChartWidget v-if="item.type === 'Chart' && item.call && callData[item.call]" :data="callData[item.call].data" :labels="callData[item.call].labels" :title="item.title" />
    </template>
  </GridLayout>

  <FancyConfirm
    :class="'a-danger'"
    :confirmationMessage="'Etes-vous sûr de vouloir sauvegarder le tableau de bord ?'"
    :elementType="'a'"
    @confirmed="saveDashboard"
  >
    <template #buttonText>
      <i class="fa fa-save"></i>
    </template>
  </FancyConfirm>

  <div>
    <a @click="showAddWidget = !showAddWidget">
      <i class="fa fa-plus"></i>
    </a>

    <div v-if="showAddWidget">
      TODO
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import z from 'zod';
import axios from '../../tools/axios';
import { useUserStore } from '@/store/user';

import { GridLayout } from 'grid-layout-plus'
import ChartWidget from '../../../src/layout/dashboard/Chart.vue';
import FancyConfirm from '../../components/ConfirmComponent.vue'
import Sidebar from '../../../src/components/sidebar/SidebarComponent.vue';

const userStore = useUserStore();
const showAddWidget = ref(false);
const userDashboard = ref([]);
const callData = ref({});
const callInProgress = ref({});
let totalData = ref({ labels: [], data: [] });

const saveDashboard = async () => {
  userStore.patch({ dashboard: userDashboard.value });
};

const fetchDashboard = async () => {
  const dashboard = await userStore.fetchDashboard();
  if (dashboard) {
    userDashboard.value = dashboard;
  } else {
    userDashboard.value = [
      { 
        x: 0, y: 0, w: 3, h: 3, i: '0', type: 'Chart', 
        labels: totalData.value.labels,
        data: totalData.value.totalOrders,
        title: "Commandes" 
      },
      { 
        x: 3, y: 0, w: 3, h: 3, i: '1', type: 'Chart', 
        labels: totalData.value.labels,
        data: totalData.value.totalEarn, 
        title: "Revenus" 
      },
    ];
  }
};

const getData = async (call: string) => {
  if (callInProgress.value[call]) return;
  if (callData.value[call]) return callData.value[call];

  callInProgress.value[call] = true;

  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/stats/${call}`);
    callData.value[call] = response.data;
    totalData.value = response.data;
    return response.data;
  } catch (error) {
    console.error(error);
  } finally {
    callInProgress.value[call] = false;
  }
};

onMounted(() => {
  getData('orders');
  fetchDashboard();
});
</script>

<style scoped>
.vgl-layout {
  background-color: #eee;
}

:deep(.vgl-item:not(.vgl-item--placeholder)) {
  background-color: #ccc;
  border: 1px solid black;
}

:deep(.vgl-item--resizing) {
  opacity: 90%;
}

:deep(.vgl-item--static) {
  background-color: #cce;
}

.text {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: auto;
  font-size: 24px;
  text-align: center;
}
</style>
