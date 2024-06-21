<template>
  <div class="cart">
    <header class="header">
      <h1>Ma commande n°{{ order?.id }}</h1>
      <button v-if="order" @click="downloadInvoice(order.id)" class="button-order">
        Télécharger ma facture
      </button>
      <p v-if="order">Date de la commande: {{ formatDate(order.createdAt) }}</p>
    </header>
    <div v-if="order" class="order-details">
      <h2>Détails de la commande</h2>
      <small v-if="order.deliveryDate">Livré le {{ formatDate(order.deliveryDate) }}</small>
      <div>
        Statut:
        <p :class="['order-status', order.status]">{{ order.status }}</p>
      </div>
      <div class="order-total">Total: {{ order.totalAmount }} €</div>
      <div v-for="cart in order.carts" :key="cart.id" class="cart-item">
        <div class="product-image-container" v-if="cart.product.Images.length > 0">
          <img
            :src="cart.product.Images[0].url"
            :alt="cart.product.Images[0].description"
            class="product-image"
          />
        </div>
        <div class="item-details" @click="showProductDetails(cart.product.id)">
          <h3>{{ cart.product.name }}</h3>
          <p>
            Catégorie:
            <span v-for="category in cart.product.Categories" :key="category.id">
              {{ category.name }}
            </span>
          </p>
          <p>Quantité: {{ cart.quantity }}</p>
          <div v-if="cart.promo" class="total"></div>
          <div v-else>
            <p>Prix: {{ cart.product.price }} €</p>
          </div>
        </div>
        <div class="order-actions">
              <div class="first-price">
                <p class="old-price">{{ cart.product.price }} €</p>
                <span class="discount">(-{{ cart.promo.discountPercentage }}%)</span>
              </div>
              <p class="new-price">{{ calculateDiscountedPrice(cart.product.price, cart.promo.discountPercentage) }} €</p>
          <button @click="addToCart(cart.product.id, 1)" class="button-order">Commander à nouveau</button>
          <button v-if="!cart.product.returned" @click="returnItem(order.id, cart.product.id, cart.quantity)" class="button-order">Retourner l'article</button>
          <button v-else @click="returnItem(order.id, cart.product.id, cart.quantity)" class="button-order">Voir les détails ({{ cart.product.returned.status }})</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { format, parseISO } from 'date-fns'

const route = useRoute()
const router = useRouter()
const orderId = ref(route.params.id as string)
const order = ref<any>(null)
/*
NOT USED
const returned = ref<any>(null)
*/

const authToken = localStorage.getItem('authToken')

const fetchOrder = async () => {
  try {
    if (authToken) {
      const response = await axios.get(`http://localhost:3000/orders/details/${authToken}`, {
        params: { orderId: orderId.value }
      })
      order.value = response.data[0]

      for (const cart of order.value.carts) {
        const returnProduct = await axios.get(`http://localhost:3000/return/${cart.product.id}`, {
          params: {
            orderId: orderId.value,
            userId: authToken
          }
        })

        if (returnProduct.data) {
          cart.product.returned = returnProduct.data
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de la commande :', error)
  }
}

const calculateDiscountedPrice = (price: number, discount: number) => {
  return (price - (price * discount) / 100).toFixed(2)
}

const showProductDetails = (id: string) => {
  router.push({ name: 'ProductDetail', params: { id } })
}

const downloadInvoice = async (orderId) => {
  try {
    const response = await axios.get(`http://localhost:3000/orders/invoice/${orderId}`, {
      responseType: 'blob'
    })
    console.log(response.data)

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

const returnItem = (orderId: number, productId: number, quantity: number) => {
  router.push({ name: 'ReturnProducts', params: { orderId: orderId, productId: productId } });
};

const formatDate = (dateStr: string) => {
  try {
    const parsedDate = parseISO(dateStr)
    return format(parsedDate, 'dd/MM/yyyy')
  } catch (error) {
    console.error('Erreur lors du formatage de la date :', error)
    return ''
  }
}

const addToCart = async (id: number, quantity: number) => {
  try {
    await axios.post('http://localhost:3000/carts', {
      userId: authToken,
      productId: id,
      quantity: quantity
    })
    alert('Produit ajouté au panier avec succès')
    router.push('/cart')
  } catch (error) {
    alert("Échec de l'ajout du produit au panier")
  }
}

/*
NOT USED
const returnedProduct = async (productId: number) => {
  const userId = localStorage.getItem('authToken')
  try {
    const response = await axios.post(`http://localhost:3000/return/${orderId.value}`, {
      orderId: orderId.value,
      userId: userId,
      productId: productId
    })
    returned.value = response.data
    console.log('Retour du produit enregistré avec succès :', response.data)
  } catch (error) {
    console.error('Erreur lors de la soumission du retour du produit :', error)
    alert('Erreur lors de la soumission du retour du produit')
  }
}
*/

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

.button-order {
  padding: 10px 20px;
  background-color: white;
  color: black;
  border: 1px solid black;
  border-radius: 20px;
  cursor: pointer;
  transition:
    background-color 0.3s,
    transform 0.3s,
    box-shadow 0.3s;
}

.button-order:hover {
  background-color: #f0f0f0;
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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
