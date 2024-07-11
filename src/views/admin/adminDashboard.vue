<template>

    <h1>Tableau de bord</h1>
    <GridLayout v-model:layout="userDashboard" :row-height="40">
        <template #item="{ item }">
            <ChartWidget v-if="item.type === 'Chart'" :title="item.title" :values="item.data" :labels="item.labels"/>
        </template>
    </GridLayout>

    <button @click="saveDashboard">Sauvegarder</button>

    <div>
      <a @click="showAddWidget = !showAddWidget">
        <i class="fa fa-plus"></i>
      </a>

      <div v-if="showAddWidget">
          toto
      </div>
    </div>

</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import z from 'zod';
import axios from '../../axios';
import { useUserStore } from '@/store/user';

import { GridLayout, GridItem } from 'grid-layout-plus'
import ChartWidget from '../../../src/layout/dashboard/Chart.vue';
import FancyConfirm from '../components/ConfirmComponent.vue';

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
  labels: z.array(z.string()),
  data: z.array(z.number()),
})
const userDashboard = ref([]);


userDashboard.value = reactive([
  { x: 0, y: 0, w: 3, h: 3, i: '0', type: 'Chart', labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'], data: [65, 59, 80, 81, 56, 55, 40] , title:"Commandes"},
  { x: 3, y: 0, w: 3, h: 3, i: '1'},
  { x: 6, y: 0, w: 3, h: 3, i: '2'}
])

const saveDashboard = async () => {
  userStore.patch(userDashboard);
}

const fetchDashboard = async () => {
  return await userStore.getDashboard;
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