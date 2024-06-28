<template>
  <div class="categories">
    <h1>Gestion des Catégories</h1>
    <div class="text-right">
      <button @click="showAddCategoryModal" class="btn btn-success">
        <i class="fa fa-plus"></i> Ajouter Catégorie
      </button>
    </div>

    <!-- Tableau des catégories -->
    <div class="category-table">
      <h2>Liste des Catégories</h2>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Slug</th>
            <th>Description</th>
            <th>Catégorie Parent</th>
            <th>Produits</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td>{{ category.name }}</td>
            <td>{{ category.slug }}</td>
            <td>{{ category.description }}</td>
            <td>{{ findCategoryName(category.parentCategoryId) }}</td>
            <td>{{ category.Products.length }}</td>
            <td>
              <button @click="showEditCategoryModal(category)" class="btn btn-primary">
                <i class="fa fa-edit"></i>
              </button>
              <button @click="deleteCategory(category)" class="btn btn-danger">
                <i class="fa fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal pour ajouter/modifier une catégorie -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <span class="close" @click="closeModal">&times;</span>
        <h2 v-if="isEditing">Modifier Catégorie</h2>
        <h2 v-else>Ajouter Catégorie</h2>
        <form @submit.prevent="isEditing ? updateCategory() : addCategory()">
          <div class="form-group">
            <label for="name">Nom</label>
            <input v-model="currentCategory.name" type="text" id="name" required />
          </div>

          <div class="form-group">
            <label for="slug">Slug</label>
            <input v-model="currentCategory.slug" type="text" id="slug" required />
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea v-model="currentCategory.description" id="description"></textarea>
          </div>

          <div class="form-group">
            <label for="parentCategoryId">Catégorie Parent</label>
            <select v-model="currentCategory.parentCategoryId" id="parentCategoryId">
              <option value="">Aucune</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="products">Produits</label>
            <select v-model="currentCategory.Products" id="products" multiple>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.name }}
              </option>
            </select>
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
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { z } from 'zod'

const categorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Le nom est requis'),
  slug: z.string().min(1, 'Le slug est requis'),
  description: z.string().optional(),
  parentCategoryId: z.number().nullable(),
  Products: z.array(z.number())
})

const categories = ref([])
const currentCategory = ref({
  name: '',
  slug: '',
  description: '',
  parentCategoryId: null,
  Products: []
})
const showModal = ref(false)
const isEditing = ref(false)

const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:3000/categories')
    categories.value = response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories :', error)
  }
}

const fetchProducts = async () => {
  try {
    const response = await axios.get('http://localhost:3000/products')
    products.value = response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des produits :', error)
  }
}

const addCategory = async () => {
  try {
    const parsedCategory = categorySchema.parse(currentCategory.value)
    const response = await axios.post('http://localhost:3000/categories', parsedCategory)
    categories.value.push(response.data)
    closeModal()
  } catch (error) {
    console.error("Erreur lors de l'ajout de la catégorie :", error)
  }
}

const updateCategory = async () => {
  try {
    const parsedCategory = categorySchema.parse(currentCategory.value)
    await axios.patch(
      `http://localhost:3000/categories/${currentCategory.value.id}`,
      parsedCategory
    )
    const index = categories.value.findIndex((cat) => cat.id === currentCategory.value.id)
    if (index !== -1) {
      categories.value[index] = currentCategory.value
    }
    closeModal()
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('ZOD : Erreur lors de la modification de la catégorie :', error.errors)
    } else {
      console.error('Erreur lors de la modification de la catégorie :', error)
    }
  }
}

const deleteCategory = async (category) => {
  try {
    await axios.delete(`http://localhost:3000/categories/${category.id}`)
    categories.value = categories.value.filter((cat) => cat.id !== category.id)
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie :', error)
  }
}

const showAddCategoryModal = () => {
  isEditing.value = false
  currentCategory.value = {
    name: '',
    slug: '',
    description: '',
    parentCategoryId: null,
    Products: []
  }
  showModal.value = true
}

const showEditCategoryModal = (category) => {
  isEditing.value = true
  currentCategory.value = { ...category }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const findCategoryName = (id) => {
  const category = categories.value.find(cat => cat.id === id)
  return category ? category.name : ''
}

onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>

<style scoped>
.categories {
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
.form-group input[type='number'],
.form-group textarea,
.form-group select {
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
