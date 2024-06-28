<template>
  <div class="users">
    <h1>Utilisateurs</h1>
    <div class="text-right">
    <button class="btn btn-success" @click="showAddUserModal">
      <i class="fa fa-plus"></i> Ajouter Utilisateur
    </button>
  </div>
    <table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Nom</th>
          <th>Prénom</th>
          <th>Email</th>
          <th>Rôle</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.lastname }}</td>
          <td>{{ user.firstname }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>
            <button @click="showEditUserModal(user)" class="btn btn-primary"><i class="fa fa-edit"></i></button>
            <button @click="resetPassword(user.id)" class="btn btn-warning">Réinitialiser MDP</button>
            <button @click="deleteUser(user.id)" class="btn btn-danger"><i class="fa fa-trash"></i></button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal pour Ajouter/Modifier Utilisateur -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <span class="close" @click="closeModal">&times;</span>
        <h2 v-if="isEditing">Modifier Utilisateur</h2>
        <h2 v-else>Ajouter Utilisateur</h2>
        <form @submit.prevent="isEditing ? updateUser() : addUser()" class="modal-form">
          <div class="form-group">
            <label for="firstname">Prénom:</label>
            <input v-model="currentUser.firstname" type="text" id="firstname" required />
          </div>

          <div class="form-group">
            <label for="lastname">Nom:</label>
            <input v-model="currentUser.lastname" type="text" id="lastname" required />
          </div>

          <div class="form-group">
            <label for="email">Email:</label>
            <input v-model="currentUser.email" type="email" id="email" required />
          </div>

          <div class="form-group">
            <label for="role">Rôle:</label>
            <input v-model="currentUser.role" type="text" id="role" required />
          </div>

          <div class="buttons">
            <button type="submit" class="btn btn-primary">{{ isEditing ? 'Modifier' : 'Ajouter' }}</button>
            <button type="button" class="btn btn-danger" @click="closeModal">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { z } from 'zod'

const userSchema = z.object({
  id: z.number().optional(),
  firstname: z.string().min(1, 'Le prénom est requis'),
  lastname: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Adresse email invalide'),
  role: z.string()
})

const users = ref([])
const currentUser = ref({
  id: null,
  firstname: '',
  lastname: '',
  email: '',
  role: ''
})
const showModal = ref(false)
const isEditing = ref(false)

const fetchUsers = async () => {
  try {
    const response = await axios.get('http://localhost:3000/users')
    users.value = response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs :', error)
  }
}

const addUser = async () => {
  try {
    const parsedUser = userSchema.parse(currentUser.value)
    const response = await axios.post('http://localhost:3000/users', parsedUser)
    users.value.push(response.data)
    closeModal()
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'utilisateur :", error)
  }
}

const updateUser = async () => {
  try {
    const parsedUser = userSchema.parse(currentUser.value)
    const response = await axios.patch(`http://localhost:3000/users/${currentUser.value.id}`, parsedUser)
    const updatedUser = response.data
    const index = users.value.findIndex(u => u.id === updatedUser.id)
    if (index !== -1) {
      users.value.splice(index, 1, updatedUser)
    }
    closeModal()
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error)
  }
}

const deleteUser = async (userId: number) => {
  try {
    await axios.delete(`http://localhost:3000/users/${userId}`);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur :", error)
  }
}

const showAddUserModal = () => {
  isEditing.value = false
  currentUser.value = {
    id: null,
    firstname: '',
    lastname: '',
    email: '',
    role: ''
  }
  showModal.value = true
}

const showEditUserModal = (user) => {
  isEditing.value = true
  currentUser.value = { ...user }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

onMounted(() => {
  fetchUsers()
})
</script>


<style scoped>
.modal-overlay {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: #fefefe;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-form {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"] {
  width: 100%;
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.buttons {
  margin-top: 20px;
}

.buttons button {
  margin-right: 10px;
}
</style>
