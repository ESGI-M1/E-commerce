<template>
  <div class="return-product">
    <h1 v-if="returned && returned.id">Retour du Produit # {{ returned.id }}</h1>
    <h1 v-else>Retour du Produit</h1>
    <form @submit.prevent="submitReturn">
      <div class="return-details">
        <p>
          <strong>Commande n°{{ orderId }}</strong>
        </p>
        <p v-if="variantOption && productVariant">
          Produit retourné : <span>{{ productVariant.product.name }} | {{ productVariant.name }} | {{ variantOption.color }} | {{ variantOption.size }}</span>
        </p>
        <p v-if="statut">
          Statut : <span>{{ statut }}</span>
        </p>
        <div class="form-group" v-if="quantity !== null">
          <label for="quantityReturned">Quantité retournée :</label>
          <select id="quantityReturned" v-model="quantityReturned" v-if="!existingReturn">
            <option v-for="num in quantityOptions" :key="num" :value="num">{{ num }}</option>
          </select>
          <p v-else>{{ quantityReturned }}</p>
        </div>
        <div class="form-group">
          <label for="returnReason">Raison du retour :</label>
          <textarea
            id="returnReason"
            v-model="returnReason"
            rows="4"
            v-if="!existingReturn"
          ></textarea>
          <p v-else>{{ returnReason }}</p>
        </div>
        <div class="form-group">
          <label for="deliveryMethod">Méthode de retour :</label>
          <select id="deliveryMethod" v-model="deliveryMethod" v-if="!existingReturn">
            <option value="mondial-relay">Mondial Relay</option>
            <option value="point-relais">Point Relais</option>
          </select>
          <p v-else>{{ deliveryMethod }}</p>
        </div>
        <button type="submit" class="validate-button" v-if="!existingReturn">
          Valider le retour
        </button>
        <fancy-confirm
          v-else-if="statut === 'processing' && existingReturn"
          :buttonText="'Annuler'"
          :class="'btn btn-danger'"
          :confirmationMessage="'Etes-vous sûr de vouloir annuler le retour du produit ?'"
          @confirmed="deleteReturn"
        >
        </fancy-confirm>
        <p v-else-if="statut === 'returned' && card"> Remboursement effectué sur votre carte <small>**** **** **** {{card}}</small></p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '../tools/axios';
import FancyConfirm from '../components/ConfirmComponent.vue'

const route = useRoute()
const router = useRouter()
const orderId = ref(route.params.orderId as string)
const productVariantId = route.params.productVariantId
const quantity = ref(0)
const showNotification = inject('showNotification');

const quantityReturned = ref(1)
const returnReason = ref('')
const deliveryMethod = ref('mondial-relay')
const statut = ref('')
const variantOption = ref<any>(null)
const productVariant = ref<any>(null)
const product = ref<any>(null)
const existingReturn = ref(false)
const card = ref('')
const returned = ref(false)

const quantityOptions = computed(() => {
  const options = []
  for (let i = 1; i <= quantity.value; i++) {
    options.push(i)
  }
  return options
})

const fetchProductDetails = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/orders/${orderId.value}`);
    if (response.data.status === 'pending') {
      router.push(`/order/${orderId.value}`);
    }

    const cartProducts = response.data.Cart.CartProducts;
    const cartProduct = cartProducts.find(cp => cp.productVariantId == productVariantId);
    
    if (cartProduct) {
      quantity.value = cartProduct.quantity;
      product.value = cartProduct.productVariant.product;
      productVariant.value = cartProduct.productVariant;
    } else {
      quantity.value = 0;
    }

    const returnResponse = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/return/${productVariantId}`, {
      params: { orderId: orderId.value }
    });

    returned.value = returnResponse.data;

    if (returnResponse.data && typeof(returnResponse.data) === 'object') {
      existingReturn.value = true;
      quantityReturned.value = returnResponse.data.quantity;
      returnReason.value = returnResponse.data.reason;
      deliveryMethod.value = returnResponse.data.deliveryMethod;
      statut.value = returnResponse.data.status;
    }

    if (response.data.Payment) {
      card.value = response.data.Payment.cardLast4;
    }
  } catch (error) {
    showNotification('Erreur lors du chargement des détails du produit', 'error');
    console.error(error);
  }
}

onMounted(() => fetchProductDetails())

const submitReturn = async () => {
  try {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/return`, {
      orderId: orderId.value,
      productVariantId: productVariantId,
      quantityReturned: quantityReturned.value,
      reason: returnReason.value,
      deliveryMethod: deliveryMethod.value
    });
    showNotification('Retour soumis avec succès', 'success');
    router.push(`/order/${orderId.value}`);
  } catch (error) {
    showNotification('Erreur lors de la soumission du retour', 'error');
    console.error('Error submitting return:', error);
  }
}

const deleteReturn = async () => {
  try {
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/return`, {
      params: {
        productVariantId: productVariantId,
        orderId: orderId.value
      }
    });
    showNotification('Retour annulé avec succès', 'success');
    router.push(`/order/${orderId.value}`);
  } catch (error) {
    showNotification('Erreur lors de l\'annulation du retour', 'error');
    console.error(error);
  }
}
</script>

<style scoped>
.return-product {
  max-width: 600px;
  margin: 40px auto;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Roboto', sans-serif;
}

.return-product h1 {
  font-size: 2em;
  margin-bottom: 20px;
  color: #333333;
  text-align: center;
}

.return-details {
  margin-top: 20px;
}

.return-details p {
  margin-bottom: 10px;
  font-size: 1.1em;
  color: #555555;
}

.return-details label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333333;
}

.return-details span {
  font-weight: normal;
  color: #666666;
}

.return-details button {
  display: inline-block;
  padding: 12px;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition:
    background-color 0.3s ease,
    transform 0.3s ease;
}

.return-details textarea,
.return-details select {
  width: 100%;
  padding: 10px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  font-size: 1em;
  background-color: #f9f9f9;
}

.return-details textarea:focus,
.return-details select:focus {
  outline: none;
  background-color: #ffffff;
}

.form-group {
  margin-bottom: 20px;
}

.form-group p {
  margin-top: 8px;
  font-size: 1em;
  color: #666666;
}

.validate-button {
  background-color: #007bff;
}

.validate-button:hover {
  transform: translateY(-2px);
  background-color: #0056b3;
}

.danger {
  background-color: #dc3545;
  color: white;
}

.danger:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}
</style>
