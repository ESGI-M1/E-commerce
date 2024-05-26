<script lang="ts" setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import { z } from 'zod';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

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
    if (products.value.length === 0) {
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

// Function to generate dummy data
const generateDummyData = () => {
  const dummyProducts = [
    { id: 1, name: 'Product 1', reference: 'REF001', price: 10, active: true, description: 'Description of Product 1' },
    { id: 2, name: 'Product 2', reference: 'REF002', price: 20, active: false, description: 'Description of Product 2' },
    { id: 3, name: 'Product 3', reference: 'REF003', price: 30, active: true, description: 'Description of Product 3' }
  ];
  
  for (const product of dummyProducts) {
    products.value.push(product);
  }
};

const showProductDetails = (id) => {
  router.push({ name: 'ProductDetail', params: { id } });
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
      <div 
        v-for="product in products" 
        :key="product.id" 
        class="product-card"
        @click="showProductDetails(product.id)"
      >
        <img :src="product.image" alt="Product Image" class="product-image" />
        <div class="product-info">
          <h2>{{ product.name }}</h2>
          <p>{{ product.description }}</p>
          <p class="product-price">${{ product.price.toFixed(2) }}</p>
        </div>
      </div>
    </div>
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
</template>

<style scoped>
.products {
  padding: 20px;
}

.product-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.product-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  width: calc(33.333% - 20px);
  cursor: pointer;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: scale(1.05);
}

.product-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.product-info {
  padding: 15px;
}

.product-price {
  font-weight: bold;
  color: #2c3e50;
}

.product-details {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.details-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.details-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  z-index: 1;
  max-width: 600px;
  width: 100%;
}

.details-content img {
  max-width: 100%;
  height: auto;
  margin-bottom: 15px;
}

.details-content button {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}
</style>
