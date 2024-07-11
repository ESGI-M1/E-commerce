<template>

    <h1>Tableau de bord</h1>
    <GridLayout v-model:layout="userDashboard" :row-height="40">
        <template #item="{ item }">
            <ChartWidget v-if="item.type === 'Chart' && !item.call" :data="item.data" :labels="item.labels" :title="item.title" />
            <ChartWidget v-if="item.type === 'Chart' && item.call && getData(item.call)" :data="getData(item.call).data" :labels="getData(item.call).labels" :title="item.title" />
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

const userStore = useUserStore()
const showAddWidget = ref(false);
const enumType = ["Chart", "Table", "Text"];

const widget = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  i: z.string(),
  type: z.enum(enumType),
  call: z.string(),
  labels: z.array(z.string()),
  data: z.array(z.number()),
})

const userDashboard = ref([]);
const callData = ref([]);
const callInProgess = ref([]);

const saveDashboard = async () => {
  console.log(userDashboard.value);
  userStore.patch({dashboard: userDashboard.value});
}

const fetchDashboard = async () => {
  const dashboard = await userStore.fetchDashboard()

  if(dashboard) {
    userDashboard.value = dashboard;
  }
  else{
    userDashboard.value = [
      { x: 0, y: 0, w: 3, h: 3, i: '0', type: 'Chart', labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'], data: [65, 59, 80, 81, 56, 55, 40] , title:"Commandes"},
      { x: 3, y: 0, w: 3, h: 3, i: '1', type: 'Chart', call:'orders', title:"Commandes"},
      { x: 6, y: 0, w: 3, h: 3, i: '2'}
    ]
  }
}

const getData = async (call: string) => {

  if(callInProgess[call]) return;

  if(callData[call]) return callData[call];

  callInProgess[call] = true;

  axios.get(`${import.meta.env.VITE_API_BASE_URL}/stats/${call}`)
  .then((response) => {
    callData[call] = response.data;
    return response.data;
  })
  .catch((error) => {
    console.error(error);
  })
  .finally(() => {
    callInProgess[call] = false;
  });

}

onMounted(() => {
  fetchDashboard();
})


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