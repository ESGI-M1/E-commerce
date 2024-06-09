<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const productId = ref(route.params.id);

const product = ref({
  name: '',
  image: '',
  description: '',
  price: 0,
  comments: []
});

const fetchProductById = async (id) => {
  try {
    const response = await axios.get(`http://localhost:3000/products/${id}`);
    console.log('Product data:', response.data);
    product.value = response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    alert('There was an error fetching the product details. Please try again later.');
  }
};

onMounted(() => {
  fetchProductById(productId.value);
});

const addToCart = async () => {
  try {
    const response = await axios.post('http://localhost:3000/cart', {
      productId: product.value.id,
      quantity: 1
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}` // Assurez-vous que le token est stocké après connexion
      }
    });
    console.log('Product added to cart:', response.data);
    alert('Product added to cart successfully');
  } catch (error) {
    console.error('Error adding product to cart:', error);
  }
};
</script>

<template>
  <div class="product-page">
    <div class="product-details" v-if="product.name">
      <h2>{{ product.name }}</h2>
      <img :src="product.image" alt="Product Image" class="product-image" />
      <p class="product-description">{{ product.description }}</p>
      <p class="product-price">Price: ${{ parseInt(product.price) }}</p>
      <button @click="addToCart" class="add-to-cart">Add to Cart</button>
    </div>

    <div class="comments-section">
      <div class="comments-header">
        <h3>Avis</h3>
      </div>
      <ul class="comment-list">
        <li v-for="comment in (product.comments || [])" :key="comment.id" class="comment">
          <span class="comment-author">{{ comment.author }}</span>
          <p class="comment-text">{{ comment.text }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.product-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.product-details {
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
  text-align: center;
}

.product-image {
  width: 100%;
  max-width: 400px;
  margin: 20px 0;
}

.product-description {
  margin-top: 10px;
}

.add-to-cart {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.add-to-cart:hover {
  background-color: #0056b3;
}

.comments-section {
  width: 100%;
  max-width: 600px;
  margin-top: 20px;
  text-align: left;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.comment-list {
  list-style: none;
  padding: 0;
  margin-top: 10px;
}

.comment {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.comment-author {
  font-weight: bold;
}

.comment-text {
  margin-top: 5px;
}
</style>
