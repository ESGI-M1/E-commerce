<script setup lang="ts">
import BreadCrumb from './BreadCrumb.vue'
import { ref, onMounted, inject, type UnwrapRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '../tools/axios'
import Cookies from 'js-cookie'

const route = useRoute()
const router = useRouter()
const isFavorite = ref(false)
const productId = ref(route.params.id as string)
let user = Cookies.get('USER') ? JSON.parse(Cookies.get('USER').substring(2)).id : null
const showNotification = inject('showNotification');

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  reference: string;
  comments: string[];
  Categories: number[];
};

const product = ref<Product>({
  id: '',
  name: '',
  description: '',
  price: 0,
  reference: '',
  comments: [],
  Categories: [],
});

const alerts = ref<AlertSubscribe>([] as AlertSubscribe);

interface AlertSubscribe {
  id: number
  name: string,
  description: string
  subscribe: boolean
}

interface Alert {
  id: number
  name: string,
  description: string
}

const fetchProductById = async (id: string) => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products/${id}`);
  product.value = response.data;

  if (user) {
    const favoriteResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/favorites`);
    const favoriteProductIds = favoriteResponse.data.map((fav: any) => fav.productId);
    isFavorite.value = favoriteProductIds.includes(product.value.id);
  }
};

async function fetchAlertUserProduct(alertId: string, userId: string, productId: string) {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/alerts/${alertId}/user/${userId}/product/${productId}`);
    return response.data;
  } catch (e) {
    return undefined;
  }
}

const addToFavorites = async (productId: string) => {
  if (!user) {
    router.push('/login');
    return;
  }
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/favorites`, { productId });

    if (response.status === 201) {
      isFavorite.value = true
      showNotification('Produit ajouté aux favoris avec succès', 'success');
    }
};

const removeFromFavorites = async (productId: string) => {
  if (!user) {
    throw new Error('User is not authenticated');
  }

  await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/favorites/${productId}`)
  isFavorite.value = false
  showNotification('Produit supprimé des favoris avec succès', 'success');
}

const addToCart = async (quantity: number) => {
  if (!user) {
    if (localStorage.getItem('temporaryId')) {
      user = localStorage.getItem('temporaryId');
    } else {
      user = Math.floor(Math.random() * 2147483647).toString();
      localStorage.setItem('temporaryId', user);
    }
  }

  try {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/carts`, {
      userId: user,
      productId: product.value.id,
      quantity: quantity
    })
    showNotification('Produit ajouté au panier avec succès', 'success');
  } catch (error) {
    showNotification('Échec de l\'ajout du produit au panier', 'error');
  }
};

async function getProductAlerts() {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/alerts/`)
    const alerts: Alert[] = response.data;
    const productAlert = []
    if (alerts) {
      for (let i = 0; i < alerts.length; i++) {
        if (alerts[i].name === "restock_product" || alerts[i].name == "change_product_price") {
          productAlert.push(alerts[i]);
        }
      }
    }
    return productAlert;
  } catch (e) {
    console.error('Error fetching alerts:', e);
  }
}

async function changeStatus(id: number, productId: UnwrapRef<Product['id']>) {
  try {
    if (!user) {
      throw new Error('User is not authenticated')
    }
    const alertCheck = document.getElementById(`alert${id}`);
    if (alertCheck) {
      if (alertCheck.checked === true) {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/alerts/${id}/user/${user}/product/${productId}`);
      } else {
        await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/alerts/${id}/user/${user}/product/${productId}`);
      }
    }
  } catch (e) {
    console.error('Error update alerts:', e);
  }
}

async function initAlerts() {
  if (user) {
    const alertsProduct = await getProductAlerts();
    if (alertsProduct) {
      for (let i = 0; i < alertsProduct.length; i++) {
        let userSubscribe = await fetchAlertUserProduct(String(alertsProduct[i].id), user, productId.value);
        if (userSubscribe) {
          alerts.value.push({
            id: alertsProduct[i].id,
            name: alertsProduct[i].name,
            description: alertsProduct[i].description,
            subscribe: true
          });
        } else {
          alerts.value.push({
            id: alertsProduct[i].id,
            name: alertsProduct[i].name,
            description: alertsProduct[i].description,
            subscribe: false
          });
        }
      }
    }
  }
}

onMounted(async () => {
  fetchProductById(productId.value);
  initAlerts();
});
</script>

<template>
  <BreadCrumb v-if="product.Categories && product.Categories[0]" :category="product.Categories[0]" />

  <div v-if="product" class="product-page">
    <img
      class="product-image"
      :src="product.Images && product.Images.length > 0 ? product.Images[0].url : '../../produit_avatar.jpg'"
      :alt="product.Images && product.Images.length > 0 ? product.Images[0].description : product.name"
    />

    <div class="product-infos">
      <h2>{{ product.name }}</h2>
      <p>{{ product.description }}</p>
      <p>Prix : {{ product.price }}€</p>

      <button @click="() => addToCart(1)" class="cart-actions">Ajouter au panier</button>

      <button v-if="isFavorite" @click.stop="removeFromFavorites(product.id)" class="favorite-actions">
        <i class="fas fa-heart"></i> Ajouté aux favoris
      </button>

      <button v-else @click.stop="addToFavorites(product.id)" class="favorite-actions">
        <i class="far fa-heart"></i> Ajouter aux favoris
      </button>

      <div v-if="alerts && alerts.length > 0">
        <h2>Alertes</h2>
        <ul>
          <li class="alertItem" v-for="alert in alerts">
            <div class="alertContainer">
              <div class="alertName">
                {{ alert.description }}
              </div>
              <div class="alertStatus">
                <label class="switch">
                  <input :id="'alert' + alert.id" type="checkbox" :checked="alert.subscribe" @click="changeStatus(alert.id, product.id)">
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

.product-page {
  display: flex;
  flex-wrap: wrap;
}

.product-page > * {
  flex: 1 1 50%;
}

.product-image {
  max-width: 600px;
  width: 100%;
  height: auto;
}

.product-infos {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 0 72px;
}

.product-infos p {
  text-align: justify;
}

.cart-actions,
.favorite-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.cart-actions {
  background-color: #2F855A;
}

.favorite-actions {
  background-color: #000000;
}

.fa-heart {
  margin-right: 6px;
}

.cart-actions:hover,
.favorite-actions:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .product-page > * {
    flex: 1 1 100%;
  }
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
