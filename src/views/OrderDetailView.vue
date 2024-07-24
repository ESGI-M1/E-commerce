<template>
  <div class="cart" v-if="!notFound">
    <header class="header">
      <h1>Ma commande n°{{ orderId }}</h1>
      <button v-if="order" @click="downloadInvoice(order.id)" class="btn-details">
        Télécharger ma facture
      </button>
      <p v-if="order">Date de la commande: {{ formatDate(order.createdAt) }} à {{formatHeure(order.createdAt)}}</p>
      <p class="payment-details" v-if="order && order.Payment">
        Paiement effectué via <span>{{ order.Payment.method }}</span>,
        <span>{{ order.Payment.currency }}</span>,
        <small><span>**** **** **** {{ order.Payment.cardLast4 }}</span></small>
      </p>
    </header>
    <div v-if="order" class="order-details">
      <h2>Détails de la commande</h2>
      <div v-if="order.addressOrder">
        <p>
          Adresse: {{ order.addressOrder.street }}, {{ order.addressOrder.postalCode }} {{ order.addressOrder.city }}, {{ order.addressOrder.country }}
        </p>
      </div>
      <small v-if="order.deliveryDate">
        {{ isFutureDate(order.deliveryDate) ? 'Livraison prévue le' : 'Livré le' }} {{ formatDate(order.deliveryDate) }}
        {{ isFutureDate(order.deliveryDate) ? '' : 'à ' + formatHeure(order.deliveryDate) }}
      </small>
      <div>
        Statut:
        <p :class="['order-status', order.status]">{{ order.status }}</p>
      </div>
      <div class="order-total">Total: {{ order.totalAmount }} €</div>
      <div v-for="cartProduct in order.Cart.CartProducts" :key="cartProduct.id" class="cart-item">
        <div v-if="cartProduct.productVariant.images && cartProduct.productVariant.images.length > 0" class="product-image-container">
          <img :src="imageUrl + cartProduct.productVariant.images[0].id"
               :alt="cartProduct.productVariant.images[0].description"
               class="product-image" />
        </div>
        <div class="item-details" @click="showProductDetails(cartProduct.productVariant.Product.id)">
          <h3>{{ cartProduct.productVariant.Product.name }}</h3>
          <p v-for="attributeValue in cartProduct.productVariant.attributeValues" :key="attributeValue.id">
            {{ attributeValue.attribute.name }} - {{ attributeValue.value }}
          </p>
          <p>
            Catégorie:
            <span v-if="cartProduct.productVariant.Product.Categories" v-for="category in cartProduct.productVariant.Product.Categories" :key="category.id">
              {{ category.name }}
            </span>
          </p>
          <p>Quantité: {{ cartProduct.quantity }}</p>
        </div>
        <div class="order-actions">
          <div v-if="order.Cart.promoCode">
            <div class="first-price">
              <p class="old-price">{{ cartProduct.productVariant.price }} €</p>
              <span class="discount">(-{{ order.Cart.promoCode.discountPercentage }}%)</span>
            </div>
            <p class="new-price text-left">{{ calculateDiscountedPrice(cartProduct.productVariant.price, order.Cart.promoCode.discountPercentage) }} €</p>
          </div>
          <p v-else class="new-price">{{ cartProduct.productVariant.price }} €</p>
          <button @click="addToCart(cartProduct.productVariant.id, 1)" class="btn-details">Commander à nouveau</button>
          <button v-if="!cartProduct.productVariant.returned && order.status == 'completed'" @click="returnItem(order.id, cartProduct.productVariant.id, cartProduct.quantity)" class="btn-details">Retourner l'article</button>
          <button v-else-if="cartProduct.productVariant.returned" @click="returnItem(order.id, cartProduct.productVariant.id, cartProduct.quantity)" class="btn-details">Voir les détails ({{ cartProduct.productVariant.returned.status }})</button>
        </div>
      </div>
    </div>
  </div>
  <NotFoundView v-else />
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { z } from 'zod'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/store/cart'
import axios from '../tools/axios';
import { AxiosError } from 'axios'
import { format, parseISO } from 'date-fns'
import Cookies from 'js-cookie'
import NotFoundView from './NotFoundView.vue';

const notFound = ref(false)
const cartStore = useCartStore()
const showNotification = inject('showNotification');
const route = useRoute()
const router = useRouter()
const orderId = route.params.id
const order = ref<any>(null)
const imageUrl = import.meta.env.VITE_API_BASE_URL + '/images/variant/';

const authToken = Cookies.get('USER') ? JSON.parse(Cookies.get('USER').substring(2)).id : null

const cartSchema = z.object({
  userId: z.number(),
  productVariantId: z.number().positive('L\'identifiant de la variante du produit doit être supérieur à 0'),
  quantity: z.number().positive('La quantité doit être supérieure à 0')
})

const fetchOrder = async () => {
  if (authToken) {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}`)
      order.value = response.data

      if (order.value.Cart) {
        for (const cart of order.value.Cart.CartProducts) {
          const returnProduct = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/return/${cart.productVariant.id}`, {
            params: {
              orderId: orderId,
            }
          })

          if (returnProduct.data && typeof returnProduct.data === 'object') {
            cart.productVariant.returned = returnProduct.data
          }
        }
      }
    } catch (error) {

      if(error instanceof AxiosError && error.response.status === 404) {
        notFound.value = true;
      }

      console.error('Error fetching order:', error)
      showNotification('Erreur lors du chargement de la commande', 'error')
    }
  }
}

const calculateDiscountedPrice = (price: number, discount: number) => {
  return (price - (price * discount) / 100).toFixed(2)
}

const showProductDetails = (id: string) => {
  router.push({ name: 'ProductDetail', params: { id } })
}

const isFutureDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  return date.getTime() > today.getTime();
}

const downloadInvoice = async () => {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/stripe/invoice/${orderId}`);
    const invoicePdfUrl = response.data.invoicePdfUrl;

    const link = document.createElement('a');
    link.href = invoicePdfUrl;
    link.setAttribute('download', `Commande_n°${orderId}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Erreur lors du téléchargement de la facture :', error);
    showNotification('Échec du téléchargement de la facture', 'error');
  }
};

const returnItem = (orderId: number, productVariantId: number) => {
  router.push({ name: 'ReturnProducts', params: { orderId: orderId, productVariantId: productVariantId } })
}

const formatDate = (dateStr: string) => {
  const parsedDate = parseISO(dateStr)
  return format(parsedDate, 'dd/MM/yyyy')
}

const formatHeure = (dateStr: string) => {
  const parsedDate = parseISO(dateStr)
  return format(parsedDate, 'HH:mm')
}

const addToCart = async (id: number, quantity: number) => {

  const cart = cartSchema.parse({
    userId: authToken,
    productVariantId: id,
    quantity: quantity
  });
  await cartStore.addProductToCart(cart);
  showNotification('Produit ajouté au panier avec succès', 'success')
}

onMounted(() => {
  fetchOrder()
})
</script>

<style scoped>
.cart {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.header {
  margin-bottom: 20px;
  text-align: center;
}

.order-details {
  margin-top: 20px;
  border-top: 1px solid #ccc;
  padding-top: 20px;
}

.order-status {
  padding: 5px 10px;
  border-radius: 12px;
  display: inline-block;
  margin-bottom: 10px;
}

.order-status.pending {
  background-color: yellow;
  color: black;
}

.order-status.completed {
  background-color: green;
  color: white;
}

.order-status.returned {
  background-color: red;
  color: white;
}

.order-total {
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.cart-item:hover {
  background-color: #e9e9e9;
}

.product-image-container {
  flex-shrink: 0;
  margin-right: 20px;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.item-details {
  flex: 1;
  cursor: pointer;
}

.item-details h3 {
  margin: 0;
  font-size: 1.2em;
  color: #333;
}

.item-details p {
  margin: 5px 0;
}

.total {
  display: flex;
  flex-direction: column;
}

.first-price {
  display: flex;
  align-items: center;
}

.old-price {
  text-decoration: line-through;
  color: red;
  margin-right: 10px;
}

.discount {
  color: green;
}

.new-price {
  font-weight: bold;
  color: #333;
}

.order-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.item-price {
  font-weight: bold;
  margin-bottom: 10px;
}

/* Responsive design */
@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-image-container {
    margin-bottom: 10px;
  }

  .price-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .first-price {
    margin-bottom: 5px;
  }

  .order-total,
  .order-status {
    text-align: center;
  }

  .order-actions {
    align-items: flex-start;
  }
}

.payment-details {
  font-size: 16px;
  font-weight: bold;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
  margin: 10px 0;
}

.payment-details span {
  margin-right: 10px;
}

.payment-details span:last-child {
  margin-right: 0;
}
</style>
