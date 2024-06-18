<template>
    <div class="products">
      <h1>Produits</h1>
      <button @click="showAddProductModal" class="btn btn-success">Ajouter Produit</button>
  
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Description</th>
            <th>Prix</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.name }}</td>
            <td>{{ product.description }}</td>
            <td>{{ product.price }}</td>
            <td>
              <button @click="showEditProductModal(product)" class="btn btn-primary">Modifier</button>
              <button @click="deleteProduct(product)" class="btn btn-danger">Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="closeModal">&times;</span>
          <h2 v-if="isEditing">Modifier Produit</h2>
          <h2 v-else>Ajouter Produit</h2>
          <form @submit.prevent="isEditing ? updateProduct() : addProduct()">
            <label for="name">Nom</label>
            <input v-model="currentProduct.name" type="text" id="name" required>
  
            <label for="description">Description</label>
            <textarea v-model="currentProduct.description" id="description" rows="4" required></textarea>
  
            <label for="price">Prix</label>
            <input v-model="currentProduct.price" type="number" step="0.01" id="price" required>
  
            <button type="submit" class="btn btn-primary">{{ isEditing ? 'Modifier' : 'Ajouter' }}</button>
          </form>
        </div>
      </div>
    </div>
  </template>

<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { z } from 'zod';

const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  price: z.number().min(0.01, "Le prix doit être supérieur à 0")
});

const products = ref([]);
const currentProduct = ref({
  name: '',
  description: '',
  price: 0
});
const showModal = ref(false);
const isEditing = ref(false);

const fetchProducts = async () => {
  try {
    const response = await axios.get('http://localhost:3000/products');
    products.value = response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits :', error);
  }
};

const addProduct = async () => {
  try {
    const parsedProduct = productSchema.parse(currentProduct.value);
    const response = await axios.post('http://localhost:3000/products', parsedProduct);
    products.value.push(response.data);
    closeModal();
  } catch (error) {
    console.error('Erreur lors de l\'ajout du produit :', error);
  }
};

const updateProduct = async () => {
  try {
    const parsedProduct = productSchema.parse(currentProduct.value);
    await axios.put(`http://localhost:3000/products/${currentProduct.value.id}`, parsedProduct);
    const index = products.value.findIndex(p => p.id === currentProduct.value.id);
    if (index !== -1) {
      products.value[index] = currentProduct.value;
    }
    closeModal();
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit :', error);
  }
};

const deleteProduct = async (product) => {
  try {
    await axios.delete(`http://localhost:3000/products/${product.id}`);
    products.value = products.value.filter(p => p.id !== product.id);
  } catch (error) {
    console.error('Erreur lors de la suppression du produit :', error);
  }
};

const showAddProductModal = () => {
  isEditing.value = false;
  currentProduct.value = {
    name: '',
    description: '',
    price: 0
  };
  showModal.value = true;
};

const showEditProductModal = (product) => {
  isEditing.value = true;
  currentProduct.value = { ...product };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
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
  }

  .close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
  }

  .close:hover,
  .close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
  }

  .btn {
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    text-transform: uppercase;
  }

  .btn-primary {
    background-color: #007bff;
    color: white;
  }

  .btn-primary:hover {
    background-color: #0069d9;
  }

  .btn-success {
    background-color: #28a745;
    color: white;
  }

  .btn-success:hover {
    background-color: #218838;
  }

  .btn-danger {
    background-color: #dc3545;
    color: white;
  }

  .btn-danger:hover {
    background-color: #c82333;
  }
</style>
