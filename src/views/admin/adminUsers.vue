<template>
  <div class="users">
    <h1>Utilisateurs ({{ users.length }})</h1>
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
          <td class="flex flex-center">
            <a @click="showEditUserModal(user)" class="a-primary">
              <i class="fa fa-edit"></i>
            </a>
            &nbsp;
            <fancy-confirm
                :class="'a-danger'"
                :confirmationMessage="'Etes-vous sûr de vouloir supprimer l\'utilisateur ?'"
                :elementType="'a'"
                @confirmed="deleteUser(user.id)"
            >
            <template #buttonText>
              <i class="fa fa-trash"></i>
            </template>
          </fancy-confirm>
          &nbsp;
            <button @click="resetPassword(user.id)" class="btn btn-warning">
              Réinitialiser MDP
            </button>
          </td>
        </tr>
      </tbody>
    </table>

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
            <button type="submit" class="btn btn-primary">
              {{ isEditing ? 'Modifier' : 'Ajouter' }}
            </button>
            <button type="button" class="btn btn-danger" @click="closeModal">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from '../../tools/axios';
import { ref, onMounted } from 'vue'
import { z } from 'zod'
import FancyConfirm from '../../components/ConfirmComponent.vue'

const userSchema = z.object({
  id: z.number().optional(),
  firstname: z.string().min(1, 'Le prénom est requis'),
  lastname: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Adresse email invalide'),
  role: z.string(),
  password: z.string().optional()
})

type User = z.infer<typeof userSchema>

const users = ref<User[]>([])
const currentUser = ref<User>({
  firstname: '',
  lastname: '',
  email: '',
  role: '',
  password: generateRandomPassword(12)
})

const showModal = ref(false)
const isEditing = ref(false)
const numberOfUsers = ref(0)

const fetchUsers = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users`)

  users.value = response.data
}

function generateRandomPassword(length: number): string {
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()-_=+[{]}|;:,<.>/?';

  const allChars = lowercaseLetters + uppercaseLetters + numbers + specialChars;

  let password = '';
  let charTypesCount = 0;

  while (password.length < length || charTypesCount < 4) {
    password = '';
    charTypesCount = 0;

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * allChars.length);
      password += allChars[randomIndex];
    }

    if (/[a-z]/.test(password)) charTypesCount++;
    if (/[A-Z]/.test(password)) charTypesCount++;
    if (/\d/.test(password)) charTypesCount++;
    if (/[^a-zA-Z\d]/.test(password)) charTypesCount++;
  }

  return password;
}

const addUser = async () => {
    const parsedUser = userSchema.parse(currentUser.value)
    parsedUser.password = generateRandomPassword(15)
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users`, parsedUser)
    users.value.push(response.data)
    closeModal()
}

const updateUser = async () => {
    const parsedUser = userSchema.parse(currentUser.value)
    const response = await axios.patch(
      `${import.meta.env.VITE_API_BASE_URL}/users/${currentUser.value.id}`,
      parsedUser
    )
    const updatedUser = response.data
    const index = users.value.findIndex((u) => u.id === updatedUser.id)
    if (index !== -1) {
      users.value.splice(index, 1, updatedUser)
    }
    closeModal()
}

const deleteUser = async (userId: number) => {
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/users/${userId}`)
    users.value = users.value.filter(user => user.id !== userId)
}

// Fonction pour afficher le modal d'ajout d'utilisateur
const showAddUserModal = () => {
  isEditing.value = false
  currentUser.value = {
    firstname: '',
    lastname: '',
    email: '',
    role: ''
  }
  showModal.value = true
}

// Fonction pour afficher le modal de modification d'utilisateur
const showEditUserModal = (user: User) => {
  isEditing.value = true
  currentUser.value = { ...user }
  showModal.value = true
}

// Fonction pour fermer le modal
const closeModal = () => {
  showModal.value = false
}

// Fonction pour réinitialiser le mot de passe d'un utilisateur
const resetPassword = async (userId: number) => {
  await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/${userId}/reset-password`)
  alert('Le mot de passe a été réinitialisé.')
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
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

.form-group input[type='text'],
.form-group input[type='email'],
.form-group input[type='password'] {
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
