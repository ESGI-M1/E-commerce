<template>
  <div class="promos">
    <h1>Codes Promos</h1>
    <button class="btn btn-success" @click="showAddForm">
      <i class="fa fa-plus"></i> Ajouter Code Promo
    </button>

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
            <button @click="editPromo(promo.id)" class="btn btn-primary">Modifier</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showAddEditForm" class="modal">
      <div class="modal-content">
        <span class="close" @click="cancelEdit">&times;</span>
        <h2 v-if="editMode">Modifier Code Promo</h2>
        <h2 v-else>Ajouter Code Promo</h2>
        <form @submit.prevent="handleSubmit">
          <label for="code">Code:</label>
          <input type="text" id="code" v-model="promo.code" required />

          <label for="startDate">Date de début:</label>
          <input type="date" id="startDate" v-model="promo.startDate" required />

          <label for="endDate">Date de fin:</label>
          <input type="date" id="endDate" v-model="promo.endDate" required />

          <label for="discountPercentage">Pourcentage de réduction (%):</label>
          <input
            type="number"
            id="discountPercentage"
            v-model="promo.discountPercentage"
            required
          />

          <button type="submit" class="btn btn-primary">
            {{ editMode ? 'Modifier' : 'Ajouter' }}
          </button>
          <button type="button" class="btn btn-danger" @click="cancelEdit">Annuler</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { format, parseISO } from 'date-fns'

const promos = ref([])
const promo = ref({
  code: '',
  startDate: '',
  endDate: '',
  discountPercentage: 0
})
const editMode = ref(false)
const showAddEditForm = ref(false)

const fetchPromos = async () => {
  try {
    const response = await axios.get('http://localhost:3000/promos')
    promos.value = response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des codes promos:', error)
  }
}

const handleSubmit = async () => {
  try {
    if (editMode.value) {
      await axios.put(`http://localhost:3000/promos/${promo.value.id}`, promo.value)
      editMode.value = false
    } else {
      await addPromo()
    }
    fetchPromos()
    cancelEdit()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du code promo:', error)
  }
}

const addPromo = async () => {
  try {
    const response = await axios.post('http://localhost:3000/promos', promo.value)
    promos.value.push(response.data) // Ajouter le nouveau promo à la liste locale
  } catch (error) {
    console.error("Erreur lors de l'ajout du code promo:", error)
    throw error // À adapter selon la gestion d'erreur souhaitée
  }
}

const editPromo = async (promoId) => {
  try {
    const response = await axios.put(`http://localhost:3000/promos/${promoId}`)
    promo.value = response.data
    editMode.value = true
    showAddEditForm.value = true
  } catch (error) {
    console.error('Erreur lors de la récupération du code promo pour modification:', error)
  }
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

const formatDate = (dateStr) => {
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

.modal {
  display: block;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: 10% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 600px;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-transform: uppercase;
  margin-right: 5px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0069d9;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover {
  background-color: #218838;
}
</style>
