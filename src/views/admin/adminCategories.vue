<template>
  <div class="categories">
    <h1>Catégories ({{ categories.length }})</h1>
    <div class="text-right">
      <button @click="showAddCategoryModal" class="btn btn-success">
        <i class="fa fa-plus"></i> Ajouter Catégorie
      </button>
    </div>

    <div class="category-table">
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
            <td><p v-if="category.Products">{{ category.Products.length }}</p></td>
            <td>
              <div class="flex">
              <a @click="showEditCategoryModal(category)" class="a-primary">
                <i class="fa fa-edit"></i>
              </a>
              &nbsp;
              <fancy-confirm
                :class="'a-danger'"
                :confirmationMessage="'Etes-vous sûr de vouloir supprimer la catégorie ?'"
                :elementType="'a'"
                @confirmed="deleteCategory(category)"
            >
            <template #buttonText>
              <i class="fa fa-trash"></i>
            </template>
          </fancy-confirm>
</div>

            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
import axios from '../../tools/axios';
import { ref, onMounted, inject } from 'vue'
import { z } from 'zod'
import FancyConfirm from '../../components/ConfirmComponent.vue'
const showNotification = inject('showNotification');

interface Category {
  id?: number
  name: string
  slug: string
  description?: string
  parentCategoryId?: number | null
  Products: number[]
}

interface Product {
  id: number
  name: string
}

const categorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Le nom est requis'),
  slug: z.string().min(1, 'Le slug est requis'),
  description: z.string().optional(),
  parentCategoryId: z.number().nullable(),
  Products: z.array(z.number())
})

const categories = ref<Category[]>([])
const currentCategory = ref<Category>({
  name: '',
  slug: '',
  description: '',
  parentCategoryId: null,
  Products: []
})
const products = ref<Product[]>([])
const showModal = ref(false)
const isEditing = ref(false)

const fetchCategories = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/categories`)
  categories.value = response.data
}

const fetchProducts = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products`)
  products.value = response.data
}

const addCategory = async () => {
    const parsedCategory = categorySchema.parse(currentCategory.value)
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/categories`, parsedCategory)
    categories.value.push(response.data)
    closeModal()
    showNotification('Catégorie ajoutée avec succès', 'success');
}

const updateCategory = async () => {
  const parsedCategory = categorySchema.parse(currentCategory.value)
  await axios.patch(
    `${import.meta.env.VITE_API_BASE_URL}/categories/${currentCategory.value.id}`,
    parsedCategory
  )
  const index = categories.value.findIndex((cat) => cat.id === currentCategory.value.id)
  if (index !== -1) {
    categories.value[index] = currentCategory.value
  }
  closeModal()
  showNotification('Catégorie modifiée avec succès', 'success');
}

const deleteCategory = async (category: Category) => {
  await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/categories/${category.id}`)
  categories.value = categories.value.filter((cat) => cat.id !== category.id)
  showNotification('Catégorie suprimée avec succès', 'success');
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

const showEditCategoryModal = (category: Category) => {
  isEditing.value = true
  currentCategory.value = { ...category }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const findCategoryName = (id: number | undefined) => {
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
