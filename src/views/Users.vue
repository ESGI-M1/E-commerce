<template>
  <div class="users">
    <h1>Utilisateurs</h1>
    <button @click="showAddUserModal">Ajouter Utilisateur</button>

    <table>
      <thead>
        <tr>
          <th>Nom</th>
          <th>Prénom</th>
          <th>Email</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.lastname }}</td>
          <td>{{ user.firstname }}</td>
          <td>{{ user.email }}</td>
          <td>
            <button @click="showEditUserModal(user)">Modifier</button>
            <button @click="deleteUser(user)">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h2 v-if="isEditing">Modifier Utilisateur</h2>
        <h2 v-else>Ajouter Utilisateur</h2>
        <form @submit.prevent="isEditing ? updateUser() : addUser()">
          <label for="firstname">Prénom</label>
          <input v-model="currentUser.firstname" type="text" id="firstname" required>

          <label for="lastname">Nom</label>
          <input v-model="currentUser.lastname" type="text" id="lastname" required>

          <label for="email">Email</label>
          <input v-model="currentUser.email" type="email" id="email" required>

          <label for="password">Mot de passe</label>
          <input v-model="currentUser.password" type="password" id="password" required>

          <button type="submit">{{ isEditing ? 'Modifier' : 'Ajouter' }}</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { z } from 'zod';

const userSchema = z.object({
  id: z.number().optional(),
  firstname: z.string().min(1, "Le prénom est requis"),
  lastname: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit comporter au moins 8 caractères")
});

const users = ref([]);
const currentUser = ref({
  firstname: '',
  lastname: '',
  email: '',
  password: ''
});
const showModal = ref(false);
const isEditing = ref(false);

const fetchUsers = async () => {
  try {
    const response = await axios.get('http://localhost:3000/users');
    users.value = response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error);
  }
};

const addUser = async () => {
  try {
    const parsedUser = userSchema.parse(currentUser.value);
    const response = await axios.post('http://localhost:3000/users', parsedUser);
    users.value.push(response.data);
    closeModal();
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'utilisateur :', error);
  }
};

const updateUser = async () => {
  try {
    const parsedUser = userSchema.parse(currentUser.value);
    await axios.put(`http://localhost:3000/users/${currentUser.value.id}`, parsedUser);
    const index = users.value.findIndex(u => u.id === currentUser.value.id);
    if (index !== -1) {
      users.value[index] = currentUser.value;
    }
    closeModal();
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
  }
};

const deleteUser = async (user) => {
  try {
    await axios.delete(`http://localhost:3000/users/${user.id}`);
    users.value = users.value.filter(u => u.id !== user.id);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur :', error);
  }
};

const showAddUserModal = () => {
  isEditing.value = false;
  currentUser.value = {
    firstname: '',
    lastname: '',
    email: '',
    password: ''
  };
  showModal.value = true;
};

const showEditUserModal = (user) => {
  isEditing.value = true;
  currentUser.value = { ...user };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

onMounted(() => {
  fetchUsers
})();
</script>

<style scoped>
  .modal {
    display: block;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0, 0, 0);
    background-color: rgba(0, 0, 0, 0.4);
  }

  .modal-content {
    background-color: #fefefe;
    margin: 10% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
  }

  .close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
  }

  .close:hover,
  .close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }
</style>
