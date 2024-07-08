<template>
  <div class="products">
    <h1>Produits ({{ products.length }})</h1>
    <div class="text-right">
      <button @click="showAddProductModal" class="btn btn-success">
        <i class="fa fa-plus"></i> Ajouter Produit
      </button>
    </div>
    <table>
      <thead>
        <tr>
          <th>Images</th>
          <th>Nom</th>
          <th>Référence</th>
          <th>Description</th>
          <th>Prix</th>
          <th>Catégories</th>
          <th>Actif</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id">
          <td>
            <label class="image-upload">
              <input
                type="file"
                @change="handleImageChange($event, product)"
                accept="image/*"
                style="display: none"
              />
              <img :src="product.Images ? product.Images[0].url : '../../produit_avatar.jpg'" 
              :alt="product.Images ? product.Images[0].description : product.name" 
              class="product-image" 
              />
            </label>
          </td>
          <td>{{ product.name }}</td>
          <td>{{ product.reference }}</td>
          <td>{{ product.description }}</td>
          <td>{{ product.price }} €</td>
          <td>
            <ul>
              <li v-for="category in product.Categories" :key="category.id">{{ category.name }}</li>
            </ul>
          </td>
          <td>
            <i :class="product.active ? 'fa fa-check text-success' : 'fa fa-times text-danger'"></i>
          </td>
          <td>
            <div class="flex">
            <a @click="showEditProductModal(product)" class="a-primary">
              <i class="fa fa-edit"></i>
            </a>
            &nbsp;
            <fancy-confirm
                :class="'a-danger'"
                :confirmationMessage="'Etes-vous sûr de vouloir supprimer le produit ?'"
                :elementType="'a'"
                @confirmed="deleteProduct(product)"
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

    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <span class="close" @click="closeModal">&times;</span>
        <h2 v-if="isEditing">Modifier Produit</h2>
        <h2 v-else>Ajouter Produit</h2>
        <form @submit.prevent="isEditing ? updateProduct() : addProduct()">
          <div class="form-group">
            <label for="name">Nom</label>
            <input v-model="currentProduct.name" type="text" id="name" required />
          </div>

          <div class="form-group">
            <label for="reference">Référence</label>
            <input v-model="currentProduct.reference" type="text" id="reference" required />
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              v-model="currentProduct.description"
              id="description"
              rows="4"
              required
            ></textarea>
          </div>

          <div class="form-group">
            <label for="price">Prix</label>
            <input
              v-model.number="currentProduct.price"
              type="number"
              step="0.01"
              id="price"
              required
            />
          </div>

          <template v-if="isEditing">
            <div class="form-group">
              <label for="categories">Catégories</label>
              <select v-model="currentProduct.Categories" id="categories" multiple>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
          </template>

          <div class="form-group">
            <label for="active">Actif</label>
            <input v-model="currentProduct.active" type="checkbox" id="active" />
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

const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Le nom est requis'),
  reference: z.string().min(1, 'La référence est requise'),
  description: z.string().min(1, 'La description est requise'),
  price: z.number().positive('Le prix doit être supérieur à 0'),
  active: z.boolean(),
  Categories: z.array(z.number())
})

interface Product {
  id?: number;
  name: string;
  reference: string;
  description: string;
  price: number;
  active: boolean;
  Categories: number[];
  Images?: { url: string; description: string }[];
}

const products = ref<Product[]>([])
const currentProduct = ref<Product>({
  name: '',
  reference: '',
  description: '',
  price: 0,
  Categories: [],
  active: true
})

const showModal = ref(false)
const isEditing = ref(false)

const fetchProducts = async () => {
  const response = await axios.get('http://localhost:3000/products/admin')
  products.value = response.data
}

const addProduct = async () => {
  const parsedProduct = productSchema.parse({
    ...currentProduct.value,
    price: parseFloat(currentProduct.value.price)
  })
  const response = await axios.post('http://localhost:3000/products', parsedProduct, { withCredentials: true })
  products.value.push(response.data)
  closeModal()
}

const updateProduct = async () => {
  const parsedProduct = productSchema.parse({
    ...currentProduct.value,
    price: parseFloat(currentProduct.value.price)
  })
  console.log(parsedProduct)
  await axios.patch(`http://localhost:3000/products/${currentProduct.value.id}`, parsedProduct, { withCredentials: true })
  const index = products.value.findIndex((p) => p.id === currentProduct.value.id)
  if (index !== -1) {
    products.value[index] = currentProduct.value
  }
  closeModal()
}

const deleteProduct = async (product) => {
  await axios.delete(`http://localhost:3000/products/${product.id}`, { withCredentials: true })
  products.value = products.value.filter((p) => p.id !== product.id)
}

const categories = ref([])
const fetchCategories = async () => {
  const response = await axios.get('http://localhost:3000/categories')
  categories.value = response.data
}

const showAddProductModal = () => {
  isEditing.value = false
  currentProduct.value = {
    name: '',
    reference: '',
    description: '',
    price: 0,
    Categories: []
  }
  showModal.value = true
}

const showEditProductModal = (product) => {
  isEditing.value = true
  currentProduct.value = { ...product }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const updateProductImage = async (productId, newImage) => {
  const formData = new FormData()
  formData.append('image', newImage)

  const response = await axios.post(
    `http://localhost:3000/products/${productId}/image`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )

  // Mettre à jour les images du produit dans la liste
  const updatedProductIndex = products.value.findIndex((p) => p.id === productId)
  if (updatedProductIndex !== -1) {
    products.value[updatedProductIndex].Images = response.data.Images
  }
}

const triggerFileInput = () => {
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'image/*'
  fileInput.style.display = 'none'
  fileInput.addEventListener('change', (event) => {
    const newImage = event.target.files[0]
    updateProductImage(currentProduct.value.id, newImage)
  })
  fileInput.click()
}

/*
NOT USED
const handleImageChange = (event, product) => {
  // Ce gestionnaire peut être vide ici ou supprimé car on utilise `triggerFileInput` pour gérer le changement d'image.
}
*/

onMounted(() => {
  fetchProducts()
  fetchCategories()
})
</script>

<style scoped>
.products {
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

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
  cursor: pointer;
}

img {
  cursor: pointer;
}

.text-success {
  color: green;
}

.text-danger {
  color: red;
}
</style>
