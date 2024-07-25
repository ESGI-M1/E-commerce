<template>
  <div class="products">
    <div class="div-header">
      <h1>Produits ({{ products.length }})</h1>
      <button @click="showAddProductModal" class="btn btn-success">
        <i class="fa fa-plus"></i> Ajouter un produit
      </button>
    </div>

    <div class="filters">
      <div>
      <label>Identifiant</label>
      <input v-model="filters.searchTerm" type="text" />
    </div>
    <div>
      <label>Prix</label>
      <input v-model.number="filters.price" type="number" step="0.01" />
    </div>
  </div>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nom</th>
          <th>Référence</th>
          <th>Description</th>
          <th>Prix</th>
          <th>Catégories</th>
          <th>Catégorie par défaut</th>
          <th>Actif</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="filteredProducts.length > 0"v-for="product in filteredProducts" :key="product.id">
          <td>{{ product.id }}</td>
          <td>{{ product.name }}</td>
          <td>{{ product.reference }}</td>
          <td>{{ truncateString(product.description, 200) }}</td>
          <td>{{ product.price }} €</td>
          <td>
            <ul>
              <li v-for="category in product.Categories" :key="category.id">{{ category.name }}</li>
            </ul>
          </td>
          <td>{{ product.defaultCategoryId ? categories.find((c) => c.id === product.defaultCategoryId)?.name : '' }}</td>
          <td>
            <i :class="product.active ? 'fa fa-check text-success' : 'fa fa-times text-danger'"></i>
          </td>
          <td>
            <div class="actions">
            <a @click="showEditProductModal(product)" class="a-primary" title="Modifier">
              <i class="fa fa-edit"></i>
            </a>
            <RouterLink :to="{ name: 'ProductVariants', params : { productId: product.id } }" class="a-primary" title="Modifier les déclinaisons">
              <i class="fa fa-edit"></i>
            </RouterLink>
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
        <tr v-else>
          <td class="empty" colspan="9">Aucun produit trouvé</td>
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
                <option v-for="category in categories" :key="category.id" :value="category">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="categoryDefault">Catégorie par défaut</label>
              <select v-model="currentProduct.defaultCategoryId" id="categoryDefault">
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
import { ref, onMounted, inject, computed } from 'vue'
import { z, ZodError } from 'zod'
import FancyConfirm from '../../components/ConfirmComponent.vue'
import { load } from '../../components/loading/loading'; 

const { loading, startLoading, stopLoading } = load();
const showNotification = inject('showNotification');

const categorySchema = z.object({
  id: z.number(),
  name: z.string()
})

const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Le nom est requis'),
  reference: z.string().min(1, 'La référence est requise'),
  description: z.string().min(1, 'La description est requise'),
  price: z.number({ coerce: true }).positive('Le prix doit être supérieur à 0'),
  active: z.boolean(),
  Categories: z.array(categorySchema),
  defaultCategoryId: z.number().nullable().optional()
})

const productsSchema = z.array(productSchema)

type Product = z.infer<typeof productSchema>;

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
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/products`)
    products.value = productsSchema.parse(response.data)
  } catch(error) {

    if(error instanceof ZodError) {
      console.log(error.errors)
    }

    console.log(error)
    showNotification('Une erreur est survenue lors du chargement des produits', 'error');
  }

}

const addProduct = async () => {

  try {
    const parsedProduct = productSchema.parse(currentProduct.value)
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/products`, parsedProduct)
    products.value.push(response.data)
    closeModal()
    showNotification('Produit ajouté avec succès', 'success');
  } catch(error) {

    if(error instanceof ZodError) {
      console.log(error.errors)
    }

    console.log(error)
  }
}

const updateProduct = async () => {

  try {
    const parsedProduct = productSchema.parse(currentProduct.value)
    await axios.patch(`${import.meta.env.VITE_API_BASE_URL}/products/${currentProduct.value.id}`, parsedProduct)
    const index = products.value.findIndex((p) => p.id === currentProduct.value.id)
    if (index !== -1) {
      products.value[index] = currentProduct.value
    }
    closeModal()
    showNotification('Produit modifié avec succès', 'success');
  } catch(error) {

    if(error instanceof ZodError) {
      console.log(error.errors)
    }

    console.log(error)
  }
}

const deleteProduct = async (product) => {
  try{ 
    startLoading();
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/products/${product.id}`)
    products.value = products.value.filter((p) => p.id !== product.id)
    showNotification('Produit supprimé avec succès', 'success');
  } finally {
    stopLoading();
  }
}

const categories = ref([])
const fetchCategories = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/categories`)
  categories.value = response.data
}

const showAddProductModal = () => {
  isEditing.value = false
  currentProduct.value = {
    name: '',
    reference: '',
    description: '',
    price: 0,
    Categories: [],
    active: true,
    defaultCategory: null
  }
  showModal.value = true
}

const showEditProductModal = (product : Product) => {
  isEditing.value = true
  currentProduct.value = { ...product }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const truncateString = (string: string, sub: number) => {
  if (!string) return ''
  return string.length > sub ? `${string.substring(0, sub)}...` : string
}

const filters = ref({
  searchTerm: '',
  price: null
})

const filteredProducts = computed(() => {
  let filtered = [...products.value]

  if (filters.value.searchTerm) {
    const searchTermLower = filters.value.searchTerm.toLowerCase()
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchTermLower) ||
      product.reference.toLowerCase().includes(searchTermLower)
    )
  }

  if (filters.value.price !== null && filters.value.price !== '') {
    const priceFilter = parseFloat(filters.value.price)
    filtered = filtered.filter(product => {
      // Vérifier si le prix commence par les chiffres entrés
      const productPriceString = product.price.toString()
      if (productPriceString.startsWith(filters.value.price)) {  
        return true
      }
      // Vérifier si le prix est exactement égal à la valeur saisie
      return product.price === priceFilter
    })
  }

  return filtered
})

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

.filters {
  display: flex;
  margin-bottom: 20px;
}

.filters div {
  display: flex;
  flex-direction: column;
}

.filters input {
  margin-right: 10px;
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
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

.actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
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

