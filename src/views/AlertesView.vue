<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'

const alertes = ref<AlerteSubscribe>([] as AlerteSubscribe);

interface AlerteSubscribe {
  id: number
  name: string,
  subscribe: boolean
}

interface Alerte {
    id: number
    name: string,
  }

  async function changeStatus(id) {
    try {
      const userId = localStorage.getItem('authToken');
      if (!userId) {
        throw new Error('User is not authenticated')
      }
      await axios.post(`http://localhost:3000/alertes/${userId}/${id}`);
    } catch (e) {
      console.error('Error update alerts:', e);
    }
  }

  async function getAllAlertes() {
    try {
      const response = await axios.get(`http://localhost:3000/alertes/`)
      const alertes: Alerte[] = response.data
      return alertes;
    } catch (e) {
      console.error('Error fetching alerts:', e);
    }
  }

  async function getUserAlertes() {
    try {
      const userId = localStorage.getItem('authToken')
      if (!userId) {
        throw new Error('User is not authenticated')
      }
      const response = await axios.get(`http://localhost:3000/alertes/${userId}`)
      return response.data;
    } catch (e) {
      console.error('Error fetching alerts:', e);
    }
  }

  onMounted(async () => {
    const allAlertes = await getAllAlertes();
    const userAlertesIds = await getUserAlertes();
    if (allAlertes != null) {
      for (let i = 0; i < allAlertes.length; i++) {
        if(userAlertesIds != null && userAlertesIds.includes(allAlertes[i].id)) {
          alertes.value.push({
            id: allAlertes[i].id,
            name: allAlertes[i].name,
            subscribe: true
          });
        } else {
          alertes.value.push({
            id: allAlertes[i].id,
            name: allAlertes[i].name,
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
          <li class="alertItem" v-for="alerte in alertes">
            <div class="alertContainer">
              <div class="alertName">
                {{ alerte.name }}
              </div>
              <div class="alertStatus">
                <label class="switch">
                  <input type="checkbox" :checked="alerte.subscribe" @click="changeStatus(alerte.id)">
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