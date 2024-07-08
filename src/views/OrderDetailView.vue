<template>
  <div class="cart">
    <header class="header">
      <h1>Ma commande n°{{ orderId }}</h1>
      <button v-if="order" @click="downloadInvoice(order.id)" class="btn-details">
        Télécharger ma facture
      </button>
      <p v-if="order">Date de la commande: {{ formatDate(order.createdAt) }}</p>
    </header>
    <div v-if="order" class="order-details">
      <h2>Détails de la commande</h2>
      <div v-if="order.addressOrder">
      <p>
        Adresse: {{ order.addressOrder.street }}, {{ order.addressOrder.postalCode }} {{ order.addressOrder.city }}, {{ order.addressOrder.country }}
      </p>    
    </div>
      <small v-if="order.deliveryDate">
      {{ isFutureDate(order.deliveryDate) ? 'Livraison prévu le' : 'Livré le' }} {{ formatDate(order.deliveryDate) }}
      {{ isFutureDate(order.deliveryDate) ? '' : 'à ' + formatHeure(order.deliveryDate)  }}
    </small>
      <div>
        Statut:
        <p :class="['order-status', order.status]">{{ order.status }}</p>
      </div>
      <div class="order-total">Total: {{ order.totalAmount }} €</div>
      <div v-for="cartProduct in order.Cart.CartProducts" :key="cartProduct.id" class="cart-item">
        <div v-if="cartProduct.product" class="product-image-container">
          <img
            v-if="cartProduct.product.Images && cartProduct.product.Images.length > 0"
            :src="cartProduct.product.Images[0].url"
            :alt="cartProduct.product.Images[0].description"
            class="product-image"
          />
        </div>
        <div class="item-details" @click="showProductDetails(cartProduct.product.id)">
          <h3>{{ cartProduct.product.name }}</h3>
          <p>
            Catégorie:
            <span v-for="category in cartProduct.product.Categories" :key="category.id">
              {{ category.name }}
            </span>
          </p>
          <p>Quantité: {{ cartProduct.quantity }}</p>
        </div>
        <div class="order-actions">
          <div v-if="order.Cart.promoCode">
            <div class="first-price">
              <p class="old-price">{{ cartProduct.product.price }} €</p>
              <span class="discount">(-{{ order.Cart.promoCode.discountPercentage }}%)</span>
            </div>
            <p class="new-price text-left">{{ calculateDiscountedPrice(cartProduct.product.price, order.Cart.promoCode.discountPercentage) }} €</p>
          </div>
          <p v-else class="new-price">{{ cartProduct.product.price }} €</p>
          <button @click="addToCart(cartProduct.product.id, 1)" class="btn-details">Commander à nouveau</button>
          <button v-if="!cartProduct.product.returned && order.status == 'completed'" @click="returnItem(order.id, cartProduct.product.id, cartProduct.quantity)" class="btn-details">Retourner l'article</button>
          <button v-else-if="cartProduct.product.returned" @click="returnItem(order.id, cartProduct.product.id, cartProduct.quantity)" class="btn-details">Voir les détails ({{ cartProduct.product.returned.status }})</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '../tools/axios';
import { format, parseISO } from 'date-fns'
import Cookies from 'js-cookie'

const route = useRoute()
const router = useRouter()
const orderId = ref(route.params.id as string)
const order = ref<any>(null)

const authToken = Cookies.get('USER') ? JSON.parse(Cookies.get('USER').substring(2)).id : null

const fetchOrder = async () => {
    if (authToken) {
      const response = await axios.get(`http://localhost:3000/orders/${orderId.value}`, {
      })
      order.value = response.data

      for (const cart of order.value.Cart.CartProducts) {
        const returnProduct = await axios.get(`http://localhost:3000/return/${cart.product.id}`, {
          params: {
            orderId: orderId.value,
          }
        })

        if (returnProduct.data && typeof returnProduct.data === 'object') {
          cart.product.returned = returnProduct.data
        }
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

const downloadInvoice = async (orderId) => {
  try {
    const response = await axios.get(`http://localhost:3000/orders/invoice/${orderId}`, {
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    })

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Commande_n°${orderId}.pdf`)
    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading invoice:', error)
    alert('Échec du téléchargement de la facture')
  }
}

const returnItem = (orderId: number, productId: number) => {
  router.push({ name: 'ReturnProducts', params: { orderId: orderId, productId: productId } })
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
    await axios.post('http://localhost:3000/carts', {
      userId: authToken,
      productId: id,
      quantity: quantity
    })
    alert('Produit ajouté au panier avec succès')
    router.push('/cart')
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
</style>
