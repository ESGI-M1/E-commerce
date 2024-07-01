<template>
  <div class="profile-container" v-if="user">
    <h1>Mon Profil</h1>
    <div class="profile-details">
      <p><strong>Nom:</strong> {{ user.lastname }}</p>
      <p><strong>Prénom:</strong> {{ user.firstname }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>

      <div v-if="user.deliveryAddress && user.deliveryAddress.length > 0">
        <div
          v-for="(address, index) in user.deliveryAddress"
          :key="address.id"
          class="delivery-address"
        >
          <div class="address-info" @click="openModal('edit', address)">
            <p>
              <strong>Adresse de livraison {{ index + 1 }} :</strong>
            </p>
            <p>{{ address.street }}</p>
            <p>{{ address.postalCode }} {{ address.city }}</p>
            <p>{{ address.country }}</p>
          </div>
          <div class="address-actions">
            <button class="btn-delete" @click="deleteAddress(address.id)">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-else>
        <p>Aucune adresse de livraison enregistrée.</p>
      </div>

      <button class="btn-add" @click="openModal('add')">
        <i class="fa fa-plus"></i> Ajouter une adresse de livraison
      </button>
    </div>

    <div v-if="isOpen" class="modal-overlay">
      <div class="modal">
        <span class="close" @click="closeModal">&times;</span>
        <h2 v-if="mode === 'edit'">Modifier l'adresse de livraison</h2>
        <h2 v-else>Ajouter une adresse de livraison</h2>
        <form @submit.prevent="handleSubmit" class="modal-form">
          <div class="form-group">
            <label for="street">Rue</label>
            <input v-model="form.street" type="text" id="street" required autocomplete="street-address" />
          </div>
          <div class="form-group">
            <label for="postalCode">Code Postal</label>
            <input v-model="form.postalCode" type="text" id="postalCode" required autocomplete="postal-code" />
          </div>
          <div class="form-group">
            <label for="city">Ville</label>
            <input v-model="form.city" type="text" id="city" required autocomplete="address-level2" />
          </div>
          <div class="form-group">
            <label for="country">Pays</label>
            <input v-model="form.country" type="text" id="country" required autocomplete="country" />
          </div>
          <div class="buttons">
            <button type="submit" class="btn btn-primary">
              {{ mode === 'edit' ? 'Modifier' : 'Ajouter' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const user = ref(null)
const isOpen = ref(false)
const mode = ref('')
const form = ref({
  street: '',
  postalCode: '',
  city: '',
  country: ''
})
let editingAddress = null

const fetchUserProfile = async () => {
  const authToken = localStorage.getItem('authToken')
  if (!authToken) {
    return router.push('/')
  }

  try {
    const response = await axios.get(`http://localhost:3000/users/${authToken}`, {
      withCredentials: true
    })
    user.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement du profil :', error)
  }
}

const openModal = (modeType, address = null) => {
  isOpen.value = true
  mode.value = modeType // 'add' ou 'edit'

  if (modeType === 'edit' && address) {
    editingAddress = address
    form.value.street = address.street
    form.value.postalCode = address.postalCode
    form.value.city = address.city
    form.value.country = address.country
  } else {
    editingAddress = null
    form.value.street = ''
    form.value.postalCode = ''
    form.value.city = ''
    form.value.country = ''
  }
}

const closeModal = () => {
  isOpen.value = false
}

const deleteAddress = async (id) => {
  try {
    await axios.delete(`http://localhost:3000/addressusers/${id}`, {
      withCredentials: true
    })
    user.value.deliveryAddress = user.value.deliveryAddress.filter((address) => address.id !== id)
  } catch (error) {
    console.error("Erreur lors de la suppression de l'adresse :", error)
  }
}

const handleSubmit = async () => {
  const authToken = localStorage.getItem('authToken')
  if (!authToken) {
    return router.push('/')
  }

  try {
    let response
    if (mode.value === 'add') {
      response = await axios.post(`http://localhost:3000/addressusers`, form.value, {
        withCredentials: true
      })
      user.value.deliveryAddress.push(response.data)
    } else if (mode.value === 'edit' && editingAddress) {
      response = await axios.put(`http://localhost:3000/addressusers/${authToken}`, form.value, {
        withCredentials: true
      })
      Object.assign(editingAddress, response.data)
    }

    closeModal()
  } catch (error) {
    console.error('Erreur lors de la soumission du formulaire :', error)
  }
}

onMounted(async () => {
  await fetchUserProfile()
})
</script>

<style scoped>
.profile-container {
  margin: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #f9f9f9;
}

.profile-details {
  line-height: 1.6;
}

.profile-details p {
  margin: 10px 0;
}

.delivery-address {
  margin-bottom: 20px;
  padding: 10px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  cursor: pointer; /* Ajout d'un curseur pointer pour indiquer l'interaction */
  transition: background-color 0.3s ease; /* Transition de couleur de fond pour un effet visuel */
}

.delivery-address:hover {
  background-color: #f0f0f0; /* Couleur de fond au survol */
}

.address-info {
  flex: 1; /* Prend toute la largeur disponible */
}

.address-info p {
  margin: 5px 0; /* Marge interne pour les paragraphes */
}

.address-actions {
  display: flex;
  align-items: center; /* Centrer verticalement */
}

.btn-delete {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease; /* Transition pour l'effet de survol */
}

.btn-delete:hover {
  background-color: #c82333; /* Couleur de fond au survol */
}

.btn-add {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  font-size: 1.5rem;
}

.modal-form .form-group {
  margin-bottom: 15px;
}

.modal-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.modal-form input[type='text'] {
  width: calc(100% - 16px);
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.buttons {
  margin-top: 20px;
  text-align: right;
}
</style>
