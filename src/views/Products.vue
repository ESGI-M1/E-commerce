<script lang="ts" setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { z } from 'zod';

// CATEGORY
const categorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional()
});

const categories = ref([]);
const newCategory = ref({
  name: '',
  description: ''
});

// Function to fetch categories
const fetchCategories = async () => {
  try {
    const response = await axios.get('http://localhost:3000/categories');
    categories.value = response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

// Function to add a new category
const addCategory = async () => {
  try {
    const parsedCategory = categorySchema.parse(newCategory.value);
    const response = await axios.post('http://localhost:3000/categories', parsedCategory);
    categories.value.push(response.data);
    newCategory.value = {
      name: '',
      description: ''
    };
  } catch (error) {
    console.error('Error adding category:', error);
  }
};


// PRODUCT
const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  reference: z.string().min(1, "Reference is required"),
  price: z.number().min(0, "Price must be a positive number"),
  active: z.boolean(),
  description: z.string().optional()
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

// Fetch products and categories when the component is mounted
onMounted(() => {
  fetchProducts();
  fetchCategories();
});

</script>

<template>
  <div class="products">
    <div> 
      <h1>Products</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Reference</th>
            <th>Price</th>
            <th>Active</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id">
            <td>{{ product.name }}</td>
            <td>{{ product.reference }}</td>
            <td>{{ product.price }}</td>
            <td>{{ product.active }}</td>
            <td>{{ product.description }}</td>
          </tr>
        </tbody>
      </table>
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
  </div>
  <div class="categories">
    <div>
      <h1>Categories</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td>{{ category.name }}</td>
            <td>{{ category.description }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="addCategories">
      <h2>Add Categories</h2>
      <form @submit.prevent="addCategory">
        <label for="name">Name</label>
        <input v-model="newCategory.name" type="text" id="name" name="name" required>

        <label for="description">Description</label>
        <textarea v-model="newCategory.description" id="description" name="description"></textarea>

        <button type="submit">Add Category</button>
      </form>
    </div>

  </div>
</template>

<style scoped>
/* Add your styles here */
</style>
