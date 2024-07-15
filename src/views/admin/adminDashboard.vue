<template>
  <Sidebar />

  <h1>Tableau de bord</h1>
  <div class="text-right">
    <button @click="showAddWidget = !showAddWidget" class="btn btn-success">
      <i class="fa fa-plus"></i> Ajouter un widget
    </button>
  </div>
  <GridLayout v-model:layout="userDashboard" :row-height="40">
    <template #item="{ item }">
      <div class="widget-container">
        <ChartWidget 
          v-if="item.type === 'Chart' && !item.call" 
          :data="item.data" 
          :labels="item.labels" 
          :title="item.title" 
        />
        <ChartWidget 
          v-if="item.type === 'Chart' && item.call && callData[item.call]" 
          :data="callData[item.call].data" 
          :labels="callData[item.call].labels" 
          :title="item.title" 
        />
        <FancyConfirm
    :confirmationMessage="'Etes-vous sûr de vouloir supprimer l\'élément ?'"
    :elementType="'button'"
    @confirmed="removeWidget(item.i)"
  >
    <template #buttonText class="test">
      X
    </template>
  </FancyConfirm>
      </div>
    </template>
  </GridLayout>
  <div class="text-center">
     <FancyConfirm
    :class="'btn btn-danger'"
    :confirmationMessage="'Etes-vous sûr de vouloir sauvegarder le tableau de bord ?'"
    :elementType="'button'"
    @confirmed="saveDashboard"
  >
    <template #buttonText>
      <i class="fa fa-save"></i> Sauvegarder
    </template>
  </FancyConfirm>
</div>
  <div class="add-widget-container">
    <div v-if="showAddWidget" class="modal-overlay">
      <div class="modal">
        <div class="modal-content">
          <span class="close" @click="showAddWidget = false">&times;</span>
          <h2>Ajouter un widget</h2>
          <div class="widget-options">
            <label class="widget-option">
              <input type="radio" value="totalOrders" v-model="selectedWidget" />
              Commandes
            </label>
            <label class="widget-option">
              <input type="radio" value="totalEarn" v-model="selectedWidget" />
              Revenus
            </label>
            <label class="widget-option">
              <input type="radio" value="totalUsers" v-model="selectedWidget" />
              Utilisateurs
            </label>
            <button @click="addWidget" class="btn btn-primary">Ajouter</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from '../../tools/axios';
import { useUserStore } from '@/store/user';
import { GridLayout } from 'grid-layout-plus';
import ChartWidget from '../../../src/layout/dashboard/Chart.vue';
import FancyConfirm from '../../components/ConfirmComponent.vue';
import Sidebar from '../../../src/components/sidebar/SidebarComponent.vue';

const userStore = useUserStore();
const showAddWidget = ref(false);
const userDashboard = ref([]);
const callData = ref({});
const callInProgress = ref({});
const selectedWidget = ref('');
let totalData = ref({ labels: [], totalOrders: [], totalEarn: [], totalUsers: [] });

const saveDashboard = async () => {
  userStore.patch({ dashboard: userDashboard.value });
};

const fetchDashboard = async () => {
  const dashboard = await userStore.fetchDashboard();
  if (dashboard) {
    userDashboard.value = dashboard;
  } else {
    const newDashboard = [];
    if (totalData.value.totalOrders && totalData.value.totalOrders.length > 0) {
      newDashboard.push({ 
        x: 0, y: 0, w: 3, h: 3, i: '0', type: 'Chart', 
        labels: totalData.value.labels,
        data: totalData.value.totalOrders,
        title: "Commandes" 
      });
    }
    if (totalData.value.totalEarn && totalData.value.totalEarn.length > 0) {
      newDashboard.push({ 
        x: 3, y: 0, w: 3, h: 3, i: '1', type: 'Chart', 
        labels: totalData.value.labels,
        data: totalData.value.totalEarn, 
        title: "Revenus" 
      });
    }
    if (totalData.value.totalUsers && totalData.value.totalUsers.length > 0) {
      newDashboard.push({ 
        x: 6, y: 0, w: 3, h: 3, i: '2', type: 'Chart', 
        labels: totalData.value.labels,
        data: totalData.value.totalUsers, 
        title: "Utilisateurs" 
      });
    }
    userDashboard.value = newDashboard;
  }
};

const getData = async (calls) => {
  const callString = calls.join(',');
  if (callInProgress.value[callString]) return;
  if (callData.value[callString]) return callData.value[callString];

  callInProgress.value[callString] = true;

  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/stats`, {
      params: { params: callString }
    });

    callData.value[callString] = response.data;
    totalData.value = response.data;
    return response.data;
  } catch (error) {
    console.error(error);
  } finally {
    callInProgress.value[callString] = false;
  }
};

const addWidget = async () => {
  if (!selectedWidget.value) return;

  const existingWidget = userDashboard.value.find(widget => {
    if (selectedWidget.value === 'totalOrders' && widget.type === 'Chart' && widget.title === 'Commandes') {
      return true;
    }
    if (selectedWidget.value === 'totalEarn' && widget.type === 'Chart' && widget.title === 'Revenus') {
      return true;
    }
    if (selectedWidget.value === 'totalUsers' && widget.type === 'Chart' && widget.title === 'Utilisateurs') {
      return true;
    }
    return false;
  });

  if (existingWidget) {
    showAddWidget.value = false;
    return;
  }

  await getData([selectedWidget.value]);

  if (selectedWidget.value === 'totalOrders' && totalData.value.totalOrders) {
    userDashboard.value.push({ 
      x: 0, y: 0, w: 3, h: 3, i: `${userDashboard.value.length}`, type: 'Chart', 
      labels: totalData.value.labels,
      data: totalData.value.totalOrders,
      title: "Commandes" 
    });
  }

  if (selectedWidget.value === 'totalEarn' && totalData.value.totalEarn) {
    userDashboard.value.push({ 
      x: 0, y: 0, w: 3, h: 3, i: `${userDashboard.value.length}`, type: 'Chart', 
      labels: totalData.value.labels,
      data: totalData.value.totalEarn, 
      title: "Revenus" 
    });
  }

  if (selectedWidget.value === 'totalUsers' && totalData.value.totalUsers) {
    userDashboard.value.push({ 
      x: 0, y: 0, w: 3, h: 3, i: `${userDashboard.value.length}`, type: 'Chart', 
      labels: totalData.value.labels,
      data: totalData.value.totalUsers, 
      title: "Utilisateurs" 
    });
  }

  showAddWidget.value = false;
};


const removeWidget = (index) => {
  userDashboard.value = userDashboard.value.filter(item => item.i !== index);
};

onMounted(() => {
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

h1 {
  text-align: center;
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

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.widget-container {
  position: relative;
}

.remove-button {
  position: absolute;
  top: 5px;
  right: 5px;
}

.widget-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background-color: white;
  border-radius: 5px;
}

.widget-option {
  background-color: white;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  display: flex;
  align-items: center;
}

.widget-option input {
  margin-right: 10px;
}

div.widget-container div {
  position: absolute;
  top: 0;
  right: 0;
}
</style>