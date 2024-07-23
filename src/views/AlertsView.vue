<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'

const alerts = ref<AlertSubscribe>([] as AlertSubscribe);

interface AlertSubscribe {
  id: number
  name: string,
  subscribe: boolean
}

interface Alert {
    id: number
    name: string,
  }

  async function changeStatus(id) {
    try {
      const userId = localStorage.getItem('authToken');
      if (!userId) {
        throw new Error('User is not authenticated')
      }
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/alerts/${userId}/${id}`);
    } catch (e) {
      console.error('Error update alerts:', e);
    }
  }

  async function getAllAlerts() {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/alerts/`)
      const alerts: Alert[] = response.data
      return alerts;
    } catch (e) {
      console.error('Error fetching alerts:', e);
    }
  }

  async function getUserAlerts() {
    try {
      const userId = localStorage.getItem('authToken')
      if (!userId) {
        throw new Error('User is not authenticated')
      }
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/alerts/${userId}`)
      return response.data;
    } catch (e) {
      console.error('Error fetching alerts:', e);
    }
  }

  onMounted(async () => {
    const allAlerts = await getAllAlerts();
    const userAlertsIds = await getUserAlerts();
    if (allAlerts != null) {
      for (let i = 0; i < allAlerts.length; i++) {
        if(userAlertsIds != null && userAlertsIds.includes(allAlerts[i].id)) {
          alerts.value.push({
            id: allAlerts[i].id,
            name: allAlerts[i].name,
            subscribe: true
          });
        } else {
          alerts.value.push({
            id: allAlerts[i].id,
            name: allAlerts[i].name,
            subscribe: false
          });
        }
      }
    }
  })
</script>

<template>
  <div class="background">
    <div class="container">
      <div class="container-header">
        <h1> Gestion des alertes </h1>
      </div>
      <div class="container-body">
        <ul>
          <li class="alertItem" v-for="alert in alerts">
            <div class="alertContainer">
              <div class="alertName">
                {{ alert.name }}
              </div>
              <div class="alertStatus">
                <label class="switch">
                  <input type="checkbox" :checked="alert.subscribe" @click="changeStatus(alert.id)">
                  <span></span>
                </label>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .background {
    height: 90vh;
    display: flex;
    justify-content: center;
  }

  .container {
    background-color: white;
    margin-top: 20px;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    padding: 20px;
    width: 800px;
    height: fit-content;
  }

  .container-header {
    text-align: center;
  }

  .alertItem {
    list-style: none;
    display: flex;
    justify-content: center;
  }

  .alertContainer {
    width: 300px;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    padding: 10px;
  }

  .switch {
    display: inline-block;
    position: relative;
    width: 55px;
    height: 30px;
    cursor: pointer;
    overflow: hidden;
  }

  .switch input {
    position: absolute;
    top: -30px;
    left: -30px;
    width: 0;
    height: 0;
  }

  .switch input + span {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: #99b4df;
    border-radius: 20px;
  }

  .switch input + span:before {
    content: "";
    display: inline-block;
    position: absolute;
    top: 50%;
    left: 4px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transform: translateY(-50%);
    transition: all .5s;
  }

  .switch input:checked + span:before {
    left: 30px;
  }

  .switch input:checked + span {
    background: #007bff;
  }




</style>