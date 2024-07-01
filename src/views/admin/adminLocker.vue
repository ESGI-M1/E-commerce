<template>
  <div class="products">
    <h1>Produits</h1>
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
              <img
                :src="
                  product.Images ? product.Images[0].url : require('@/assets/produit_avatar.jpg')
                "
                :alt="product.Images ? product.Images[0].description : 'Product image'"
                @click="triggerFileInput"
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
          <td>{{ product.active ? 'Oui' : 'Non' }}</td>
          <td>
            <button @click="showEditProductModal(product)" class="btn btn-primary">
              <i class="fa fa-edit"></i>
            </button>
            <button @click="deleteProduct(product)" class="btn btn-danger">
              <i class="fa fa-trash"></i>
            </button>
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
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { z } from 'zod'

const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Le nom est requis'),
  reference: z.string().min(1, 'La référence est requise'),
  description: z.string().min(1, 'La description est requise'),
  price: z.number().positive('Le prix doit être supérieur à 0'),
  active: z.boolean(),
  Categories: z.array(z.number())
})

// Définir le type des produits
interface Product {
  id?: number;
  name: string;
  reference: string;
  description: string;
  price: number;
  active: boolean;
  Categories: number[];
  Images?: { url: string; description: string }[]; // Ajouter ce champ facultatif si nécessaire
}

// Références réactives pour les produits et le produit courant
const products = ref<Product[]>([])
const currentProduct = ref<Product>({
  name: '',
  reference: '',
  description: '',
  price: 0,
  Categories: [],
  active: true // Définir la valeur par défaut pour active
})

const showModal = ref(false)
const isEditing = ref(false)

const fetchProducts = async () => {
  try {
    const response = await axios.get('http://localhost:3000/products')
    products.value = response.data
    console.log(products.value)
  } catch (error) {
    console.error('Erreur lors de la récupération des produits :', error)
  }
}

const addProduct = async () => {
  try {
    const parsedProduct = productSchema.parse({
      ...currentProduct.value,
      price: parseFloat(currentProduct.value.price)
    })
    const response = await axios.post('http://localhost:3000/products', parsedProduct)
    products.value.push(response.data)
    closeModal()
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit :", error)
  }
}

const updateProduct = async () => {
  try {
    const parsedProduct = productSchema.parse({
      ...currentProduct.value,
      price: parseFloat(currentProduct.value.price)
    })
    console.log(parsedProduct)
    await axios.patch(`http://localhost:3000/products/${currentProduct.value.id}`, parsedProduct)
    const index = products.value.findIndex((p) => p.id === currentProduct.value.id)
    if (index !== -1) {
      products.value[index] = currentProduct.value
    }
    closeModal()
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Zod : Erreur lors de la modification du produit :', error.errors)
    } else {
      console.error('Erreur lors de la modification du produit :', error)
    }
  }
}

const deleteProduct = async (product) => {
  try {
    await axios.delete(`http://localhost:3000/products/${product.id}`)
    products.value = products.value.filter((p) => p.id !== product.id)
  } catch (error) {
    console.error('Erreur lors de la suppression du produit :', error)
  }
}

const categories = ref([])
const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:3000/categories')
    categories.value = response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories :', error)
  }
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
  try {
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
  } catch (error) {
    console.error("Erreur lors de la modification de l'image du produit :", error)
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
  max-width: 25%;
  cursor: pointer;
}
</style>
