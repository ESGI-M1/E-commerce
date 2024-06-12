<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const productId = ref(route.params.id);

const product = ref({
  id: '',
  name: '',
  imageSrc: '', // Utilisation de imageSrc pour stocker l'URL de l'image
  description: '',
  price: 0,
  reference: '',
  comments: []
});

const fetchProductById = async (id) => {
  try {
    const response = await axios.get(`http://localhost:3000/products/${id}`);
    product.value = response.data;

    // Fetch the image for the product
    if (product.value.id) {
      const imageResponse = await axios.get(`http://localhost:3000/products/${product.value.id}/images`);
      if (imageResponse.data && imageResponse.data.length > 0) {
        product.value.imageSrc = imageResponse.data[0].url;
      } else {
        product.value.imageSrc = '../../produit_avatar.jpg';
      }
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    alert('There was an error fetching the product details. Please try again later.');
  }
};

const addToCart = async (quantity) => {
  let userId;
  const isAuthenticated = localStorage.getItem('authToken') ? localStorage.getItem('authToken') : null;
  if (isAuthenticated) {
    userId = isAuthenticated;
  } else {
    if (localStorage.getItem('temporaryId')) {
      userId = localStorage.getItem('temporaryId');
    } else {
      userId = Math.floor(Math.random() * 2147483647).toString();
      localStorage.setItem('temporaryId', userId);
    }
  }

  try {
    const response = await axios.post('http://localhost:3000/carts', {
      userId: userId,
      productId: product.value.id,
      quantity: quantity
    });
    alert('Product added to cart successfully');
    router.push('/cart');
  } catch (error) {
    alert('Failed to add product to cart');
  }
};

onMounted(() => {
  fetchProductById(productId.value);
});
</script>

<template>
  <div class="product-page">
    <div class="product-image-container">
      <img :src="product.imageSrc" :alt="product.name" class="product-image" />
    </div>
    <div class="product-info">
      <h2>{{ product.name }}</h2>
      <p>{{ product.description }}</p>
      <p><strong>Prix :</strong> ${{ parseFloat(product.price).toFixed(2) }}</p>
      <div v-if="product.reference === 'chaussure'" class="sizes-container">
        <p><strong>Tailles disponibles :</strong></p>
        <div class="size" v-for="size in ['38', '39', '40', '41', '42', '43']" :key="size" @click="selectSize(size)">{{ size }}</div>
      </div>
      <div class="button-container">
        <button @click="() => addToCart(1)" class="add-to-cart">Ajouter au Panier</button>
        <button @click="addToFavorites" class="add-to-favorites"><i class="fas fa-heart"></i> Ajouter aux Favoris</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-page {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.product-image-container {
  margin-right: 20px;
}

.product-image {
  max-width: 600px;
  width: 100%;
  height: auto;
}

.product-info {
  text-align: center;
}

.product-info h2 {
  margin-top: 0;
}

.product-info p {
  margin-bottom: 10px;
}

.sizes-container {
  margin-top: 20px;
}

.size {
  display: inline-block;
  background-color: #eee;
  padding: 5px 10px;
  margin-right: 10px;
  border-radius: 5px;
  cursor: pointer;
}

.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.add-to-cart,
.add-to-favorites {
  padding: 10px 30px;
  margin: 0 10px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-to-cart {
  background-color: #000;
  color: white;
}

.add-to-favorites {
  background-color: #ff99cc;
  color: white;
  display: flex;
  align-items: center;
}

.fa-heart {
  margin-right: 5px;
}

.add-to-cart:hover,
.add-to-favorites:hover {
  opacity: 0.8;
}
</style>
