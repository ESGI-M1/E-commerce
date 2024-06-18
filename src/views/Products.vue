<script lang="ts" setup>
import ProductList from './ProductList.vue';

import axios from 'axios';
import { ref, onMounted } from 'vue';
import { z } from 'zod';
import { useRoute, useRouter } from 'vue-router';
import { useProductsStore } from '@/store/products';

const productsStore = useProductsStore();
const route = useRoute();
const router = useRouter();

// CATEGORY
const categorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional()
});

const categories = ref([]);
const newCategory = ref({
  name: '',
  slug: '',
  description: '',
  parentCategoryId: null
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
      slug: '',
      description: '',
      parentCategoryId: null
    };
  } catch (error) {
    console.error('Error adding category:', error);
  }
};

// Function to modify a category
const modifyCategory = async (category) => {
  try {
    const parsedCategory = categorySchema.parse(category);
    await axios.patch(`http://localhost:3000/categories/${category.id}`, parsedCategory);
  } catch (error) {
    console.error('Error modifying category:', error);
  }
};

// Function to delete a category
const deleteCategory = async (category) => {
  try {
    await axios.delete(`http://localhost:3000/categories/${category.id}`);
    categories.value = categories.value.filter((c) => c.id !== category.id);
  } catch (error) {
    console.error('Error deleting category:', error);
  }
};


// PRODUCT
const productSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  reference: z.string().min(1, "Reference is required"),
  price: z.number().min(0, "Price must be a positive number"),
  active: z.boolean(),
  description: z.string().optional(),
  Categories: z.array(z.number()).optional(),
  Images: z.array(z.number()).optional(),
  createdAt: z.string().time().optional(),
  updateTimestamp: z.string().time().optional()
});

const newProduct = ref({
  name: '',
  reference: '',
  price: 0,
  active: false,
  description: '',
  Categories: [],
});

// Function to fetch products
const fetchProducts = async () => {
  try {
    console.log('Fetching products');
    const response = await axios.get('http://localhost:3000/products');
    productsStore.setProducts(response.data);
    if (productsStore.count === 0) {
      generateDummyData();
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    generateDummyData();
  }
};

// Function to add a new product
const addProduct = async () => {
  try {
    const parsedProduct = productSchema.parse(newProduct.value);
    console.log(parsedProduct);
    const response = await axios.post('http://localhost:3000/products', parsedProduct);
    productsStore.addProduct(response.data);
    newProduct.value = {
      name: '',
      reference: '',
      price: 0,
      active: false,
      description: '',
      Categories: [],
    };
  } catch (error) {
    console.error('Error adding product:', error);
  }
};

//; Function to modify a product
const modifyProduct = async (product) => {
  try {
    console.log(product);
    //const parsedProduct = productSchema.parse(product);
    await axios.put(`http://localhost:3000/products/${product.id}`, product);
  } catch (error) {
    console.error('Error modifying product:', error);
  }
};

// Function to delete a product
const deleteProduct = async (product) => {
  try {
    await axios.delete(`http://localhost:3000/products/${product.id}`);
    productsStore.removeProduct(product);
  } catch (error) {
    console.error('Error deleting product:', error);
  }
};


// Function to generate dummy data
const dummyNumber = ref(3);
const generateDummyData = () => {

  for (let i = 0; i < dummyNumber.value; i++) {
    console.log('Generating dummy data');
    const product = {
      id: productsStore.count + i + 1,
      name: `Product ${i + 1}`,
      reference: `REF00${i + 1}`,
      price: Math.random() * 100,
      active: i % 2 === 0,
      description: `Description of Product ${i + 1}`,
    };
    productsStore.addProduct(product);
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
    <h1>Products</h1>
    <div class="product-grid">
      <ProductList />
    </div>
  </div>

    <div class="generateProducts">
      <form @submit.prevent="generateDummyData()">
        <label for="dummyNumber">Number of Products</label>
        <input type="number" v-model="dummyNumber" min="1" max="100">
        <button type="submit">Generate Products</button>
      </form>
    </div>

    <div class="addProducts">
      <h2>Add Products</h2>
      <form @submit.prevent="addProduct">
        <label for="name">Name</label>
        <input v-model="newProduct.name" type="text" id="name" name="name" required>

        <label for="reference">Reference</label>
        <input v-model="newProduct.reference" type="text" id="reference" name="reference" required>

        <label for="price">Price</label>
        <input v-model="newProduct.price" type="number" id="price" name="price" min="0" required>

        <label for="active">Active</label>
        <input v-model="newProduct.active" type="checkbox" id="active" name="active">

        <label for="description">Description</label>
        <textarea v-model="newProduct.description" id="description" name="description"></textarea>

        <label for="categories">Categories</label>
        <select id="categories" name="categories" v-model="newProduct.Categories" multiple>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>

        <button type="submit">Add Product</button>
      </form>
    </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Reference</th>
            <th>Price</th>
            <th>Active</th>
            <th>Description</th>
            <th>Categories</th>
            <th>RAW DATA</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in productsStore.products" :key="product.id">
            <td> <input v-model="product.name" type="text" required> </td>
            <td> <input v-model="product.reference" type="text" required> </td>
            <td> <input v-model.number="product.price" type="number" required min="0"> </td>
            <td> <input v-model="product.active" type="checkbox"> </td>
            <td> <input v-model="product.description" type="text"> </td>
            <td>
              <select v-model="product.Categories" multiple>
                <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
              </select>
            </td>
            <td> {{ product}} </td>
            <td>
              <button @click="modifyProduct(product)">Modify</button>
              <button @click="deleteProduct(product)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
  <div class="categories">
    <div>
      <h1>Categories</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Description</th>
            <th>parentId</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td> <input v-model="category.name" type="text" required> </td>
            <td> <input v-model="category.slug" type="text" required> </td>
            <td> <input v-model="category.description" type="text"> </td>
            <td>
              <select v-model="category.parentCategoryId">
                <option value="">None</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
              </select>
            </td>
            <td>
              <button @click="modifyCategory(category)">Modify</button>
              <button @click="deleteCategory(category)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
    <div class="addCategories">
      <h2>Add Categories</h2>
      <form @submit.prevent="addCategory">
        <label for="name">Name</label>
        <input v-model="newCategory.name" type="text" id="name" name="name" required>

        <label for="slug">Slug</label>
        <input v-model="newCategory.slug" type="text" id="slug" name="slug" required>

        <label for="description">Description</label>
        <textarea v-model="newCategory.description" id="description" name="description"></textarea>

        <label for="parentId">Parent Category</label>
        <select id="parentId" name="parentId" v-model="newCategory.parentCategoryId">
          <option value="">None</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>

        <button type="submit">Add Category</button>
      </form>
    </div>
</template>

<style scoped>
  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    border: 1px solid black;
    padding: 4px;
  }

  .products {
    padding: 20px;
  }

  .product-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
</style>
