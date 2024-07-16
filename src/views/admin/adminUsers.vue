<template>
  <div class="users">
    <div class="div-header">
      <h1>Utilisateurs ({{ users.length }})</h1>
      <button @click="showAddUserModal" class="btn btn-success">
        <i class="fa fa-plus"></i> Ajouter un utilisateur
      </button>
    </div>
    <div class="filters">
     <label>Identifiant</label>
     <br>
      <input v-model="filters.search" type="text" />
    </div>
    <table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Nom</th>
          <th>Prénom</th>
          <th>Email</th>
          <th>Tél</th>
          <th>Rôle</th>
          <th>Actif</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in filteredUsers" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.lastname }}</td>
          <td>{{ user.firstname }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.phone }}</td>
          <td>{{ user.role }}</td>
          <td>
            <i :class="user.active ? 'fa fa-check text-success' : 'fa fa-times text-danger'"></i>
          </td>
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
            <br>
            <span v-if="errors.firstname" class="error">{{ errors.firstname }}</span>
          </div>

          <div class="form-group">
            <label for="lastname">Nom:</label>
            <input v-model="currentUser.lastname" type="text" id="lastname" required />
            <br>
            <span v-if="errors.lastname" class="error">{{ errors.lastname }}</span>
          </div>

          <div class="form-group">
            <label for="email">Email:</label>
            <input v-model="currentUser.email" type="email" id="email" required />
            <br>
            <span v-if="errors.email" class="error">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="phone">Téléphone:</label>
            <input v-model="currentUser.phone" type="tel" id="phone" />
            <br>
            <span v-if="errors.phone" class="error">{{ errors.phone }}</span>
          </div>

          <div class="form-group">
            <label for="role">Rôle:</label>
            <input v-model="currentUser.role" type="text" id="role" required />
            <br>
            <span v-if="errors.role" class="error">{{ errors.role }}</span>
          </div>

          <div class="form-group">
            <label for="active">Actif</label>
            <input v-model="currentUser.active" type="checkbox" id="active" />
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


<script setup lang="ts">import axios from '../../tools/axios';
import { ref, onMounted, computed, inject } from 'vue';
import { z } from 'zod';
import FancyConfirm from '../../components/ConfirmComponent.vue';
import { load } from '../../components/loading/loading'; 

const { loading, startLoading, stopLoading } = load();
const phoneRegex = /^(\+33[1-9]\d{8}|0\d{9})$/;
const showNotification = inject('showNotification');

const userSchema = z.object({
  id: z.number().optional(),
  firstname: z.string().min(1, 'Le prénom est requis'),
  lastname: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().optional().nullable().refine(value => value === null || value === '' || phoneRegex.test(value), {
    message: "Le numéro de téléphone doit être au format +33xxxxxxxxx ou 06xxxxxxxx",
  }),
  role: z.string(),
  active: z.boolean().optional(),
  password: z.string().optional()
});

type User = z.infer<typeof userSchema>;

const users = ref<User[]>([]);
const currentUser = ref<User>({
  firstname: '',
  lastname: '',
  email: '',
  phone: '',
  role: '',
  active: true,
  password: generateRandomPassword(15)
});

const showModal = ref(false);
const isEditing = ref(false);
const errors = ref<{ [key: string]: string }>({});

const filters = ref({
  search: ''
});

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const searchTerm = filters.value.search.toLowerCase();
    return (
      user.firstname.toLowerCase().includes(searchTerm) ||
      user.lastname.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  });
});

const fetchUsers = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users`);
  users.value = response.data;
};

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
  try {
    errors.value = {};
    const parsedUser = userSchema.parse(currentUser.value);
    parsedUser.password = generateRandomPassword(15);
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users`, parsedUser);
    users.value.push(response.data);
    closeModal();
    showNotification('Utilisateur ajouté avec succès', 'success');
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(e => {
        if (e.path.length > 0) {
          errors.value[e.path[0] as string] = e.message;
        }
      });
    }
  }
};

const updateUser = async () => {
  try {
    errors.value = {};
    const parsedUser = userSchema.parse(currentUser.value);
    const response = await axios.patch(
      `${import.meta.env.VITE_API_BASE_URL}/users/${currentUser.value.id}`,
      parsedUser
    );
    const updatedUser = response.data;
    const index = users.value.findIndex((u) => u.id === updatedUser.id);
    if (index !== -1) {
      users.value.splice(index, 1, updatedUser);
    }
    closeModal();
    showNotification('Utilisateur modifié avec succès', 'success');
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach(e => {
        if (e.path.length > 0) {
          errors.value[e.path[0] as string] = e.message;
        }
      });
    }
  }
};

const deleteUser = async (userId: number) => {
  try{
    startLoading();
  await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/users/${userId}`);
  users.value = users.value.filter(user => user.id !== userId);
  showNotification('Utilisateur supprimé avec succès', 'success');
} finally {
    stopLoading();
  }
};

const showAddUserModal = () => {
  isEditing.value = false;
  currentUser.value = {
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    role: '',
    active: true,
    password: generateRandomPassword(15)
  };
  showModal.value = true;
};

const showEditUserModal = (user: User) => {
  isEditing.value = true;
  currentUser.value = { ...user };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const resetPassword = async (userId: number) => {
  await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/${userId}/reset-password`);
  showNotification('Le mot de passe a été réinitialisé.', 'success');
};

onMounted(() => {
  fetchUsers();
});
</script>
<style scoped>

.users {
  padding: 20px;
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

.text-success {
  color: green;
}

.text-danger {
  color: red;
}


.filters input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

</style>
