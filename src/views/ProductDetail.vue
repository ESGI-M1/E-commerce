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
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import axios from 'axios';
  
  const route = useRoute();
  const router = useRouter();
  
  const productId = ref(route.params.id);
 // const product = ref(null);

  const product = ref({
  id: 1,
  name: 'Product Name',
  image: '/path/to/product/image.jpg',
  description: 'Product Description',
  price: 19.99,
  comments: [
    { id: 1, author: 'User 1', text: 'Comment 1' },
    { id: 2, author: 'User 2', text: 'Comment 2' }
  ]
});

// Nouveau commentaire
const newComment = ref({
  author: '',
  text: ''
});
  
  // Fonction pour récupérer un produit par son ID depuis l'API
  const fetchProductById = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/products/${id}`);
      product.value = response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };
  
  // Appeler fetchProductById lorsque le composant est monté pour récupérer le produit
  onMounted(() => {
    fetchProductById(productId.value);
  });
  </script>
  
  <style scoped>
/* Styles */
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
  display: none;
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
