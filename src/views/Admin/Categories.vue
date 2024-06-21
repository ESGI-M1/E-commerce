<template>
  <div class="categories">
    <h1>Gestion des Catégories</h1>

    <!-- Ajouter une nouvelle catégorie -->
    <div class="add-category">
      <h2>Ajouter une Catégorie</h2>
      <form @submit.prevent="addCategory">
        <label for="name">Nom</label>
        <input v-model="newCategory.name" type="text" id="name" required />

        <label for="slug">Slug</label>
        <input v-model="newCategory.slug" type="text" id="slug" required />

        <label for="description">Description</label>
        <textarea v-model="newCategory.description" id="description"></textarea>

        <label for="parentCategoryId">Catégorie Parent</label>
        <select v-model="newCategory.parentCategoryId" id="parentCategoryId">
          <option value="">Aucune</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>

        <label for="products">Produits</label>
        <select v-model="newCategory.Products" id="products" multiple>
          <option v-for="product in products" :key="product.id" :value="product.id">
            {{ product.name }}
          </option>
        </select>

        <button type="submit" class="btn add-btn"><i class="fas fa-plus"></i> Ajouter</button>
      </form>
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
            <td><input v-model="category.name" type="text" required /></td>
            <td><input v-model="category.slug" type="text" required /></td>
            <td><input v-model="category.description" type="text" /></td>
            <td>
              <select v-model="category.parentCategoryId">
                <option value="">Aucune</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </td>
            <td>
              {{ category.Products.length }}
              <select v-model="category.Products" multiple>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }}
                </option>
              </select>
            </td>
            <td>
              <button @click="updateCategory(category)" class="btn edit-btn">
                <i class="fas fa-edit"></i> Modifier
              </button>
              <button @click="deleteCategory(category)" class="btn delete-btn">
                <i class="fas fa-trash-alt"></i> Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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
const newCategory = ref({
  name: '',
  slug: '',
  description: '',
  parentCategoryId: null,
  Products: []
})

const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:3000/categories')
    categories.value = response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories :', error)
  }
}

const addCategory = async () => {
  try {
    const parsedCategory = categorySchema.parse(newCategory.value)
    const response = await axios.post('http://localhost:3000/categories', parsedCategory)
    categories.value.push(response.data)
    clearNewCategory()
  } catch (error) {
    console.error("Erreur lors de l'ajout de la catégorie :", error)
  }
}

const updateCategory = async (category) => {
  try {
    console.log(category)
    const parsedCategory = categorySchema.parse(category)
    await axios.patch(`http://localhost:3000/categories/${category.id}`, parsedCategory)
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

const products = ref([])
const fetchProducts = async () => {
  try {
    const response = await axios.get('http://localhost:3000/products')
    products.value = response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des produits :', error)
  }
}

const clearNewCategory = () => {
  newCategory.value = {
    name: '',
    slug: '',
    description: '',
    parentCategoryId: null,
    Products: []
  }
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

.add-category,
.category-table {
  margin-bottom: 20px;
}

form {
  margin-bottom: 10px;
}

input,
textarea,
select {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
}

.btn {
  cursor: pointer;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
}

.add-btn {
  background-color: #42b983;
  color: white;
}

.add-btn:hover {
  background-color: #36a67d;
}

.edit-btn {
  background-color: #f0ad4e;
  color: white;
}

.edit-btn:hover {
  background-color: #eea236;
}

.delete-btn {
  background-color: #d9534f;
  color: white;
}

.delete-btn:hover {
  background-color: #c9302c;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
</style>
