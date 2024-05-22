<script lang="ts" setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { z } from 'zod';

const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  reference: z.string().min(1, "Reference is required"),
  price: z.number().min(0, "Price must be a positive number"),
  active: z.boolean().optional(),
  description: z.string().optional(),
});

const products = ref([]);
const newProduct = ref({
  name: '',
  reference: '',
  price: 0,
  active: false,
  description: ''
});

// Function to fetch products
const fetchProducts = async () => {
  try {
    const response = await axios.get('http://localhost:3000/products');
    products.value = response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

// Function to add a new product
const addProduct = async () => {
  try {
    const parsedProduct = productSchema.parse(newProduct.value);
    const response = await axios.post('http://localhost:3000/products', parsedProduct);
    products.value.push(response.data);
    newProduct.value = {
      name: '',
      reference: '',
      price: 0,
      active: false,
      description: ''
    };
  } catch (error) {
    console.error('Error adding product:', error);
  }
};

// Fetch products on component mount
onMounted(fetchProducts);

</script>

<template>
  <div class="products">
    <h1>Products</h1>
    <ul>
      <li v-for="product in products" :key="product.id">
        {{ product.name }} - {{ product.price }}
      </li>
    </ul>
  </div>

  <div class="addProducts">
    <h2>Add Products</h2>
    <form @submit.prevent="addProduct">
      <label for="name">Name</label>
      <input v-model="newProduct.name" type="text" id="name" name="name" required>

      <label for="reference">Reference</label>
      <input v-model="newProduct.reference" type="text" id="reference" name="reference" required>

      <label for="price">Price</label>
      <input v-model="newProduct.price" type="number" id="price" name="price" required>

      <label for="active">Active</label>
      <input v-model="newProduct.active" type="checkbox" id="active" name="active">

      <label for="description">Description</label>
      <textarea v-model="newProduct.description" id="description" name="description"></textarea>

      <button type="submit">Add Product</button>
    </form>
  </div>
</template>

<style scoped>
/* Add your styles here */
</style>
