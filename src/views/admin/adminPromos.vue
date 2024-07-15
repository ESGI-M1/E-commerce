<template>
  <div class="promos">
    <div class="div-header">
      <h1>Code promos ({{ promos.length }})</h1>
      <button @click="showAddForm" class="btn btn-success">
        <i class="fa fa-plus"></i> Ajouter un code promo
      </button>
    </div>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Code</th>
          <th>Date de début</th>
          <th>Date de fin</th>
          <th>Pourcentage de réduction</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="promo in promos" :key="promo.id">
          <td>{{ promo.id }}</td>
          <td>{{ promo.code }}</td>
          <td>{{ formatDate(promo.startDate) }}</td>
          <td>{{ formatDate(promo.endDate) }}</td>
          <td>{{ promo.discountPercentage }}</td>
          <td>
            <a @click="editPromo(promo.id)" class="a-primary">
              <i class="fa fa-edit"></i>
            </a>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showAddEditForm" class="modal-overlay">
      <div class="modal">
        <span class="close" @click="cancelEdit">&times;</span>
        <h2 v-if="editMode">Modifier Code Promo</h2>
        <h2 v-else>Ajouter Code Promo</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="code">Code:</label>
            <input type="text" id="code" v-model="promo.code" required />
          </div>

          <div class="form-group">
            <label for="startDate">Date de début:</label>
            <input type="date" id="startDate" v-model="promo.startDate" required />
          </div>

          <div class="form-group">
            <label for="endDate">Date de fin:</label>
            <input type="date" id="endDate" v-model="promo.endDate" required />
          </div>

          <div class="form-group">
            <label for="discountPercentage">Pourcentage de réduction (%):</label>
            <input
              type="number"
              id="discountPercentage"
              v-model="promo.discountPercentage"
              required
            />
          </div>

          <div class="buttons">
            <button type="submit" class="btn btn-primary">
              {{ editMode ? 'Modifier' : 'Ajouter' }}
            </button>
            <button type="button" class="btn btn-danger" @click="cancelEdit">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from '../../tools/axios';
import { format, parseISO } from 'date-fns'

interface Promo {
  id?: number
  code: string
  startDate: string
  endDate: string
  discountPercentage: number
}

const promos = ref<Promo[]>([])
const promo = ref<Promo>({
  code: '',
  startDate: '',
  endDate: '',
  discountPercentage: 0
})
const editMode = ref(false)
const showAddEditForm = ref(false)

const fetchPromos = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/promos`)
  promos.value = response.data
}

const handleSubmit = async () => {
  if (editMode.value) {
    await axios.put(`${import.meta.env.VITE_API_BASE_URL}/promos/${promo.value.id}`, promo.value)
    editMode.value = false
  } else {
    await addPromo()
  }
  fetchPromos()
  cancelEdit()
}

const addPromo = async () => {
  const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/promos`, promo.value)
  promos.value.push(response.data) // Ajouter le nouveau promo à la liste locale
}

const editPromo = async (promoId: number) => {
  const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/promos/${promoId}`)
  promo.value = response.data
  editMode.value = true
  showAddEditForm.value = true
}

const showAddForm = () => {
  promo.value = {
    code: '',
    startDate: '',
    endDate: '',
    discountPercentage: 0
  }
  editMode.value = false
  showAddEditForm.value = true
}

const formatDate = (dateStr: string) => {
  return format(parseISO(dateStr), 'dd/MM/yyyy')
}

const cancelEdit = () => {
  showAddEditForm.value = false
}

onMounted(fetchPromos)
</script>

<style scoped>
.promos {
  padding: 20px;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  cursor: pointer;
}

form {
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
.form-group input[type='date'],
.form-group input[type='number'] {
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
