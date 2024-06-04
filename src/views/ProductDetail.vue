<template>
    <div class="product-page">
      <!-- Affichage des détails du produit -->
      <div class="product-details">
        <h2>{{ product.name }}</h2>
        <img :src="product.image" alt="Product Image" class="product-image" />
        <p class="product-description">{{ product.description }}</p>
        <p class="product-price">Price: ${{ parseInt(product.price) }}</p>
        <button @click="addToCart" class="add-to-cart">Add to Cart</button>
        <button @click="toggleFavorite" class="favorite-button" :class="{ 'favorited': isFavorite }">
          {{ isFavorite ? 'Remove from Favorites' : 'Add to Favorites' }}
        </button>
      </div>
  
      <!-- Section des commentaires -->
      <div class="comments-section">
        <div class="comments-header" @click="toggleComments">
          <h3>Avis</h3>
          <span class="toggle-icon">{{ showComments ? '▲' : '▼' }}</span>
        </div>
        <ul class="comment-list" v-show="showComments">
          <li v-for="comment in product.comments" :key="comment.id" class="comment">
            <span class="comment-author">{{ comment.author }}</span>
            <p class="comment-text">{{ comment.text }}</p>
          </li>
        </ul>
        <form @submit.prevent="addComment" class="comment-form" v-show="showComments">
          <input v-model="newComment.author" type="text" placeholder="Your Name" required />
          <textarea v-model="newComment.text" placeholder="Your Comment" required></textarea>
          <button type="submit">Add Comment</button>
        </form>
      </div>
    </div>

    <div class="comments-section">
      <div class="comments-header" @click="toggleComments">
        <h3>Avis</h3>
        <span class="toggle-icon">{{ showComments ? '▲' : '▼' }}</span>
      </div>
      <ul class="comment-list" v-show="showComments">
    
      </ul>
   
    </div>
</template>

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
  }
};

fetchProductById(productId.value);

const addToCart = async () => {
  try {
    const response = await axios.post('http://localhost:3000/cart', {
      productId: product.value.id,
      quantity: 1
    }, {
      headers: {
        Authorization: 'Bearer YOUR_TOKEN_HERE'
      }
    });
    console.log('Product added to cart:', response.data);
  } catch (error) {
    console.error('Error adding product to cart:', error);
  }
};
</script>

<style scoped>
.product-page {
  display: flex;
  justify-content: space-between;
}

.product-details {
  flex: 1;
  margin-right: 20px;
}

.product-image {
  width: 100%;
  max-width: 300px;
}

.product-description {
  margin-top: 10px;
}

.add-to-cart,
.favorite-button {
  margin-top: 10px;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.favorite-button.favorited {
  background-color: #dc3545;
}

.comments-section {
  flex: 1;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.toggle-icon {
  font-size: 1.5rem;
}

.comment-list {
  list-style: none;
  padding: 0;
  margin-top: 10px;
}

.comment {
  margin-bottom: 15px;
}

.comment-author {
  font-weight: bold;
}

.comment-text {
  margin-top: 5px;
}

.comment-form {
  margin-top: 20px;
}

.comment-form input,
.comment-form textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.comment-form button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
