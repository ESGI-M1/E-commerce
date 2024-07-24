<template>
  <div class="cart">
    <header>
      <h1>Mon Panier</h1>
      <p v-if="!authToken">
        <router-link to="/login">S'identifier</router-link> ou
        <router-link to="/signup">Rejoins-nous</router-link>
      </p>
    </header>

    <div class="cart-content">
      <div class="cart-items" v-if="cartStore.getCart && cartStore.getCart.CartProducts && cartStore.getCart.CartProducts.length > 0">
        <div v-for="(item, itemIndex) in cartStore.getCart.CartProducts" :key="itemIndex" class="cart-item">
          <div class="item-details" @click="showProductDetails(item.productVariant.product.id)">
            <RouterLink :to="{ name: 'ProductDetail', params: { id: item.productVariant.productId }}">
              <h3>{{ item.productVariant.Product.name }}</h3>
              <p v-for="attributeValue in item.productVariant.attributeValues" :key="attributeValue.id">
                {{ attributeValue.attribute.name }} - {{ attributeValue.value }}
              </p>
              <img
                v-if="item.productVariant.images.length > 0"
                class="product-image"
                :src="imageUrl + item.productVariant.images[0].id"
                :alt="item.productVariant.images[0].description"
              />
            </RouterLink>
          </div>
          <div class="item-quantity">
            <select v-model="item.quantity" @change="updateCartQuantity(item.id, item.quantity)">
              <option value="remove">Supprimer</option>
              <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
              <option v-if="item.quantity > 10" :value="item.quantity" :key="item.quantity">
                {{ item.quantity }}
              </option>
            </select>
          </div>
          <div class="item-price">
            <p>{{ item.productVariant.price }} €</p>
            <p>Total: {{ (item.productVariant.price * item.quantity).toFixed(2) }} €</p>
          </div>
        </div>

        <button class="cart-button hold-cart" @click="updateCartHold(true)" v-if="!cartStore.getCart.heldUntil">Réserver le panier</button>
        <button class="cart-button unhold-cart" @click="updateCartHold(false)" v-else>Annuler la réservation</button>
      </div>
      <div v-else>
        <p>Il n'y a aucun article dans ton panier.</p>
      </div>
      <div class="cart-summary" v-if="cartStore.getCart">
        <h2>Récapitulatif</h2>
        <div class="promo-code">
          <label for="promo">As-tu un code promo ?</label>
          <div class="promo-input">
            <input
              type="text"
              id="promo"
              placeholder="Entrez votre code promo"
              v-model="promoCode"
            />
            <button @click="applyPromoCode" class="apply-button">Appliquer</button>
          </div>
          <div v-if="promo">
            Code promo appliqué : {{ promo.code }}
            <button @click="removePromo(false)" class="remove-button">Supprimer</button>
          </div>
          <p v-if="promoError" class="error-message">{{ promoError }}</p>
        </div>
        <div class="totals">
          <div class="subtotal">
            <p>Sous-total</p>
            <p>{{ cartStore.getCartSubtotal }} €</p>
          </div>
          <div class="shipping">
            <p>Frais estimés de prise en charge et d'expédition</p>
            <p>Gratuit</p>
          </div>
          <div class="total">
            <div class="total-price">
              <p>Total</p>
              <div class="price-container">
                <p
                  :style="{
                    'text-decoration': promo ? 'line-through' : 'none',
                    color: promo ? 'red' : 'initial'
                  }"
                  class="old-price"
                >
                  {{ promo ? cartStore.getCartSubtotal : cartStore.getCartTotal }} €
                </p>
                <span class="discount" v-if="promo">(- {{ promo.discountPercentage }}%)</span>
              </div>
            </div>
            <p v-if="promo" class="new-price">
              {{ cartStore.getCartTotal }} €
            </p>
          </div>
        </div>
        <button @click="checkout" class="cart-button checkout">Accéder au paiement</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, computed } from 'vue';
import { useRouter } from 'vue-router';
import Cookies from 'js-cookie';
import { useCartStore } from '@/store/cart';
import { load } from '../components/loading/loading'; 

const { loading, startLoading, stopLoading } = load();
const showNotification = inject('showNotification');
const router = useRouter();
const authToken = Cookies.get('USER') ? JSON.parse(Cookies.get('USER').substring(2)).id : localStorage.getItem('temporaryId');
const promoCode = ref('');
const promoError = ref('');
const imageUrl = import.meta.env.VITE_API_BASE_URL + '/images/variant/';
const cartStore = useCartStore();

const promo = computed(() => cartStore.getPromo);

const removePromo = async (automatic: boolean) => {
  try {
    startLoading();
    await cartStore.removePromo();
    if (!automatic) {
      showNotification('Code promo supprimé avec succès', 'success');
    } else {
      showNotification('Le code promo ' + promo.value.code + ' a expiré !', 'error');
    }
    stopLoading();
  } catch (error) {
    console.error(error);
    if (error.response && error.response.status === 400) {
      promoError.value = error.response.data.message || 'Ce code promo a expiré !';
      showNotification('Ce code promo a expiré !', 'error');
    }
    stopLoading();
  }
};

const applyPromoCode = async () => {
  try {
    startLoading();
    await cartStore.applyPromoCode(promoCode.value);
    promoError.value = '';
    showNotification('Code promo appliqué avec succès', 'success');
    stopLoading();
  } catch (error) {
    if (error.response.status === 400) {
      promoError.value = 'Ce code promo a expiré.';
    } else {
      promoError.value = 'Ce code promo n\'est pas valide.';
    }
    stopLoading();
  }
};

const updateCartQuantity = async (id: number, quantity: number | string) => {
  try {
    startLoading();
    await cartStore.updateCartQuantity(id, quantity);
    showNotification('La quantité a été mise à jour avec succès', 'success');
    stopLoading();
  } catch (error) {
    showNotification('Une erreur s\'est produite lors de la mise à jour de la quantité', 'error');
    stopLoading();
  }
};

const updateCartHold = async (hold: boolean) => {
  try {
    startLoading();
    await cartStore.updateCartHold(hold);
    showNotification(
      hold ? 'Le panier a été réservé avec succès pendant 15 minutes' : 'La réservation du panier a été annulée',
      'success'
    );
    stopLoading();
  } catch (error) {
    showNotification('Une erreur s\'est produite lors de la réservation du panier', 'error');
    stopLoading();
  }
};

const checkout = () => {
  if (!Cookies.get('USER')) {
    router.push('/login');
  } else {
    router.push('/payment');
  }
};

const showProductDetails = (productId: number) => {
  router.push({ name: 'ProductDetail', params: { id: productId } });
};

onMounted(async () => {
  try {
    startLoading();
    await cartStore.fetchCartItemsAuth();
    stopLoading();
  } catch (error) {
    console.error(error);
    stopLoading();
  }
});
</script>

<style scoped>
.cart {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  margin-bottom: 20px;
}

.cart-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.cart-items {
  border-bottom: 1px solid #ccc;
  padding-bottom: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 8px;
}

.product-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-right: 20px;
}

.item-details {
  flex: 1;
}

.item-details h3 {
  margin: 0;
}

.item-quantity select {
  width: 100px;
  margin-right: 20px;
}

.item-price {
  text-align: right;
}

.cart-summary {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.cart-summary h2 {
  margin-top: 0;
}

.promo-code {
  margin-bottom: 20px;
}

.promo-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

input[type='text'] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 5px;
}

.apply-button {
  padding: 10px 20px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
}

.apply-button:hover {
  background-color: #f0f0f0;
}

.totals {
  margin-bottom: 20px;
}

.totals > div {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.total p {
  font-weight: bold;
}

.cart-button {
  width: 100%;
  padding: 10px 20px;
  margin-bottom: 10px;

  color: white;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  transition: all 0.3s;
}

.checkout {
  background-color: #000000;
}

.checkout:hover {
  background-color: #333333;
}

.hold-cart {
  background-color: #2F855A;
}

.hold-cart:hover {
  background-color: #2A704F;
}

.unhold-cart {
  background-color: #A9A9A9;
}

.unhold-cart:hover {
  background-color: #8C8C8C;
}

.total {
  display: block !important;
}

.total p:first-child {
  text-align: left;
}

.total-price {
  display: flex;
  justify-content: space-between;
}

.price-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.old-price {
  margin-right: 10px;
}

.discount {
  color: green;
}

.new-price {
  text-align: right;
  margin-top: 5px;
}

.error-message {
  color: red;
  text-align: left;
}
</style>
