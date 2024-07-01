<template>
  <div class="profile-container" v-if="user">
    <h1>Mon Profil</h1>
    <div class="profile-details">
      <p>
        <strong>Nom:</strong> {{ user.lastname }}
        <a @click="openeditLastnameModal(user.lastname)"><i class="fa fa-edit edit-icon" ></i></a>
      </p>
      <p>
        <strong>Prénom:</strong> {{ user.firstname }}
        <a @click="openeditFirstnameModal(user.firstname)"><i class="fa fa-edit edit-icon" ></i></a>
      </p>
      <p>
        <strong>Email:</strong> {{ user.email }}
        <a @click="openeditEmailModal(user.email)"><i class="fa fa-edit edit-icon" ></i></a>

      </p>

      <div v-if="user.deliveryAddress && user.deliveryAddress.length > 0">
        <div v-for="(address, index) in user.deliveryAddress" :key="address.id" class="delivery-address">
          <div class="address-info" @click="openEditAddressModal(address)">
            <p><strong>Adresse de livraison {{ index + 1 }} :</strong></p>
            <p>{{ address.street }}</p>
            <p>{{ address.postalCode }} {{ address.city }}</p>
            <p>{{ address.country }}</p>
          </div>
          <div class="address-actions">
            <fancy-confirm
                :class="'a-danger'"
                :confirmationMessage="'Etes-vous sûr de vouloir supprimer l\'adresse ?'"
                :elementType="'a'"
                @confirmed="deleteAddress(address.id)"
            >
            <template #buttonText>
              <i class="fa fa-trash"></i>
            </template>
          </fancy-confirm>
          </div>
        </div>
      </div>

      <div v-else>
        <p>Aucune adresse de livraison enregistrée.</p>
      </div>

      <button class="btn-add" @click="openAddAddressModal"><i class="fa fa-plus"></i> Ajouter une adresse de livraison</button>
    </div>

    <div v-if="isOpen" class="modal-overlay">
      <div class="modal">
        <span class="close" @click="closeModal">&times;</span>
        <h2 v-if="mode === 'editAddress'">Modifier l'adresse de livraison</h2>
        <h2 v-else-if="mode === 'addAddress'">Ajouter une adresse de livraison</h2>
        <h2 v-else>Modifier {{ modeLabel }}</h2>
        <form @submit.prevent="handleSubmit" class="modal-form">
          <div v-if="mode === 'editAddress' || mode === 'addAddress'">
            <div class="form-group">
              <label for="street">Rue</label>
              <input v-model="form.street" type="text" id="street" required />
            </div>
            <div class="form-group">
              <label for="postalCode">Code Postal</label>
              <input v-model="form.postalCode" type="text" id="postalCode" required />
            </div>
            <div class="form-group">
              <label for="city">Ville</label>
              <input v-model="form.city" type="text" id="city" required />
            </div>
            <div class="form-group">
              <label for="country">Pays</label>
              <input v-model="form.country" type="text" id="country" required />
            </div>
          </div>
          <div v-else>
            <div class="form-group">
              <label :for="mode">{{mode === 'email' ? 'Email' : mode === 'firstname' ? 'Prénom' : 'Nom'}}</label>
              <input v-model="form[mode]" :type="mode === 'email' ? 'email' : 'text'" :id="mode" required />
            </div>
          </div>
          <div class="buttons">
            <button type="submit" class="btn btn-primary">{{ mode.includes('add') ? 'Ajouter' : 'Modifier' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import FancyConfirm from '../components/ConfirmComponent.vue';

const user = ref(null);
const isOpen = ref(false);
const mode = ref('');
const form = ref({
  street: '',
  postalCode: '',
  city: '',
  country: '',
  lastname: '',
  firstname: '',
  email: ''
});
let modeLabel = ref('');
let editingAddress = null;

const fetchUserProfile = async () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    return router.push('/');
  }

    const response = await axios.get(`http://localhost:3000/users/${authToken}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    user.value = response.data;
};

const openeditFirstnameModal = (firstname: string) => {
  isOpen.value = true;
  modeLabel = 'le prénom'
  mode.value = 'firstname';
  form.value.firstname = firstname;
};

const openeditLastnameModal = (lastname: string) => {
  isOpen.value = true;
  modeLabel = 'le nom'
  mode.value = 'lastname';
  form.value.lastname = lastname;
};

const openeditEmailModal = (email: string) => {
  isOpen.value = true;
  modeLabel = 'l\'e-mail'
  mode.value = 'email';
  form.value.email = email;
};

const openAddAddressModal = () => {
  isOpen.value = true;
  mode.value = 'addAddress';
  form.value.street = '';
  form.value.postalCode = '';
  form.value.city = '';
  form.value.country = '';
};

const openEditAddressModal = (address) => {
  isOpen.value = true;
  mode.value = 'editAddress';
  editingAddress = address;
  form.value.street = address.street;
  form.value.postalCode = address.postalCode;
  form.value.city = address.city;
  form.value.country = address.country;
};

const closeModal = () => {
  isOpen.value = false;
};

const deleteAddress = async (id) => {
  await axios.delete(`http://localhost:3000/adressusers/${id}`);
  user.value.deliveryAddress = user.value.deliveryAddress.filter(address => address.id !== id);
};

const handleSubmit = async () => {
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    return router.push('/');
  }

    let response;
    if (mode.value === 'addAddress') {
      response = await axios.post(`http://localhost:3000/adressusers/${authToken}`, form.value);
      user.value.deliveryAddress.push(response.data);
    } else if (mode.value === 'editAddress' && editingAddress) {
      response = await axios.put(`http://localhost:3000/adressusers/${authToken}`, form.value);
      Object.assign(editingAddress, response.data);
    } else {
      const field = mode.value;
      response = await axios.patch(`http://localhost:3000/users/${authToken}`, { [field]: form.value[field] });
      user.value[field] = response.data[field];
    }

    closeModal();
};

onMounted(async () => {
  await fetchUserProfile();
});
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
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.delivery-address:hover {
  background-color: #f0f0f0;
}

.address-info {
  flex: 1;
}

.address-info p {
  margin: 5px 0;
}

.address-actions {
  display: flex;
  align-items: center;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-delete:hover {
  background-color: #c82333;
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

.modal-form input[type="text"],
.modal-form input[type="email"] {
  width: calc(100% - 16px);
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.buttons {
  margin-top: 20px;
  text-align: right;
}

.edit-icon {
  cursor: pointer;
  margin-left: 10px;
  color: #007bff;
}
</style>
