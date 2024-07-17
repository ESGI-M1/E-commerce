<script setup lang="ts">
  import axios from 'axios'
  import { onMounted, type Ref, ref, type UnwrapRef } from 'vue'
  import Cookies from 'js-cookie'

  const alerts = ref<AlertSubscribe>([] as AlertSubscribe);
  const alertsChangePrice = ref<AlertProduct>([] as AlertProduct);
  const alertsRestock = ref<AlertProduct>([] as AlertProduct);

  let user = Cookies.get('USER') ? JSON.parse(Cookies.get('USER').substring(2)).id : null

  interface AlertSubscribe {
    id: number
    name: string
    description: string
    subscribe: boolean
  }

  interface AlertProduct {
    alertUserId: number
    productId: number
    productName: string
    description: string
  }

  interface Alert {
    id: number
    name: string,
    description: string
  }

  async function changeStatus(id:number) {
    try {
      if (!user) {
        throw new Error('User is not authenticated')
      }
      const alertCheck = document.getElementById(`alert${id}`);
      if (alertCheck) {
        if (alertCheck.checked === true) {
          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/alerts/${id}/user/${user}`);
        } else {
          await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/alerts/${id}/user/${user}`);
        }
      }
    } catch (e) {
      console.error('Error update user alerts:', e);
    }
  }

  async function getAllAlerts() {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/alerts/`)
      const alerts: Alert[] = response.data;
      return alerts;
    } catch (e) {
      console.error('Error fetching alerts:', e);
    }
  }

  async function getGlobalAlerts(allAlerts: Array<Alert>) {
    const globalAlerts = [];
    if (allAlerts) {
      for (let i = 0; i < allAlerts.length; i++) {
        if (allAlerts[i].name === "news_letter" || allAlerts[i].name == "new_product") {
          globalAlerts.push(allAlerts[i]);
        }
      }
    }
    return globalAlerts;
  }

  async function getUserAlerts() {
    try {
      if (!user) {
        throw new Error('User is not authenticated')
      }
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/alerts/user/${user}`);
      return response.data;
    } catch (e) {
      console.error('Error fetching user alerts:', e);
    }
  }

  async function getAlertUserProduct(alertId: string) {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/alerts/${alertId}/user/${user}`);
      return response.data;
    } catch (e) {
      console.error('Error fetching user alerts product:', e);
    }
  }

  async function getProductAlertByAlertType(allAlerts: Array<Alert>, list: Ref<UnwrapRef<AlertProduct>>, type: string) {
    try {
      if (allAlerts) {
        let userAlert;
        for (let i = 0; i < allAlerts.length; i++) {
          if (allAlerts[i].name === type) {
            userAlert = allAlerts[i];
          }
        }
        if (userAlert) {
          const alertsUserProduct = await getAlertUserProduct(String(userAlert.id));
          let product;
          for (let i=0; i < alertsUserProduct.length; i++) {
            product = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/${alertsUserProduct[i].productId}`);
            list.value.push({
              alertUserId: userAlert.id,
              productId: alertsUserProduct[i].productId,
              productName: product.data.name,
              description: userAlert.description,
            });
          }
        }
      }
    } catch (e) {
      console.error('Error fetching product alerts:', e);
    }
  }

  async function getChangePriceAlerts(allAlerts: Array<Alert>) {
    await getProductAlertByAlertType(allAlerts, alertsChangePrice, "change_product_price");
  }

  async function getRestockAlerts(allAlerts: Array<Alert>) {
    await getProductAlertByAlertType(allAlerts, alertsRestock, "restock_product");
  }

  async function changeStatusAlertProduct(id: number, productId: number) {
    try {
      if (!user) {
        throw new Error('User is not authenticated')
      }
      const alertCheck = document.getElementById(`alert${id}product${productId}`);
      if (alertCheck) {
        if (alertCheck.checked === true) {
          await axios.post(`${import.meta.env.VITE_API_BASE_URL}/alerts/${id}/user/${user}/product/${productId}`);
        } else {
          await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/alerts/${id}/user/${user}/product/${productId}`);
        }
      }
    } catch (e) {
      console.error('Error update user alerts product :', e);
    }
  }

  async function initAlerts() {
    const allAlerts = await getAllAlerts();
    if (allAlerts) {
      const globalAlerts = await getGlobalAlerts(allAlerts);
      await getChangePriceAlerts(allAlerts);
      await getRestockAlerts(allAlerts);
      const userAlertsIds = await getUserAlerts();
      if (globalAlerts != null) {
        for (let i = 0; i < globalAlerts.length; i++) {
          if (userAlertsIds != null && userAlertsIds.includes(globalAlerts[i].id)) {
            alerts.value.push({
              id: globalAlerts[i].id,
              name: globalAlerts[i].name,
              description: globalAlerts[i].description,
              subscribe: true
            });
          } else {
            alerts.value.push({
              id: globalAlerts[i].id,
              name: globalAlerts[i].name,
              description: globalAlerts[i].description,
              subscribe: false
            });
          }
        }
      }
    }
  }

  onMounted(async () => {
    initAlerts();
  })
</script>

<template>
  <div class="background">
    <div class="container">
      <div class="container-header">
        <h1> Gestion des alertes </h1>
      </div>
      <div class="container-body">
        <div>
          <h2>Alertes globales</h2>
          <ul>
            <li class="alertItem" v-for="alert in alerts">
              <div class="alertContainer">
                <div class="alertName">
                  {{ alert.description }}
                </div>
                <div class="alertStatus">
                  <label class="switch">
                    <input :id="'alert' + alert.id" type="checkbox" :checked="alert.subscribe" @click="changeStatus(alert.id)">
                    <span></span>
                  </label>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div>
          <h2>Alertes de changement de prix</h2>
          <ul>
            <li v-for="alertChangePrice in alertsChangePrice">
              <div class="alertContainer">
                <div class="alertName">
                  {{ alertChangePrice.description }} {{ alertChangePrice.productName }}
                </div>
                <div class="alertStatus">
                  <label class="switch">
                    <input :id="'alert' + alertChangePrice.alertUserId + 'product' + alertChangePrice.productId" type="checkbox"
                           @click="changeStatusAlertProduct(alertChangePrice.alertUserId, alertChangePrice.productId)" checked>
                    <span></span>
                  </label>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div>
          <h2>Alertes de restock</h2>
          <ul>
            <li v-for="alertRestock in alertsRestock">
              <div class="alertContainer">
                <div class="alertName">
                  {{ alertRestock.description }} {{ alertRestock.productName }}
                </div>
                <div class="alertStatus">
                  <label class="switch">
                    <input :id="'alert' + alertRestock.alertUserId + 'product' + alertRestock.productId" type="checkbox"
                           @click="changeStatusAlertProduct(alertRestock.alertUserId, alertRestock.productId)" checked>
                    <span></span>
                  </label>
                </div>
              </div>
            </li>
          </ul>
        </div>
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